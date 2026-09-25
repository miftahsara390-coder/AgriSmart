const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { runAgent } = require('../ai/agent');

// POST /api/agent/chat
const chat = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        where: { id: conversationId, userId: req.user.id },
      });
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      conversation = await Conversation.create({
        userId: req.user.id,
        title: message.slice(0, 50),
      });
    }

    // Save user message
    await Message.create({
      conversationId: conversation.id,
      role: 'user',
      content: message,
    });

    // Load conversation history
    const history = await Message.findAll({
      where: { conversationId: conversation.id },
      order: [['createdAt', 'ASC']],
      limit: 20,
    });

    // Run the AI Agent
    const agentResponse = await runAgent({
      userMessage: message,
      history: history.map((m) => ({ role: m.role, content: m.content })),
      userId: req.user.id,
    });

    // Save assistant response
    await Message.create({
      conversationId: conversation.id,
      role: 'assistant',
      content: agentResponse.content,
    });

    res.json({
      conversationId: conversation.id,
      response: agentResponse.content,
      toolsUsed: agentResponse.toolsUsed || [],
      pendingConfirmation: agentResponse.pendingConfirmation || null,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/agent/conversations
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.findAll({
      where: { userId: req.user.id },
      order: [['updatedAt', 'DESC']],
    });
    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat, getConversations };


