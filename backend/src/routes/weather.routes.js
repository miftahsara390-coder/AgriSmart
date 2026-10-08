import express from 'express';
import { getWeatherData } from '../controllers/weather.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getWeatherData);

export { router };
export default router;
