const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'userId is required'],
    index: true // index: userId
  },
  amount: {
    type: Number,
    required: [true, 'amount is required'],
    min: [0, 'amount cannot be negative']
  },
  fraudScore: {
    type: Number,
    min: 0,
    max: 100,
    index: true // index: fraudScore
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  deviceId: {
    type: String
  },
  location: {
    type: String
  },
  decision: {
    type: String,
    enum: ['allow', 'review', 'block'],
    required: [true, 'decision is required']
  },
  reasons: [{
    type: String
  }],
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // index: timestamp
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
