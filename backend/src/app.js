import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/database.js';
import './models/index.js';

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
