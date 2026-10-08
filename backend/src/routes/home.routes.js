import express from 'express';
import { getHomeDashboard } from '../controllers/home.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getHomeDashboard);

export { router };
export default router;
