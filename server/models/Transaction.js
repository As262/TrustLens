import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    location: {
      type: String,
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    deviceName: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: ['shopping', 'dining', 'utilities', 'entertainment', 'transfer', 'withdrawal'],
      default: 'shopping',
    },
    fraudScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    explanations: [String],
    status: {
      type: String,
      enum: ['pending', 'completed', 'flagged', 'declined'],
      default: 'pending',
    },
    trustScoreImpact: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
