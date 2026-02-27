// Socket.io Event Types

export interface ServerToClientEvents {
  joined: (data: { id: string; name: string; role: 'teacher' | 'student' }) => void;
  participants_update: (participants: Array<{ id: string; name: string; role: string }>) => void;
  new_question: (data: {
    pollId: string;
    question: string;
    options: { text: string }[];
    timer: number;
    questionNumber: number;
  }) => void;
  poll_results: (results: any) => void;
  live_results: (results: any) => void;
  chat_history: (messages: any[]) => void;
  chat_message: (message: any) => void;
  error_message: (data: { message: string }) => void;
  kicked_out: (data: { reason: string }) => void;
}

export interface ClientToServerEvents {
  join: (data: { name: string; role: 'teacher' | 'student' }) => void;
  create_poll: (data: {
    question: string;
    options: { text: string; isCorrect: boolean }[];
    timer: number;
  }) => void;
  submit_answer: (data: { pollId: string; optionIndex: number }) => void;
  end_poll: () => void;
  send_chat_message: (data: { content: string }) => void;
  kick_participant: (data: { participantId: string }) => void;
}
