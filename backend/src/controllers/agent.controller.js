const { runAgent } = require('../ai/agent');
const Conversation = require('../models/Conversation');

// POST /api/agent/chat
const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'message is required' });
    }

    const agentResponse = await runAgent({
      userMessage: message,
      history,
      userId: req.user.id,
    });

    // Persist conversation
    const conversation = await Conversation.create({
      userId: req.user.id,
      message,
      response: agentResponse.content,
    });

    res.json({
      response: agentResponse.content,
      conversationId: conversation.id,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/agent/history
const getHistory = async (req, res, next) => {
  try {
    const conversations = await Conversation.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat, getHistory };
