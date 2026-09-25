const Task = require('../models/Task');
const Crop = require('../models/Crop');

// GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const { status, cropId } = req.query;
    const where = { userId: req.user.id };

    if (status) where.status = status;
    if (cropId) where.cropId = cropId;

    const tasks = await Task.findAll({
      where,
      include: [{ model: Crop, attributes: ['id', 'name'] }],
      order: [['dueDate', 'ASC']],
    });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.update(req.body);
    res.json({ message: 'Task updated', task });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };


