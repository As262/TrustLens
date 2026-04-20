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
      default: 60,
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
    // Behavioral profiling for hybrid intelligence
    behavioralProfile: {
      // Time patterns
      typicalHours: {
        distribution: [Number], // 24-element array for hour frequencies
        mean: Number,
        std: Number,
        mode: Number,
      },
      typicalDays: {
        distribution: [Number], // 7-element array for day frequencies
        businessDaysOnly: Boolean,
        weekendRate: Number,
      },
      // Amount patterns
      amountStats: {
        mean: Number,
        median: Number,
        stdDev: Number,
        p25: Number,
        p50: Number,
        p75: Number,
        p95: Number,
        p99: Number,
        minAmount: Number,
        maxAmount: Number,
        rangeLabel: String, // 'low'|'moderate'|'high'
      },
      // Category spending preferences
      categoryPreferences: {
        type: Map,
        of: {
          count: Number,
          avgAmount: Number,
          frequency: String, // 'daily'|'weekly'|'monthly'|'quarterly'
        },
      },
      // Transaction velocity metrics
      velocityMetrics: {
        maxPerHour: Number,
        maxPerDay: Number,
        maxPerWeek: Number,
        typicalPerDay: Number,
      },
      // Location patterns
      primaryLocations: [String], // Top 5 locations
      usualCountries: [String],
      newLocationFrequency: Number, // % of txns from new locations
      travelPattern: String, // 'mostly_local'|'regional'|'global'
      // Device loyalty and patterns
      deviceCount: Number,
      deviceLoyalty: Number, // % txns on primary device
      deviceRotation: Number, // % txns on new devices
      // Account history metrics
      accountCreatedDate: Date,
      accountAge: Number, // days
      totalTransactions: Number,
      transactionVelocity: Number, // txns per day
      // Risk metrics
      fraudFlagCount: Number,
      fraudFlagRate: Number, // % of transactions flagged
      declinedTransactionCount: Number,
      lastAccountReview: Date,
      // Profile metadata
      lastProfileUpdate: Date,
      profileConfidence: Number, // 0-1, how confident are we in the profile
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
