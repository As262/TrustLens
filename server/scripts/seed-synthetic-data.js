#!/usr/bin/env node

/**
 * Seed Script: Generate and populate realistic synthetic transaction data
 * Usage: node seed-synthetic-data.js
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import SyntheticDataGenerator from '../utils/syntheticDataGenerator.js';
import profileCalculator from '../utils/profileCalculator.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustlens';

// Customer profiles to generate
const DEMO_CUSTOMERS = [
  {
    email: 'low-spender@trustlens.demo',
    profileType: 'lowSpender',
    transactionCount: 150,
  },
  {
    email: 'moderate-spender@trustlens.demo',
    profileType: 'moderateSpender',
    transactionCount: 250,
  },
  {
    email: 'high-spender@trustlens.demo',
    profileType: 'highSpender',
    transactionCount: 200,
  },
  {
    email: 'business-user@trustlens.demo',
    profileType: 'businessUser',
    transactionCount: 300,
  },
  {
    email: 'international@trustlens.demo',
    profileType: 'internationalTraveler',
    transactionCount: 200,
  },
];

async function seedSyntheticData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const generator = new SyntheticDataGenerator();

    console.log('\n📊 Seeding synthetic transaction data...\n');

    for (const customerConfig of DEMO_CUSTOMERS) {
      console.log(`\n👤 Generating profile: ${customerConfig.email}`);
      console.log(`   Profile Type: ${customerConfig.profileType}`);
      console.log(`   Transactions: ${customerConfig.transactionCount}`);

      // Generate behavioral profile
      const behavioralProfile = generator.generateUserProfile(customerConfig.profileType);
      console.log(`   ✓ Generated behavioral profile`);

      // Create or update user
      let user = await User.findOne({ email: customerConfig.email });

      if (!user) {
        user = new User({
          email: customerConfig.email,
          passwordHash: '$2b$10$dummy', // Placeholder hash
          trustScore: 60,
          riskLevel: 'low',
          accountStatus: 'active',
          devices: [
            { deviceId: 'device-windows-pc', name: 'Windows PC', isTrusted: true },
            { deviceId: 'device-macbook-pro', name: 'MacBook Pro', isTrusted: true },
          ],
          locationHistory: behavioralProfile.primaryLocations.map(loc => ({
            location: loc,
            lastUsed: new Date(),
            count: Math.floor(Math.random() * 50) + 10,
          })),
          behavioralProfile,
        });
        await user.save();
        console.log(`   ✓ Created new user document`);
      } else {
        user.behavioralProfile = behavioralProfile;
        await user.save();
        console.log(`   ✓ Updated existing user document`);
      }

      // Generate transactions
      const transactions = generator.generateTransactions(
        user._id,
        behavioralProfile,
        customerConfig.transactionCount,
        new Date()
      );
      console.log(`   ✓ Generated ${transactions.length} synthetic transactions`);

      // Delete existing transactions for this user
      const deletedCount = await Transaction.deleteMany({ userId: user._id });
      console.log(`   ✓ Cleared ${deletedCount.deletedCount} existing transactions`);

      // Insert new transactions
      const inserted = await Transaction.insertMany(transactions);
      console.log(`   ✓ Inserted ${inserted.length} transactions into database`);

      // Calculate and update behavioral profile with real data
      const updatedProfile = await profileCalculator.calculateBehavioralProfile(user._id);
      user.behavioralProfile = updatedProfile;
      user.behavioralProfile.profileConfidence = 0.95; // High confidence due to large sample
      await user.save();
      console.log(`   ✓ Updated profile with calculated statistics`);

      // Show statistics
      const stats = {
        fraudTransactions: transactions.filter(t => t.isFlagged).length,
        avgAmount: (transactions.reduce((s, t) => s + t.amount, 0) / transactions.length).toFixed(2),
        topCategory: transactions.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {}),
      };

      console.log(`\n   📈 Statistics:`);
      console.log(`      • Fraud Transactions: ${stats.fraudTransactions} (${((stats.fraudTransactions / transactions.length) * 100).toFixed(1)}%)`);
      console.log(`      • Average Amount: $${stats.avgAmount}`);
      console.log(`      • Top Category: ${Object.entries(stats.topCategory).sort((a, b) => b[1] - a[1])[0][0]}`);
      console.log(`      • Locations: ${behavioralProfile.primaryLocations.join(', ')}`);
      console.log(`      • Device Loyalty: ${(behavioralProfile.deviceLoyalty * 100).toFixed(0)}%`);
    }

    console.log('\n\n✨ Synthetic data seeding complete!');
    console.log('\n📋 Summary:');
    console.log(`   • Generated ${DEMO_CUSTOMERS.length} user profiles`);
    console.log(`   • Total transactions: ${DEMO_CUSTOMERS.reduce((s, c) => s + c.transactionCount, 0)}`);
    console.log(`   • Expected fraud rate: ~5%`);
    console.log('\n🚀 Ready for fraud detection testing and model training!\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// Run seed script
seedSyntheticData();
