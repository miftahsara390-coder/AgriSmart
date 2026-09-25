const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
  variety: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  plantedAt: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  area: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  areaUnit: {
    type: DataTypes.ENUM('hectare', 'acre', 'm2'),
    defaultValue: 'hectare',
  },
  status: {
    type: DataTypes.ENUM('growing', 'harvested', 'failed'),
    defaultValue: 'growing',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'crops',
});

module.exports = Crop;


