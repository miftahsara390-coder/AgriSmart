const express = require('express');
const router = express.Router();
const { getCrops, getCropById, createCrop, updateCrop, deleteCrop } = require('../controllers/crop.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCropSchema, updateCropSchema } = require('../validators/crop.validator');

router.use(authMiddleware);

router.get('/', getCrops);
router.get('/:id', getCropById);
router.post('/', validate(createCropSchema), createCrop);
router.put('/:id', validate(updateCropSchema), updateCrop);
router.delete('/:id', deleteCrop);

module.exports = router;


