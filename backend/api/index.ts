import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database';
import authRoutes from '../src/routes/auth';
import eventRoutes from '../src/routes/events';
import attendanceRoutes from '../src/routes/attendance';
import messageRoutes from '../src/routes/messages';
import { errorHandler } from '../src/middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/messages', messageRoutes);

// Error handling
app.use(errorHandler);

// Initialize database connection
connectDatabase().catch(console.error);

// Export for Vercel
export default app;
