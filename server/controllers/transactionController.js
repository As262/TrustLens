import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import FraudLog from '../models/FraudLog.js';
import { FraudService } from '../services/fraudService.js';
import { ExplainabilityService } from '../services/explainabilityService.js';
import { TrustScoreService } from '../services/trustScoreService.js';

const fraudService = new FraudService(User, Transaction);
const explainabilityService = new ExplainabilityService();
const trustScoreService = new TrustScoreService(User, Transaction);

/**
 * POST /api/transactions
 * Submit a new transaction for fraud detection and analysis
 */
export const submitTransaction = async (req, res) => {
  try {
    const { userId, amount, location, deviceId, deviceName, category } = req.body;

    // Validate input
    if (!userId || !amount || !location || !deviceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent transactions for context
    const recentTransactions = await Transaction.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const averageAmount = recentTransactions.length > 0
      ? recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length
      : amount;

    // Calculate fraud score
    const fraudAnalysis = await fraudService.calculateFraudScore(userId, {
      amount,
      location,
      deviceId,
      timestamp: new Date(),
    });

    // Generate explanations
    const explanations = explainabilityService.generateExplanations(
      { amount, location, deviceId, deviceName, timestamp: new Date() },
      fraudAnalysis,
      { averageAmount }
    );

    const summary = explainabilityService.generateSummary(fraudAnalysis.score, explanations);

    // Determine if transaction should be flagged
    const isFlagged = fraudAnalysis.score > 0.6;
    const status = isFlagged ? 'flagged' : 'completed';

    // Create transaction record
    const transaction = new Transaction({
      userId,
      amount,
      location,
      deviceId,
      deviceName,
      category,
      fraudScore: fraudAnalysis.score,
      isFlagged,
      explanations,
      status,
      trustScoreImpact: isFlagged ? -5 : 0,
    });

    await transaction.save();

    // Update user location history
    const existingLocation = user.locationHistory.find(
      (loc) => loc.location.toLowerCase() === location.toLowerCase()
    );

    if (existingLocation) {
      existingLocation.lastUsed = new Date();
      existingLocation.count = (existingLocation.count || 0) + 1;
    } else {
      user.locationHistory.push({
        location,
        lastUsed: new Date(),
        count: 1,
      });
    }

    // Update device history
    const existingDevice = user.devices.find((d) => d.deviceId === deviceId);
    if (existingDevice) {
      existingDevice.lastUsed = new Date();
    } else {
      user.devices.push({
        deviceId,
        name: deviceName,
        lastUsed: new Date(),
        isTrusted: false,
      });
    }

    // Update trust score
    const newTrustScore = await trustScoreService.calculateTrustScore(userId);
    user.trustScore = newTrustScore.score;
    user.riskLevel = newTrustScore.riskLevel;

    if (isFlagged) {
      user.accountStatus = user.trustScore < 40 ? 'flagged' : 'active';
    }

    await user.save();

    // Create fraud log
    const fraudLog = new FraudLog({
      transactionId: transaction._id,
      userId,
      fraudScore: fraudAnalysis.score,
      aiReasons: explanations,
      riskFactors: {
        amountAnomaly: { detected: fraudAnalysis.riskFactors.amountRisk > 0.5, reason: 'Amount deviation detected' },
        locationAnomaly: { detected: fraudAnalysis.riskFactors.locationRisk > 0.4, reason: 'Unusual location detected' },
        timeAnomaly: { detected: fraudAnalysis.riskFactors.timeRisk > 0.5, reason: 'Unusual transaction time' },
        deviceAnomaly: { detected: fraudAnalysis.riskFactors.deviceRisk > 0.5, reason: 'New device detected' },
        frequencyAnomaly: { detected: fraudAnalysis.riskFactors.frequencyRisk > 0.4, reason: 'High transaction frequency' },
      },
      trustScoreAdjustment: isFlagged ? -5 : 0,
    });

    await fraudLog.save();

    return res.json({
      transaction: transaction._id,
      status,
      fraudScore: fraudAnalysis.score.toFixed(3),
      isFlagged,
      summary,
      explanations,
      trustScore: user.trustScore,
      riskLevel: user.riskLevel,
    });
  } catch (error) {
    console.error('Transaction submission error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/transactions/:userId
 * Get transaction history for a user
 */
export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const transactions = await Transaction.find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Transaction.countDocuments({ userId });

    res.json({
      transactions,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/trust-score/:userId
 * Get detailed trust score and insights
 */
export const getTrustScore = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const insights = await trustScoreService.getTrustScoreInsights(userId);

    res.json({
      userId,
      trustScore: user.trustScore,
      riskLevel: user.riskLevel,
      accountStatus: user.accountStatus,
      insights,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/fraud-logs/:transactionId
 * Get detailed fraud analysis for a specific transaction
 */
export const getFraudLog = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const fraudLog = await FraudLog.findOne({ transactionId });
    if (!fraudLog) {
      return res.status(404).json({ error: 'Fraud log not found' });
    }

    res.json(fraudLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  submitTransaction,
  getUserTransactions,
  getTrustScore,
  getFraudLog,
};
