import Crop from '../models/Crop.js';
import Task from '../models/Task.js';
import SensorData from '../models/SensorData.js';

/**
 * Ensures realistic agricultural demo data exists for a user.
 * If user has no tasks or crops, creates starter data so the frontend
 * always receives real data from the backend API.
 */
async function ensureUserFarmData(userId) {
  if (!userId) return;

  try {
    const today = new Date().toISOString().split('T')[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];

    const in3DaysDate = new Date();
    in3DaysDate.setDate(in3DaysDate.getDate() + 3);
    const in3Days = in3DaysDate.toISOString().split('T')[0];

    // 1. Ensure Crops
    let crops = await Crop.findAll({ where: { userId } });
    if (crops.length === 0) {
      const c1 = await Crop.create({
        userId,
        name: 'Tomato (San Marzano)',
        variety: 'Cherry Tomato • Solanum lycopersicum',
        stage: 'Flowering',
        status: 'Attention',
        location: 'Field A • Sector 3',
        field: 'Field A',
        row: 'Row 4',
        plantingDate: '2026-05-12',
        expectedHarvestDate: '2026-07-28',
      });

      const c2 = await Crop.create({
        userId,
        name: 'Olive Field',
        variety: 'Picholine Marocaine',
        stage: 'Fruit',
        status: 'Healthy',
        location: 'Olive Field • North Parcel',
        field: 'Olive Field',
        row: 'Parcel B',
        plantingDate: '2025-11-20',
        expectedHarvestDate: '2026-11-15',
      });

      const c3 = await Crop.create({
        userId,
        name: 'Durum Wheat',
        variety: 'Karim • Triticum durum',
        stage: 'Growth',
        status: 'Healthy',
        location: 'Wheat Zone 3',
        field: 'Zone 3',
        row: 'Block C',
        plantingDate: '2026-01-10',
        expectedHarvestDate: '2026-06-25',
      });

      crops = [c1, c2, c3];
    }

    // 2. Ensure SensorData for crops
    for (const crop of crops) {
      if (!crop || !crop.id) continue;
      const hasSensor = await SensorData.findOne({ where: { cropId: crop.id } });
      if (!hasSensor) {
        const isTomato = crop.name.toLowerCase().includes('tomat');
        await SensorData.create({
          cropId: crop.id,
          soilMoisture: isTomato ? 38.0 : 52.0,
          temperature: 24.5,
          humidity: 62.0,
          recordedAt: new Date(),
        });
      }
    }

    // 3. Ensure Tasks
    const taskCount = await Task.count({ where: { userId } });
    if (taskCount === 0) {
      // Today's tasks
      await Task.create({
        userId,
        cropId: crops[0]?.id || null,
        title: 'Drip Line Irrigation',
        type: 'Irrigation',
        description: 'Recommended because soil moisture is decreasing (38%). 3.5 Liters/plant to maintain flowering vigor.',
        date: today,
        dueDate: today,
        time: '08:00 AM',
        status: 'pending',
        priority: 'high',
      });

      await Task.create({
        userId,
        cropId: crops[1]?.id || crops[0]?.id || null,
        title: 'Fertilization',
        type: 'Fertilization',
        description: 'Apply balanced potassium & phosphorus foliar spray for fruit setting.',
        date: today,
        dueDate: today,
        time: '11:00 AM',
        status: 'pending',
        priority: 'medium',
      });

      await Task.create({
        userId,
        cropId: crops[0]?.id || null,
        title: 'Pest Check & Leaf Vigor',
        type: 'Pest Check',
        description: 'Inspect lower foliage for early blight and yellow spots during flowering.',
        date: today,
        dueDate: today,
        time: '04:30 PM',
        status: 'done',
        priority: 'medium',
      });

      // Tomorrow's tasks
      await Task.create({
        userId,
        cropId: crops[0]?.id || null,
        title: 'Drip Line Irrigation',
        type: 'Irrigation',
        description: 'Early morning irrigation before high heat to protect blossom setting.',
        date: tomorrow,
        dueDate: tomorrow,
        time: '08:00 AM',
        status: 'pending',
        priority: 'high',
      });

      await Task.create({
        userId,
        cropId: crops[1]?.id || crops[0]?.id || null,
        title: 'Crop Inspection',
        type: 'Crop Inspection',
        description: 'Weekly canopy health and soil aerification survey.',
        date: tomorrow,
        dueDate: tomorrow,
        time: '10:30 AM',
        status: 'pending',
        priority: 'low',
      });

      // In 3 days
      await Task.create({
        userId,
        cropId: crops[2]?.id || crops[0]?.id || null,
        title: 'Harvest Readiness Check',
        type: 'Harvest',
        description: 'Assess maturity index and moisture content for early parcel.',
        date: in3Days,
        dueDate: in3Days,
        time: '03:00 PM',
        status: 'pending',
        priority: 'medium',
      });
    }
  } catch (error) {
    console.error('Failed to ensure user farm data', error);
  }
}

export { ensureUserFarmData };
export default { ensureUserFarmData };
