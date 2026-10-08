import express from 'express';
import {
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
} from '../controllers/crop.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createCropSchema, updateCropSchema } from '../validators/crop.validator.js';

const router = express.Router();

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

export { router };
export default router;
