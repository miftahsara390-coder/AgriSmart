const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'assistant', 'system', 'tool'),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  toolName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  toolResult: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'messages',
});

module.exports = Message;


