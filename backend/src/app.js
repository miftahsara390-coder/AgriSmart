require('dotenv').config();
const express = require('express');
const path = require('path');


const { connectDB } = require('./config/database');

// ─── Models (load all to register with Sequelize) ────────────────────────────
const User = require('./models/User');
const Crop = require('./models/Crop');
const Task = require('./models/Task');
const Scan = require('./models/Scan');
const Observation = require('./models/Observation');
const SensorData = require('./models/SensorData');
const Conversation = require('./models/Conversation');

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

// ─── Routes ──────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const homeRoutes = require('./routes/home.routes');
const weatherRoutes = require('./routes/weather.routes');
const cropRoutes = require('./routes/crop.routes');
const taskRoutes = require('./routes/task.routes');
const scanRoutes = require('./routes/scan.routes');
const agentRoutes = require('./routes/agent.routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ─── CORS Middleware ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/agent', agentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Connect to DB
connectDB();

module.exports = app;
