import { z } from 'zod';

const createCropSchema = z.object({
  name: z.string().min(1, 'Crop name is required').max(100),
  type: z.string().optional(),
  variety: z.string().optional(),
  stage: z.enum(['Seed', 'Growth', 'Flowering', 'Fruit', 'Harvest']).optional(),
  status: z.enum(['Healthy', 'Attention', 'growing', 'harvested', 'failed']).optional(),
  plantingDate: z.string().optional(),
  expectedHarvestDate: z.string().optional(),
  location: z.string().optional(),
  field: z.string().optional(),
  row: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const updateCropSchema = createCropSchema.partial();

export { createCropSchema, updateCropSchema };
export default { createCropSchema, updateCropSchema };
