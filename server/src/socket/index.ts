import { Server, Socket } from 'socket.io';
import pollService from '../services/PollService';
import chatService from '../services/ChatService';
import participantService from '../services/ParticipantService';

// Track active poll timer
let activeTimerInterval: ReturnType<typeof setInterval> | null = null;
let activeTimerRemaining = 0;

export const setupSocketHandlers = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // ---- JOIN ----
    socket.on('join', async (data: { name: string; role: 'teacher' | 'student' }) => {
      try {
        const { name, role } = data;
        if (!name || !role) {
          socket.emit('error_message', { message: 'Name and role are required' });
          return;
        }

        // Check if teacher slot is available
        if (role === 'teacher') {
          const blocked = participantService.canTeacherJoin(io);
          if (blocked) {
            socket.emit('error_message', { message: blocked });
            return;
          }
        }

        participantService.addParticipant(socket.id, name, role);

        socket.emit('joined', { id: socket.id, name, role });
        io.emit('participants_update', participantService.getAllParticipants());

        // Send active poll state to the joining user
        const activePoll = await pollService.getActivePoll();
        if (activePoll) {
          socket.emit('new_question', {
            pollId: activePoll._id.toString(),
            question: activePoll.question,
            options: activePoll.options.map((o) => ({ text: o.text })),
            timer: activeTimerRemaining > 0 ? activeTimerRemaining : activePoll.timer,
            questionNumber: activePoll.questionNumber,
          });

          if (activeTimerRemaining <= 0) {
            socket.emit('poll_results', pollService.calculateResults(activePoll));
          } else {
            socket.emit('live_results', pollService.calculateResults(activePoll));
          }
        } else if (role === 'teacher') {
          const lastPoll = await pollService.getLastFinishedPoll();
          if (lastPoll) {
            socket.emit('poll_results', pollService.calculateResults(lastPoll));
          }
        }

        // Send chat history
        const chatHistory = await chatService.getChatHistory();
        socket.emit('chat_history', chatHistory);
      } catch (error) {
        console.error('Join error:', error);
        socket.emit('error_message', { message: 'Failed to join' });
      }
    });

    // ---- CREATE POLL (Teacher only) ----
    socket.on(
      'create_poll',
      async (data: {
        question: string;
        options: { text: string; isCorrect: boolean }[];
        timer: number;
      }) => {
        try {
          const participant = participantService.getParticipant(socket.id);
          if (!participant || participant.role !== 'teacher') {
            socket.emit('error_message', { message: 'Only teachers can create polls' });
            return;
          }

          // Validate
          const validationError = pollService.validateCreatePoll(data);
          if (validationError) {
            socket.emit('error_message', { message: validationError });
            return;
          }

          // Deactivate existing polls and clear timer
          await pollService.deactivateAllPolls();
          if (activeTimerInterval) {
            clearInterval(activeTimerInterval);
            activeTimerInterval = null;
          }

          // Create poll
          const poll = await pollService.createPoll(data);
          activeTimerRemaining = data.timer;

          // Broadcast to all
          io.emit('new_question', {
            pollId: poll._id.toString(),
            question: poll.question,
            options: poll.options.map((o) => ({ text: o.text })),
            timer: data.timer,
            questionNumber: poll.questionNumber,
          });

          // Start countdown
          activeTimerInterval = setInterval(async () => {
            activeTimerRemaining--;
            io.emit('timer_update', { remaining: activeTimerRemaining });

            if (activeTimerRemaining <= 0) {
              if (activeTimerInterval) {
                clearInterval(activeTimerInterval);
                activeTimerInterval = null;
              }
              const updatedPoll = await pollService.deactivatePoll(poll._id.toString());
              if (updatedPoll) {
                io.emit('poll_results', pollService.calculateResults(updatedPoll));
              }
            }
          }, 1000);
        } catch (error) {
          console.error('Create poll error:', error);
          socket.emit('error_message', { message: 'Failed to create poll' });
        }
      }
    );

    // ---- SUBMIT ANSWER (Student only) ----
    socket.on(
      'submit_answer',
      async (data: { pollId: string; selectedOption: number }) => {
        try {
          const participant = participantService.getParticipant(socket.id);
          if (!participant || participant.role !== 'student') {
            socket.emit('error_message', { message: 'Only students can submit answers' });
            return;
          }

          const { pollId, selectedOption } = data;
          if (typeof selectedOption !== 'number' || selectedOption < 0) {
            socket.emit('error_message', { message: 'Invalid option selected' });
            return;
          }

          // Atomic submit
          const updatedPoll = await pollService.submitAnswer({
            pollId,
            studentId: socket.id,
            studentName: participant.name,
            selectedOption,
          });

          if (!updatedPoll) {
            const reason = await pollService.getSubmitFailureReason(pollId, socket.id);
            socket.emit('error_message', { message: reason });
            return;
          }

          // Validate bounds
          if (selectedOption >= updatedPoll.options.length) {
            await pollService.rollbackAnswer(pollId, socket.id);
            socket.emit('error_message', { message: 'Invalid option selected' });
            return;
          }

          socket.emit('answer_submitted', { message: 'Answer submitted successfully' });
          io.emit('live_results', pollService.calculateResults(updatedPoll));
        } catch (error) {
          console.error('Submit answer error:', error);
          socket.emit('error_message', { message: 'Failed to submit answer' });
        }
      }
    );

    // ---- CHAT MESSAGE ----
    socket.on('send_message', async (data: { message: string }) => {
      try {
        const participant = participantService.getParticipant(socket.id);
        if (!participant) {
          socket.emit('error_message', { message: 'You must join first' });
          return;
        }

        const validationError = chatService.validateMessage(data.message);
        if (validationError) {
          socket.emit('error_message', { message: validationError });
          return;
        }

        const chatMsg = await chatService.saveMessage(
          participant.name,
          socket.id,
          data.message
        );
        io.emit('new_chat_message', chatMsg);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error_message', { message: 'Failed to send message' });
      }
    });

    // ---- KICK STUDENT (Teacher only) ----
    socket.on('kick_student', (data: { studentId: string }) => {
      try {
        const error = participantService.kickStudent(socket.id, data.studentId, io);
        if (error) {
          socket.emit('error_message', { message: error });
          return;
        }
        io.emit('participants_update', participantService.getAllParticipants());
      } catch (err) {
        console.error('Kick student error:', err);
        socket.emit('error_message', { message: 'Failed to kick student' });
      }
    });

    // ---- DISCONNECT ----
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      participantService.removeParticipant(socket.id);
      io.emit('participants_update', participantService.getAllParticipants());
    });
  });
};
