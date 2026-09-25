const Crop = require('../models/Crop');
const Task = require('../models/Task');

// GET /api/crops
const getCrops = async (req, res, next) => {
  try {
    const crops = await Crop.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ crops });
  } catch (error) {
    next(error);
  }
};

// GET /api/crops/:id
const getCropById = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Task, as: 'Tasks' }],
    });

    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    res.json({ crop });
  } catch (error) {
    next(error);
  }
};

// POST /api/crops
const createCrop = async (req, res, next) => {
  try {
    const crop = await Crop.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ message: 'Crop created', crop });
  } catch (error) {
    next(error);
  }
};

// PUT /api/crops/:id
const updateCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    await crop.update(req.body);
    res.json({ message: 'Crop updated', crop });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/crops/:id
const deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    await crop.destroy();
    res.json({ message: 'Crop deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCrops, getCropById, createCrop, updateCrop, deleteCrop };


