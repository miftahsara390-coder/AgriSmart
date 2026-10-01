const { Op } = require('sequelize');
const Crop = require('../models/Crop');
const Task = require('../models/Task');
const Observation = require('../models/Observation');
const SensorData = require('../models/SensorData');
const { runAgent } = require('../ai/agent');

// ─── Helper ──────────────────────────────────────────────────────────────────
const stageProgression = {
  Seed: 10,
  Growth: 30,
  Flowering: 55,
  Fruit: 75,
  Harvest: 100,
};

// ─── GET /api/crops ──────────────────────────────────────────────────────────
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

// ─── GET /api/crops/telemetry ────────────────────────────────────────────────
const getTelemetry = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const crops = await Crop.findAll({ where: { userId } });

    const cropCount = crops.length;
    const healthyCrops = crops.filter((c) => c.status === 'Healthy' || c.status === 'growing').length;
    const attentionCrops = crops.filter((c) => c.status === 'Attention').length;

    // Latest sensor data across all user crops
    const cropIds = crops.map((c) => c.id);
    let avgSoilMoisture = null;
    let latestSensor = null;

    if (cropIds.length > 0) {
      const sensors = await SensorData.findAll({
        where: { cropId: { [Op.in]: cropIds } },
        order: [['recordedAt', 'DESC']],
        limit: 10,
      });
      if (sensors.length > 0) {
        latestSensor = sensors[0];
        const total = sensors.reduce((sum, s) => sum + (s.soilMoisture || 0), 0);
        avgSoilMoisture = Math.round((total / sensors.length) * 10) / 10;
      }
    }

    res.json({
      cropCount,
      healthyCrops,
      attentionCrops,
      avgSoilMoisture,
      latestSensor,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/crops/:id ──────────────────────────────────────────────────────
const getCropById = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    const [nextTask, observations, sensorHistory] = await Promise.all([
      Task.findOne({
        where: {
          cropId: crop.id,
          status: 'pending',
          [Op.or]: [
            { date: { [Op.gte]: today } },
            { dueDate: { [Op.gte]: today } },
          ],
        },
        order: [['date', 'ASC'], ['dueDate', 'ASC']],
      }),
      Observation.findAll({
        where: { cropId: crop.id },
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
      SensorData.findAll({
        where: { cropId: crop.id },
        order: [['recordedAt', 'DESC']],
        limit: 20,
      }),
    ]);

    const progressPercent = stageProgression[crop.stage] || 0;

    res.json({
      crop,
      progression: {
        stage: crop.stage,
        percent: progressPercent,
        stages: Object.keys(stageProgression),
      },
      nextTask,
      observations,
      sensorHistory,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/crops ─────────────────────────────────────────────────────────
const createCrop = async (req, res, next) => {
  try {
    const crop = await Crop.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ message: 'Crop created', crop });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/crops/:id ──────────────────────────────────────────────────────
const updateCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    await crop.update(req.body);
    res.json({ message: 'Crop updated', crop });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/crops/:id ───────────────────────────────────────────────────
const deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    await crop.destroy();
    res.json({ message: 'Crop deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/crops/:id/observations ────────────────────────────────────────
const addObservation = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    const { note, imageUrl } = req.body;
    if (!note) return res.status(400).json({ message: 'note is required' });

    const observation = await Observation.create({
      cropId: crop.id,
      userId: req.user.id,
      note,
      imageUrl,
    });

    res.status(201).json({ message: 'Observation added', observation });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/crops/:id/observations ─────────────────────────────────────────
const getObservations = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    const observations = await Observation.findAll({
      where: { cropId: crop.id },
      order: [['createdAt', 'DESC']],
    });

    res.json({ observations });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/crops/:id/sensors ──────────────────────────────────────────────
const getSensorHistory = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    const sensorHistory = await SensorData.findAll({
      where: { cropId: crop.id },
      order: [['recordedAt', 'DESC']],
      limit: 30,
    });

    res.json({ sensorHistory });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/crops/:id/intelligence ─────────────────────────────────────────
const getCropIntelligence = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    // Get latest sensor
    const latestSensor = await SensorData.findOne({
      where: { cropId: crop.id },
      order: [['recordedAt', 'DESC']],
    });

    // Build intelligence based on crop data
    const soilMoisture = latestSensor?.soilMoisture;
    let irrigationRec = 'Monitor soil moisture regularly.';
    let soilCondition = 'Unknown';

    if (soilMoisture !== null && soilMoisture !== undefined) {
      if (soilMoisture < 20) {
        irrigationRec = 'Immediate irrigation recommended — soil moisture is low.';
        soilCondition = 'Dry';
      } else if (soilMoisture < 40) {
        irrigationRec = 'Consider irrigation in the next 24 hours.';
        soilCondition = 'Moderately dry';
      } else if (soilMoisture < 65) {
        irrigationRec = 'Soil moisture is optimal. No irrigation needed.';
        soilCondition = 'Optimal';
      } else {
        irrigationRec = 'Soil moisture is high. Avoid overwatering.';
        soilCondition = 'Moist';
      }
    }

    const risks = [];
    if (crop.status === 'Attention') risks.push('Crop needs attention — check for pests or disease.');
    if (crop.stage === 'Flowering') risks.push('Protect from strong winds during flowering.');
    if (crop.stage === 'Fruit') risks.push('Monitor for fruit diseases and ensure adequate nutrition.');

    res.json({
      intelligence: {
        currentStage: crop.stage || 'Unknown',
        healthStatus: crop.status || 'Unknown',
        soilCondition,
        irrigationRecommendation: irrigationRec,
        possibleRisks: risks,
        nextRecommendedAction: risks.length > 0 ? risks[0] : irrigationRec,
        latestSensor,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/crops/:id/ai-advice ───────────────────────────────────────────
const getAiAdvice = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    const cropContext = `
Crop: ${crop.name}
Type: ${crop.type || 'N/A'}
Variety: ${crop.variety || 'N/A'}
Stage: ${crop.stage || 'N/A'}
Status: ${crop.status || 'N/A'}
Planting Date: ${crop.plantingDate || 'N/A'}
Notes: ${crop.notes || 'None'}
    `.trim();

    const question = req.body.question || `What advice do you have for my ${crop.name} crop?`;

    const agentResponse = await runAgent({
      userMessage: `${question}\n\nMy crop details:\n${cropContext}`,
      history: [],
      userId: req.user.id,
    });

    res.json({ advice: agentResponse.content });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
  getTelemetry,
  addObservation,
  getObservations,
  getSensorHistory,
  getCropIntelligence,
  getAiAdvice,
};
