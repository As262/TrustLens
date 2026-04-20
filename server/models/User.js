import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  deviceId:   { type: String, required: true },
  name:       { type: String, default: 'Unknown Device' },
  firstSeen:  { type: Date, default: Date.now },
  lastUsed:   { type: Date, default: Date.now },
  useCount:   { type: Number, default: 1 },
  locations:  [String],          // all locations this device has been used from
  isTrusted:  { type: Boolean, default: false },
  isBlocked:  { type: Boolean, default: false },
}, { _id: false });

const locationHistorySchema = new mongoose.Schema({
  location:  { type: String, required: true },
  lastUsed:  { type: Date, default: Date.now },
  count:     { type: Number, default: 1 },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: true,
    },

    // ── Trust & Risk ────────────────────────────────────────────────────────
    trustScore: {
      type: Number,
      default: 78,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'flagged', 'suspended'],
      default: 'active',
    },

    // ── Trust Score Decay ───────────────────────────────────────────────────
    trustScoreLastDecayAt: {
      type: Date,
      default: null,
    },
    lastTransactionAt: {
      type: Date,
      default: null,
    },

    // ── Behavioral Fingerprint ──────────────────────────────────────────────
    devices:         [deviceSchema],
    locationHistory: [locationHistorySchema],

    // ── Account Security ────────────────────────────────────────────────────
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastLoginIp: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Instance helpers ──────────────────────────────────────────────────────────

/** Returns true if the account is currently locked out */
userSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > new Date();
};

/** Increment failed login counter; lock after 5 attempts for 15 minutes */
userSchema.methods.incLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 min

  // If a previous lock has expired, reset
  if (this.lockedUntil && this.lockedUntil < new Date()) {
    this.loginAttempts = 1;
    this.lockedUntil = null;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= MAX_ATTEMPTS) {
      this.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }
  }
  return this.save();
};

/** Reset login attempts on successful login */
userSchema.methods.resetLoginAttempts = async function (ip) {
  this.loginAttempts = 0;
  this.lockedUntil = null;
  this.lastLoginAt = new Date();
  if (ip) this.lastLoginIp = ip;
  return this.save();
};

export default mongoose.model('User', userSchema);
