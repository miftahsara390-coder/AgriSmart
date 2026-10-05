const { Op } = require('sequelize');
const Task = require('../models/Task');
const Crop = require('../models/Crop');
const SensorData = require('../models/SensorData');

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
const getTasks = async (req, res, next) => {
  try {
    const { status, cropId, from, to } = req.query;
    const where = { userId: req.user.id };

    if (status && status !== 'all') where.status = status;
    if (cropId) where.cropId = cropId;

    // Date range filtering
    if (from || to) {
      const dateFilter = {};
      if (from) dateFilter[Op.gte] = from;
      if (to) dateFilter[Op.lte] = to;
      where[Op.or] = [
        { date: dateFilter },
        { dueDate: dateFilter },
      ];
    }

    const tasks = await Task.findAll({
      where,
      include: [{ model: Crop, attributes: ['id', 'name', 'location'] }],
      order: [['date', 'ASC'], ['dueDate', 'ASC'], ['createdAt', 'DESC']],
    });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/tasks/calendar?date=YYYY-MM-DD ──────────────────────────────────
const getCalendarTasks = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'date query parameter is required (YYYY-MM-DD)' });
    }

    const tasks = await Task.findAll({
      where: {
        userId: req.user.id,
        [Op.or]: [
          { date },
          { dueDate: date },
        ],
      },
      include: [{ model: Crop, attributes: ['id', 'name', 'location'] }],
      order: [['time', 'ASC'], ['createdAt', 'ASC']],
    });

    res.json({ date, tasks });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/tasks/recommendation ────────────────────────────────────────────
const getTaskRecommendation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const crops = await Crop.findAll({ where: { userId } });

    let moisture = 38;
    if (crops.length > 0) {
      const sensor = await SensorData.findOne({
        where: { cropId: { [Op.in]: crops.map(c => c.id) } },
        order: [['recordedAt', 'DESC']],
      });
      if (sensor && sensor.soilMoisture != null) {
        moisture = sensor.soilMoisture;
      }
    }

    const primaryCropName = crops[0]?.name || 'Tomato Field 1';

    res.json({
      recommendation: `Based on your crops and current conditions, irrigation is recommended tomorrow morning.`,
      details: [
        `Root zone moisture is currently at ${moisture}% in ${primaryCropName}.`,
        `Projected peak temperature reaches 26°C with moderate evapotranspiration.`,
        `Recommended: 3.5 Liters/plant at 07:30 AM via drip lines to safeguard flowering.`
      ],
      suggestedTask: {
        title: 'Drip Line Irrigation',
        type: 'Irrigation',
        cropField: primaryCropName,
        time: '07:30 AM',
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Crop, attributes: ['id', 'name'] }],
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const { title, description, date, dueDate, time, type, priority, cropId } = req.body;

    if (!title) return res.status(400).json({ message: 'title is required' });

    // Verify crop ownership if cropId is provided
    if (cropId) {
      const crop = await Crop.findOne({ where: { id: cropId, userId: req.user.id } });
      if (!crop) return res.status(403).json({ message: 'Crop not found or access denied' });
    }

    const task = await Task.create({
      userId: req.user.id,
      title,
      description,
      date: date || dueDate,
      dueDate: dueDate || date,
      time,
      type: type || 'other',
      priority: priority || 'medium',
      cropId: cropId || null,
    });

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Support marking as completed via `completed: true`
    const updates = { ...req.body };
    if (updates.completed === true) updates.status = 'done';
    if (updates.completed === false) updates.status = 'pending';

    await task.update(updates);
    res.json({ message: 'Task updated', task });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getCalendarTasks,
  getTaskRecommendation,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
