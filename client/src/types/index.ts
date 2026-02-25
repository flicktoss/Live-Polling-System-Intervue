export interface PollOption {
  text: string;
  isCorrect?: boolean;
}

export interface PollResultOption {
  text: string;
  isCorrect: boolean;
  count: number;
  percentage: number;
}

export interface PollQuestion {
  pollId: string;
  question: string;
  options: PollOption[];
  timer: number;
  questionNumber: number;
}

export interface PollResults {
  pollId: string;
  question: string;
  questionNumber: number;
  totalAnswers: number;
  results: PollResultOption[];
}

export interface Participant {
  socketId: string;
  name: string;
  role: 'teacher' | 'student';
}

export interface ChatMessage {
  _id: string;
  senderName: string;
  senderId: string;
  message: string;
  createdAt: string;
}

export interface PollHistoryItem {
  _id: string;
  question: string;
  questionNumber: number;
  timer: number;
  totalAnswers: number;
  results: PollResultOption[];
  isActive: boolean;
  createdAt: string;
}
