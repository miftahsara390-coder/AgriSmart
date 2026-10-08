import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.get('/profile', authMiddleware, getMe);

export { router };
export default router;
