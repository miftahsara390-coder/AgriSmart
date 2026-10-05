const express = require('express');
const router = express.Router();
const {
  getTasks,
  getCalendarTasks,
  getTaskRecommendation,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

// Calendar & Recommendation routes — must come before /:id
router.get('/calendar', getCalendarTasks);
router.get('/recommendation', getTaskRecommendation);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
