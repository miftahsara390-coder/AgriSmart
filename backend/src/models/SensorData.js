import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const SensorData = sequelize.define('SensorData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cropId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  soilMoisture: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  humidity: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  recordedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  tableName: 'sensor_data',
});

export { SensorData };
export default SensorData;
