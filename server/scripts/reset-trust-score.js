import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustlens';

async function resetScores() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const result = await User.updateMany({}, { $set: { trustScore: 60 } });
    console.log(`✅ Updated ${result.modifiedCount} users to have a trust score of 60.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting scores:', error);
    process.exit(1);
  }
}

resetScores();
