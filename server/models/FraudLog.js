import mongoose from 'mongoose';

const fraudLogSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fraudScore: {
      type: Number,
      required: true,
    },
    aiReasons: [String],
    riskFactors: {
      amountAnomaly: {
        detected: Boolean,
        reason: String,
      },
      locationAnomaly: {
        detected: Boolean,
        reason: String,
      },
      timeAnomaly: {
        detected: Boolean,
        reason: String,
      },
      deviceAnomaly: {
        detected: Boolean,
        reason: String,
      },
      frequencyAnomaly: {
        detected: Boolean,
        reason: String,
      },
    },
    trustScoreAdjustment: Number,
  },
  { timestamps: true }
);

export default mongoose.model('FraudLog', fraudLogSchema);
