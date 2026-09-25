const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  cropId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
  type: z.enum(['watering', 'fertilizing', 'harvesting', 'planting', 'pesticide', 'other']).optional(),
  status: z.enum(['pending', 'done', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

const updateTaskSchema = createTaskSchema.partial();

module.exports = { createTaskSchema, updateTaskSchema };


