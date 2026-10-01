const express = require('express');
const router = express.Router();
const { chat, getHistory } = require('../controllers/agent.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/chat', chat);
router.get('/history', getHistory);

module.exports = router;
