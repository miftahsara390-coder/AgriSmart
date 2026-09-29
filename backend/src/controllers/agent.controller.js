const { runAgent } = require('../ai/agent');

// POST /api/agent/chat
const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Run the AI Agent (stateless — history passed from client)
    const agentResponse = await runAgent({
      userMessage: message,
      history,
      userId: req.user.id,
    });

    res.json({
      response: agentResponse.content,
      toolsUsed: agentResponse.toolsUsed || [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat };
