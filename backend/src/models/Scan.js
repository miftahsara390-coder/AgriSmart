const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Scan = sequelize.define('Scan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  cropId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  plantName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  diagnosis: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  confidence: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: true,
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'completed',
  },
}, {
  timestamps: true,
  tableName: 'scans',
});

module.exports = Scan;
