const { z } = require('zod');

const createCropSchema = z.object({
  name: z.string().min(1, 'Crop name is required'),
  variety: z.string().optional(),
  plantedAt: z.string().optional(),
  area: z.number().positive().optional(),
  areaUnit: z.enum(['hectare', 'acre', 'm2']).optional(),
  status: z.enum(['growing', 'harvested', 'failed']).optional(),
  notes: z.string().optional(),
});

const updateCropSchema = createCropSchema.partial();

module.exports = { createCropSchema, updateCropSchema };


