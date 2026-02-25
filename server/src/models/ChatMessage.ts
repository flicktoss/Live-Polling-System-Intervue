import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  senderName: string;
  senderId: string;
  message: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    senderName: { type: String, required: true },
    senderId: { type: String, required: true },
    message: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
