const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'userId is required'],
    index: true
  },
  deviceId: {
    type: String,
    required: [true, 'deviceId is required'],
    index: true
  },
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate records for the exact same user/device combination
deviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model('Device', deviceSchema);