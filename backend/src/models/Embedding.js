const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Embedding = sequelize.define('Embedding', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  documentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  chunkIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  chunkText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Stored as JSON array since pgvector requires extension
  // Use raw SQL for similarity search
  embedding: {
    type: DataTypes.ARRAY(DataTypes.FLOAT),
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'embeddings',
});

module.exports = Embedding;


