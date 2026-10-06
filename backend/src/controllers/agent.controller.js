const { runAgent } = require('../ai/agent');
const Conversation = require('../models/Conversation');

// POST /api/agent/chat
const chat = async (req, res, next) => {
  try {
    const { message, history = [], image, mimeType } = req.body;

    if (!message && !image) {
      return res.status(400).json({ message: 'message or image is required' });
    }

    const agentResponse = await runAgent({
      userMessage: message || 'Please analyze this uploaded photo and provide agricultural advice.',
      history,
      userId: req.user?.id,
      image,
      mimeType,
    });

    let conversationId = null;
    if (req.user?.id) {
      // Persist conversation
      const conversation = await Conversation.create({
        userId: req.user.id,
        message: message || '[Attached photo for analysis]',
        response: agentResponse.content,
      });
      conversationId = conversation.id;
    }

    res.json({
      response: agentResponse.content,
      conversationId,
      model: agentResponse.model || 'gemini',
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
      order: [['createdAt', 'ASC']],
      limit: 50,
    });
    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/agent/history
const clearHistory = async (req, res, next) => {
  try {
    await Conversation.destroy({
      where: { userId: req.user.id },
    });
    res.json({ message: 'Conversation history cleared successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat, getHistory, clearHistory };
