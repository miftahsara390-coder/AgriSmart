import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Crop = sequelize.define('Crop', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  variety: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stage: {
    type: DataTypes.ENUM('Seed', 'Growth', 'Flowering', 'Fruit', 'Harvest'),
    allowNull: true,
    defaultValue: 'Seed',
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Healthy',
  },
  plantingDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  expectedHarvestDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  field: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  row: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'crops',
});

export { Crop };
export default Crop;
