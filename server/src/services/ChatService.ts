import ChatMessage from '../models/ChatMessage';

class ChatService {
  /**
   * Validate a chat message
   */
  validateMessage(message: string): string | null {
    if (!message || !message.trim()) return 'Message cannot be empty';
    if (message.length > 500) return 'Message too long (max 500 characters)';
    return null;
  }

  /**
   * Save a chat message to the database
   */
  async saveMessage(senderName: string, senderId: string, message: string) {
    const chatMsg = await ChatMessage.create({
      senderName,
      senderId,
      message: message.trim(),
    });

    return {
      _id: chatMsg._id,
      senderName: chatMsg.senderName,
      senderId: chatMsg.senderId,
      message: chatMsg.message,
      createdAt: chatMsg.createdAt,
    };
  }

  /**
   * Get recent chat history
   */
  async getChatHistory(limit = 50) {
    const messages = await ChatMessage.find().sort({ createdAt: -1 }).limit(limit);
    return messages.reverse();
  }
}

export default new ChatService();
