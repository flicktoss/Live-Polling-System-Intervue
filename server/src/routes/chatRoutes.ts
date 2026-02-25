import { Router, Request, Response } from 'express';
import chatService from '../services/ChatService';

const router = Router();

// GET /api/chat - Get chat history
router.get('/', async (_req: Request, res: Response) => {
  try {
    const messages = await chatService.getChatHistory(100);
    res.json(messages);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Failed to fetch chat messages' });
  }
});

export default router;
