import Poll from '../models/Poll';

interface CreatePollData {
  question: string;
  options: { text: string; isCorrect: boolean }[];
  timer: number;
}

interface SubmitAnswerData {
  pollId: string;
  studentId: string;
  studentName: string;
  selectedOption: number;
}

interface PollResultOption {
  text: string;
  isCorrect: boolean;
  count: number;
  percentage: number;
}

interface PollResultResponse {
  pollId: string;
  question: string;
  questionNumber: number;
  totalAnswers: number;
  results: PollResultOption[];
}

class PollService {
  /**
   * Validate poll creation data
   */
  validateCreatePoll(data: CreatePollData): string | null {
    const { question, options, timer } = data;

    if (!question || !question.trim()) return 'Question is required';
    if (!options || options.length < 2) return 'At least 2 options are required';
    if (options.some((o) => !o.text || !o.text.trim())) return 'All options must have text';
    if (!timer || timer < 5 || timer > 300) return 'Timer must be between 5 and 300 seconds';
    if (!options.some((o) => o.isCorrect)) return 'At least one option must be marked as correct';

    return null;
  }

  /**
   * Deactivate all currently active polls
   */
  async deactivateAllPolls(): Promise<void> {
    await Poll.updateMany({ isActive: true }, { isActive: false });
  }

  /**
   * Create a new poll
   */
  async createPoll(data: CreatePollData) {
    const pollCount = await Poll.countDocuments();
    const questionNumber = pollCount + 1;

    const poll = await Poll.create({
      question: data.question.trim(),
      options: data.options,
      timer: data.timer,
      questionNumber,
      isActive: true,
    });

    return poll;
  }

  /**
   * Get the currently active poll
   */
  async getActivePoll() {
    return Poll.findOne({ isActive: true }).sort({ createdAt: -1 });
  }

  /**
   * Get the most recent finished poll
   */
  async getLastFinishedPoll() {
    return Poll.findOne({ isActive: false }).sort({ createdAt: -1 });
  }

  /**
   * Submit an answer atomically (prevents duplicate votes)
   */
  async submitAnswer(data: SubmitAnswerData) {
    const { pollId, studentId, studentName, selectedOption } = data;

    const updatedPoll = await Poll.findOneAndUpdate(
      {
        _id: pollId,
        isActive: true,
        'answers.studentId': { $ne: studentId },
      },
      {
        $push: {
          answers: {
            studentName,
            studentId,
            selectedOption,
            answeredAt: new Date(),
          },
        },
      },
      { new: true }
    );

    return updatedPoll;
  }

  /**
   * Determine why a submit failed
   */
  async getSubmitFailureReason(pollId: string, studentId: string): Promise<string> {
    const poll = await Poll.findById(pollId);
    if (!poll) return 'Poll not found';
    if (!poll.isActive) return 'This poll has ended';
    return 'You have already answered this question';
  }

  /**
   * Rollback an invalid answer
   */
  async rollbackAnswer(pollId: string, studentId: string): Promise<void> {
    await Poll.findByIdAndUpdate(pollId, {
      $pull: { answers: { studentId } },
    });
  }

  /**
   * Mark a poll as inactive
   */
  async deactivatePoll(pollId: string) {
    const poll = await Poll.findById(pollId);
    if (poll) {
      poll.isActive = false;
      await poll.save();
    }
    return poll;
  }

  /**
   * Get all polls (for history)
   */
  async getAllPolls() {
    const polls = await Poll.find().sort({ createdAt: -1 });
    return polls.map((poll) => {
      const result = this.calculateResults(poll);
      return {
        ...result,
        _id: poll._id,
        timer: poll.timer,
        isActive: poll.isActive,
        createdAt: poll.createdAt,
      };
    });
  }

  /**
   * Get a single poll by ID
   */
  async getPollById(pollId: string) {
    return Poll.findById(pollId);
  }

  /**
   * Calculate poll results from a poll document
   */
  calculateResults(poll: any): PollResultResponse {
    const totalAnswers = poll.answers.length;
    const optionCounts = poll.options.map((_: any, index: number) => {
      return poll.answers.filter((a: any) => a.selectedOption === index).length;
    });

    const results = poll.options.map((option: any, index: number) => ({
      text: option.text,
      isCorrect: option.isCorrect,
      count: optionCounts[index],
      percentage: totalAnswers > 0 ? Math.round((optionCounts[index] / totalAnswers) * 100) : 0,
    }));

    return {
      pollId: poll._id,
      question: poll.question,
      questionNumber: poll.questionNumber,
      totalAnswers,
      results,
    };
  }
}

export default new PollService();
