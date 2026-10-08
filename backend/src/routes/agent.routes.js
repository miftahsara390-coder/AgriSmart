import express from 'express';
import { chat, getHistory, clearHistory } from '../controllers/agent.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/chat', chat);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

export { router };
export default router;
