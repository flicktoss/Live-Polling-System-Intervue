import mongoose, { Document, Schema } from 'mongoose';

export interface IOption {
  text: string;
  isCorrect: boolean;
}

export interface IPollAnswer {
  studentName: string;
  studentId: string;
  selectedOption: number;
  answeredAt: Date;
}

export interface IPoll extends Document {
  question: string;
  options: IOption[];
  timer: number;
  questionNumber: number;
  answers: IPollAnswer[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema<IOption>({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const PollAnswerSchema = new Schema<IPollAnswer>({
  studentName: { type: String, required: true },
  studentId: { type: String, required: true },
  selectedOption: { type: Number, required: true },
  answeredAt: { type: Date, default: Date.now },
});

const PollSchema = new Schema<IPoll>(
  {
    question: { type: String, required: true },
    options: { type: [OptionSchema], required: true, validate: [(v: IOption[]) => v.length >= 2, 'At least 2 options required'] },
    timer: { type: Number, required: true, min: 5, max: 300 },
    questionNumber: { type: Number, required: true },
    answers: { type: [PollAnswerSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure a student can only answer once per poll (used by atomic query filter)
PollSchema.index({ _id: 1, 'answers.studentId': 1 });

export default mongoose.model<IPoll>('Poll', PollSchema);
