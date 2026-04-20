import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ JWT_SECRET is required in production');
    process.exit(1);
  }

  process.env.JWT_SECRET = 'trustlens-dev-secret-change-me';
  console.warn('⚠️ JWT_SECRET not set. Using insecure development fallback secret.');
}

// Import routes
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import trustRoutes from './routes/trust.js';
import alertsRoutes from './routes/alerts.js';
import dataRoutes from './routes/data.js';
import auditRoutes from './routes/audit.js';
import demoRoutes from './routes/demo.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const app = express();
const httpServer = createServer(app);
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(httpServer, {
  cors: {
    origin: clientOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

/**
 * Middleware
 */
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

/**
 * MongoDB Connection
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trustlens');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

connectDB();

/**
 * Socket.io Real-time Connection
 */
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);

  // Store user connection
  socket.on('userConnected', (userId) => {
    activeUsers.set(socket.id, userId);
    console.log(`👤 User ${userId} connected`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    activeUsers.delete(socket.id);
    console.log(`📱 Client disconnected: ${socket.id}`);
  });

  // Listen for transaction alerts
  socket.on('transactionAlert', (data) => {
    console.log('🔔 Transaction Alert:', data);
    io.emit('fraudDetected', data);
  });
});

// Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

/**
 * Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/trust', trustRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/demo', demoRoutes);

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

/**
 * Initialize Demo Data (One-time on startup)
 */
const initializeDemoData = async () => {
  try {
    const User = (await import('./models/User.js')).default;
    const Transaction = (await import('./models/Transaction.js')).default;

    // Check if we already have demo data
    const existingUser = await User.findById('69dccbb4cf6b05ddf9b96846');

    if (!existingUser || existingUser.behavioralProfile?.totalTransactions === 0) {
      console.log('🚀 Preloading demo data for first-time startup...');

      // Create demo user if doesn't exist
      if (!existingUser) {
        await User.create({
          _id: '69dccbb4cf6b05ddf9b96846',
          email: 'demo@trustlens.com',
            passwordHash: 'demo_hash_ignored',
        });
      }

      console.log('✅ Demo data initialization ready');
    } else {
      console.log('✅ Demo data already loaded');
    }
  } catch (error) {
    console.warn('⚠️ Could not auto-initialize demo data:', error.message);
  }
};

// Initialize after DB connection
setTimeout(() => {
  initializeDemoData().catch(err => console.error('Init error:', err));
}, 1000);

/**
 * Welcome Route
 */
app.get('/', (req, res) => {
  res.json({
    message: 'TrustLens - Explainable AI Layer for Digital Banking',
    version: '1.0.0',
    endpoints: {
      submitTransaction: 'POST /api/transactions',
      getUserTransactions: 'GET /api/transactions/user/:userId',
      getTrustScore: 'GET /api/transactions/trust-score/:userId',
      getFraudLog: 'GET /api/transactions/fraud-log/:transactionId',
      generateSyntheticData: 'POST /api/data/generate',
      generateMultipleProfiles: 'POST /api/data/generate-multi',
      clearSyntheticData: 'DELETE /api/data/:userId',
      getDataStats: 'GET /api/data/stats/:userId',
      health: 'GET /api/health',
    },
  });
});

/**
 * Error Handling (Must be last)
 */
app.use(errorHandler);

/**
 * Start Server
 */
const DEFAULT_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_RETRIES = 10;

const startServer = (port, retry = 0) => {
  httpServer.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && retry < MAX_PORT_RETRIES) {
      const nextPort = port + 1;
      console.warn(`⚠️ Port ${port} is in use. Retrying on ${nextPort}...`);
      startServer(nextPort, retry + 1);
      return;
    }

    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌐 http://localhost:${port}`);
    console.log(`📡 WebSocket ready on ws://localhost:${port}`);
  });
};

startServer(DEFAULT_PORT);

export { io, app };
