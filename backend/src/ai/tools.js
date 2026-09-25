const Crop = require('../models/Crop');
const Task = require('../models/Task');

// ─── Tool Definitions (Function Calling) ────────────────────────────────────

const toolDefinitions = [
  {
    type: 'function',
    function: {
      name: 'getUserCrops',
      description: 'Get the list of crops belonging to the current user',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCropDetails',
      description: 'Get detailed information about a specific crop by ID',
      parameters: {
        type: 'object',
        properties: {
          cropId: { type: 'string', description: 'The UUID of the crop' },
        },
        required: ['cropId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getAgriculturalTasks',
      description: 'Get the agricultural tasks for the current user, optionally filtered by cropId or status',
      parameters: {
        type: 'object',
        properties: {
          cropId: { type: 'string', description: 'Filter tasks by crop ID (optional)' },
          status: {
            type: 'string',
            enum: ['pending', 'done', 'cancelled'],
            description: 'Filter by task status (optional)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createTask',
      description: 'Create a new agricultural task. Only call this after the user has confirmed.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Task title' },
          description: { type: 'string', description: 'Task description (optional)' },
          cropId: { type: 'string', description: 'Associated crop ID (optional)' },
          dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD format (optional)' },
          type: {
            type: 'string',
            enum: ['watering', 'fertilizing', 'harvesting', 'planting', 'pesticide', 'other'],
          },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateTask',
      description: 'Update an existing task. Only call this after the user has confirmed.',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'The UUID of the task to update' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'done', 'cancelled'] },
          dueDate: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: ['taskId'],
      },
    },
  },
];

// ─── Tool Executor ────────────────────────────────────────────────────────────

const executeTool = async (toolName, args, userId) => {
  switch (toolName) {
    case 'getUserCrops': {
      const crops = await Crop.findAll({
        where: { userId },
        attributes: ['id', 'name', 'variety', 'status', 'plantedAt'],
      });
      return { crops };
    }

    case 'getCropDetails': {
      const crop = await Crop.findOne({
        where: { id: args.cropId, userId },
        include: [{ model: Task, attributes: ['id', 'title', 'status', 'dueDate', 'type'] }],
      });
      if (!crop) return { error: 'Crop not found' };
      return { crop };
    }

    case 'getAgriculturalTasks': {
      const where = { userId };
      if (args.cropId) where.cropId = args.cropId;
      if (args.status) where.status = args.status;

      const tasks = await Task.findAll({
        where,
        include: [{ model: Crop, attributes: ['id', 'name'] }],
        order: [['dueDate', 'ASC']],
      });
      return { tasks };
    }

    case 'createTask': {
      const task = await Task.create({ ...args, userId });
      return { success: true, task };
    }

    case 'updateTask': {
      const { taskId, ...updates } = args;
      const task = await Task.findOne({ where: { id: taskId, userId } });
      if (!task) return { error: 'Task not found' };
      await task.update(updates);
      return { success: true, task };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
};

module.exports = { toolDefinitions, executeTool };


