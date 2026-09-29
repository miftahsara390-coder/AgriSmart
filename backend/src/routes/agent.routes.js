const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/agent.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/chat', chat);

module.exports = router;
