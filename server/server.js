import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import transactionRoutes from './routes/transactions.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

/**
 * Middleware
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/transactions', transactionRoutes);

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
      health: 'GET /api/health',
    },
  });
});

/**
 * Error Handling
 */
app.use((err, req, res, next) => {
  console.error('🔴 Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
});

export { io, app };
