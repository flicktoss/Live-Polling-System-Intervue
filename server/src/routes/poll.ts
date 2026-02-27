import { Router, Request, Response } from 'express';
import pollService from '../services/PollService';

const router = Router();

// GET /api/polls - Get all polls (poll history)
router.get('/api/polls', async (_req: Request, res: Response) => {
  try {
    const pollHistory = await pollService.getAllPolls();
    res.json(pollHistory);
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ message: 'Failed to fetch polls' });
  }
});

// GET /api/polls/:id - Get single poll
router.get('/api/polls/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const poll = await pollService.getPollById(req.params.id as string);
    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }
    res.json(poll);
  } catch (error) {
    console.error('Get poll error:', error);
    res.status(500).json({ message: 'Failed to fetch poll' });
  }
});

// GET /api/chat - Chat history endpoint
router.get('/api/chat', async (_req: Request, res: Response) => {
  try {
    // Import chatService only when needed
    const chatService = (await import('../services/ChatService')).default;
    const chatHistory = await chatService.getChatHistory();
    res.json(chatHistory);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

export default router;
