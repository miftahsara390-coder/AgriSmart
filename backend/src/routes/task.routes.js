import express from 'express';
import {
  getTasks,
  getCalendarTasks,
  getTaskRecommendation,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// Calendar & Recommendation routes — must come before /:id
router.get('/calendar', getCalendarTasks);
router.get('/recommendation', getTaskRecommendation);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export { router };
export default router;
