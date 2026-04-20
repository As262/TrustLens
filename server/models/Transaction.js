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
      enum: ['shopping', 'dining', 'utilities', 'entertainment', 'transfer', 'withdrawal', 'food', 'transport', 'bills'],
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
    explanations: [mongoose.Schema.Types.Mixed],
    status: {
      type: String,
      enum: ['pending', 'completed', 'flagged', 'declined', 'appealed'],
      default: 'pending',
    },

    // Production fintech decision fields
    decision: {
      type: String,
      enum: ['APPROVE', 'CHALLENGE', 'DECLINE', 'ESCALATE', 'HOLD'],
      default: 'APPROVE',
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    trustLevel: {
      type: String,
      enum: ['TRUSTED', 'MODERATE_RISK', 'HIGH_RISK'],
    },

    // System message (user-facing)
    systemMessage: String,

    // Decision reasoning
    reasoning: {
      fraudReason: String,
      trustReason: String,
      decisionFactors: [String],
    },

    // Appeal information
    appeal: {
      appealed: {
        type: Boolean,
        default: false,
      },
      appealReason: String,
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
      },
      submittedAt: Date,
      reviewedAt: Date,
    },

    // Audit log reference
    auditLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuditLog',
    },
    trustScoreImpact: {
      type: Number,
      default: 0,
    },
    alertCreated: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
