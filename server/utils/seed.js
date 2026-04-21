/**
 * Database Seed Script
 * Populates MongoDB with demo users and transactions
 * Run: node server/utils/seed.js
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import models
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trustlens');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo users
    const hashedPassword = await bcryptjs.hash('password123', 10);

    const demoUser = await User.create({
      email: 'demo@trustlens.com',
      passwordHash: hashedPassword,
      trustScore: 85,
      riskLevel: 'low',
      accountStatus: 'active',
      devices: [
        {
          deviceId: 'windows-pc',
          name: 'Windows PC',
          lastUsed: new Date(),
          isTrusted: true,
        },
        {
          deviceId: 'macbook-pro',
          name: 'MacBook Pro',
          lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          isTrusted: true,
        },
      ],
      locationHistory: [
        {
          location: 'New York',
          lastUsed: new Date(),
          count: 15,
        },
        {
          location: 'San Francisco',
          lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          count: 8,
        },
        {
          location: 'Chicago',
          lastUsed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          count: 3,
        },
      ],
    });

    console.log('👤 Demo user created:', demoUser.email);

    // Create sample transactions
    const now = new Date();
    const sampleTransactions = [
      // Normal transactions
      {
        userId: demoUser._id,
        amount: 45.99,
        currency: 'USD',
        location: 'New York',
        deviceId: 'windows-pc',
        deviceName: 'Windows PC',
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        category: 'shopping',
        fraudScore: 0.05,
        isFlagged: false,
        explanations: ['✅ Normal transaction amount', '✅ Familiar location', '✅ Expected time'],
        status: 'completed',
        trustScoreImpact: 0,
      },
      {
        userId: demoUser._id,
        amount: 28.5,
        currency: 'USD',
        location: 'New York',
        deviceId: 'windows-pc',
        deviceName: 'Windows PC',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        category: 'dining',
        fraudScore: 0.08,
        isFlagged: false,
        explanations: ['✅ Typical dining expense', '✅ Known location'],
        status: 'completed',
        trustScoreImpact: 0,
      },
      // Moderately suspicious
      {
        userId: demoUser._id,
        amount: 250.0,
        currency: 'USD',
        location: 'Miami',
        deviceId: 'windows-pc',
        deviceName: 'Windows PC',
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
        category: 'shopping',
        fraudScore: 0.42,
        isFlagged: false,
        explanations: [
          '🟡 Higher than usual amount (2.5x normal)',
          '🟡 Location not in history',
        ],
        status: 'completed',
        trustScoreImpact: -2,
      },
      // High risk (flagged)
      {
        userId: demoUser._id,
        amount: 1500.0,
        currency: 'USD',
        location: 'Tokyo',
        deviceId: 'unknown-device-xyz',
        deviceName: 'Unknown Device',
        timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
        category: 'transfer',
        fraudScore: 0.78,
        isFlagged: true,
        explanations: [
          '🔴 Amount is 8.5x your average transaction',
          '📍 Unusual location: "Tokyo" - not in your typical locations',
          '📱 New Device: Device "Unknown Device" not previously associated',
          '⏰ Transaction at 03:45 - outside typical activity hours',
        ],
        status: 'flagged',
        trustScoreImpact: -10,
      },
      // Normal recent transaction
      {
        userId: demoUser._id,
        amount: 65.0,
        currency: 'USD',
        location: 'New York',
        deviceId: 'macbook-pro',
        deviceName: 'MacBook Pro',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        category: 'utilities',
        fraudScore: 0.1,
        isFlagged: false,
        explanations: ['✅ Known device', '✅ Familiar location', '✅ Normal amount'],
        status: 'completed',
        trustScoreImpact: 2,
      },
      // Moderate risk
      {
        userId: demoUser._id,
        amount: 350.0,
        currency: 'USD',
        location: 'San Francisco',
        deviceId: 'windows-pc',
        deviceName: 'Windows PC',
        timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
        category: 'entertainment',
        fraudScore: 0.35,
        isFlagged: false,
        explanations: [
          '🟡 Amount is 3x higher than average',
          '✅ Location is in history but not recent',
        ],
        status: 'completed',
        trustScoreImpact: -1,
      },
    ];

    const createdTransactions = await Transaction.insertMany(sampleTransactions);
    console.log(`✅ Created ${createdTransactions.length} sample transactions`);

    // Update user trust score based on transactions
    const avgFraudScore = sampleTransactions.reduce((sum, t) => sum + t.fraudScore, 0) / sampleTransactions.length;
    const flaggedCount = sampleTransactions.filter((t) => t.isFlagged).length;
    let calculatedScore = 100 - avgFraudScore * 40 - flaggedCount * 10;
    calculatedScore = Math.max(0, Math.min(100, calculatedScore));

    await User.findByIdAndUpdate(demoUser._id, {
      trustScore: Math.round(calculatedScore),
    });

    console.log('🎯 Updated user trust score');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('=== DEMO CREDENTIALS ===');
    console.log(`Email: ${demoUser.email}`);
    console.log(`User ID: ${demoUser._id}`);
    console.log(`Trust Score: ${Math.round(calculatedScore)}`);
    console.log(`Transactions: ${createdTransactions.length}`);
    console.log('========================\n');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seed
connectDB().then(() => seedDatabase());
