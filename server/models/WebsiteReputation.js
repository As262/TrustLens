import mongoose from 'mongoose';

const websiteReputationSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['payment', 'banking', 'ecommerce', 'social', 'utility', 'other'],
      default: 'other',
    },
    isLegit: {
      type: Boolean,
      default: false,
    },
    trustScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    source: {
      type: String,
      default: 'seeded-intel',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('WebsiteReputation', websiteReputationSchema);
