import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/database.js';

// ─── Models (load all to register with Sequelize) ────────────────────────────
import User from './models/User.js';
import Crop from './models/Crop.js';
import Task from './models/Task.js';
import Scan from './models/Scan.js';
import Observation from './models/Observation.js';
import SensorData from './models/SensorData.js';
import Conversation from './models/Conversation.js';

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
import authRoutes from './routes/auth.routes.js';
import homeRoutes from './routes/home.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import cropRoutes from './routes/crop.routes.js';
import taskRoutes from './routes/task.routes.js';
import scanRoutes from './routes/scan.routes.js';
import agentRoutes from './routes/agent.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export { app };
export default app;
