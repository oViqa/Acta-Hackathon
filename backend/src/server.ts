import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import attendanceRoutes from './routes/attendance';
import messageRoutes from './routes/messages';
import adminRoutes from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(compression());
app.use(cors({
  origin: ['http://localhost:3002', 'http://192.168.1.15:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  // Start server immediately, connect to database in background
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
  
  // Connect to database in background (non-blocking)
  connectDatabase().catch(error => {
    console.warn('Database connection failed:', error.message);
  });
}

startServer();
