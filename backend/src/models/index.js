import User from './User.js';
import Crop from './Crop.js';
import Task from './Task.js';
import Scan from './Scan.js';
import Observation from './Observation.js';
import SensorData from './SensorData.js';
import Conversation from './Conversation.js';

// ─── Associations ────────────────────────────────────────────────────────────
// User → Crop
User.hasMany(Crop, { foreignKey: 'userId', onDelete: 'CASCADE' });
Crop.belongsTo(User, { foreignKey: 'userId' });

// User → Task
User.hasMany(Task, { foreignKey: 'userId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId' });

// Crop → Task
Crop.hasMany(Task, { foreignKey: 'cropId', onDelete: 'SET NULL' });
Task.belongsTo(Crop, { foreignKey: 'cropId' });

// User → Scan
User.hasMany(Scan, { foreignKey: 'userId', onDelete: 'CASCADE' });
Scan.belongsTo(User, { foreignKey: 'userId' });

// Crop → Scan
Crop.hasMany(Scan, { foreignKey: 'cropId', onDelete: 'SET NULL' });
Scan.belongsTo(Crop, { foreignKey: 'cropId' });

// User → Observation
User.hasMany(Observation, { foreignKey: 'userId', onDelete: 'CASCADE' });
Observation.belongsTo(User, { foreignKey: 'userId' });

// Crop → Observation
Crop.hasMany(Observation, { foreignKey: 'cropId', onDelete: 'CASCADE' });
Observation.belongsTo(Crop, { foreignKey: 'cropId' });

// Crop → SensorData
Crop.hasMany(SensorData, { foreignKey: 'cropId', onDelete: 'CASCADE' });
SensorData.belongsTo(Crop, { foreignKey: 'cropId' });

// User → Conversation
User.hasMany(Conversation, { foreignKey: 'userId', onDelete: 'CASCADE' });
Conversation.belongsTo(User, { foreignKey: 'userId' });

export {
  User,
  Crop,
  Task,
  Scan,
  Observation,
  SensorData,
  Conversation,
};

export default {
  User,
  Crop,
  Task,
  Scan,
  Observation,
  SensorData,
  Conversation,
};
