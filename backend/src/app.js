require('dotenv').config();
const express = require('express');
const path = require('path');

const { connectDB } = require('./config/database');

// Models (load all to register with Sequelize)
const User = require('./models/User');
const RefreshToken = require('./models/RefreshToken');
const Crop = require('./models/Crop');
const Task = require('./models/Task');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Document = require('./models/Document');
const Embedding = require('./models/Embedding');

// Associations
User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Crop, { foreignKey: 'userId', onDelete: 'CASCADE' });
Crop.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Task, { foreignKey: 'userId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId' });

Crop.hasMany(Task, { foreignKey: 'cropId', onDelete: 'SET NULL' });
Task.belongsTo(Crop, { foreignKey: 'cropId' });

User.hasMany(Conversation, { foreignKey: 'userId', onDelete: 'CASCADE' });
Conversation.belongsTo(User, { foreignKey: 'userId' });

Conversation.hasMany(Message, { foreignKey: 'conversationId', onDelete: 'CASCADE' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

Document.hasMany(Embedding, { foreignKey: 'documentId', onDelete: 'CASCADE' });
Embedding.belongsTo(Document, { foreignKey: 'documentId' });

// Routes
const authRoutes = require('./routes/auth.routes');
const cropRoutes = require('./routes/crop.routes');
const taskRoutes = require('./routes/task.routes');
const scanRoutes = require('./routes/scan.routes');
const agentRoutes = require('./routes/agent.routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/agent', agentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Connect to DB
connectDB();

module.exports = app;


