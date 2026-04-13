import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    trustScore: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    devices: [
      {
        deviceId: String,
        name: String,
        lastUsed: Date,
        isTrusted: Boolean,
      },
    ],
    locationHistory: [
      {
        location: String,
        lastUsed: Date,
        count: Number,
      },
    ],
    accountStatus: {
      type: String,
      enum: ['active', 'flagged', 'suspended'],
      default: 'active',
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
