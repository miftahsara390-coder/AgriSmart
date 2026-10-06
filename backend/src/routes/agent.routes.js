const express = require('express');
const router = express.Router();
const { chat, getHistory, clearHistory } = require('../controllers/agent.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/chat', chat);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

module.exports = router;
