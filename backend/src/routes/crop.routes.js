const express = require('express');
const router = express.Router();
const {
  getCrops, getCropById, createCrop, updateCrop, deleteCrop,
  getTelemetry, addObservation, getObservations,
  getSensorHistory, getCropIntelligence, getAiAdvice,
} = require('../controllers/crop.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCropSchema, updateCropSchema } = require('../validators/crop.validator');

router.use(authMiddleware);

// Telemetry — must come before /:id routes
router.get('/telemetry', getTelemetry);

// CRUD
router.get('/', getCrops);
router.get('/:id', getCropById);
router.post('/', validate(createCropSchema), createCrop);
router.put('/:id', validate(updateCropSchema), updateCrop);
router.delete('/:id', deleteCrop);

// Observations
router.post('/:id/observations', addObservation);
router.get('/:id/observations', getObservations);

// Sensors
router.get('/:id/sensors', getSensorHistory);

// Intelligence
router.get('/:id/intelligence', getCropIntelligence);

// AI Advice
router.post('/:id/ai-advice', getAiAdvice);

module.exports = router;
