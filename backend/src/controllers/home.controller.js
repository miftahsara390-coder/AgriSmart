const { Op } = require('sequelize');
const Task = require('../models/Task');
const Crop = require('../models/Crop');
const { getWeather } = require('../services/weather.service');

// GET /api/home
const getHomeDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Fetch in parallel
    const [weather, todayTasks, crops] = await Promise.all([
      getWeather('Beni Mellal').catch(() => null),
      Task.findAll({
        where: {
          userId,
          [Op.or]: [
            { date: today },
            { dueDate: today },
          ],
        },
        include: [{ model: Crop, attributes: ['id', 'name'] }],
        order: [['createdAt', 'ASC']],
        limit: 5,
      }),
      Crop.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 6,
      }),
    ]);

    res.json({
      user: req.user,
      weather,
      todayTasks,
      crops,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHomeDashboard };
