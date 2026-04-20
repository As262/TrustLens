import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import FraudLog from '../models/FraudLog.js';
import { FraudService } from '../services/fraudService.js';
import { ExplainabilityService } from '../services/explainabilityService.js';
import { TrustScoreService } from '../services/trustScoreService.js';

const fraudService = new FraudService(User, Transaction);
const explainabilityService = new ExplainabilityService();
const trustScoreService = new TrustScoreService(User, Transaction);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Update device record for the user with enhanced tracking.
 * Tracks usage count, locations used from, and first/last seen times.
 */
function updateDeviceRecord(user, { deviceId, deviceName, location }) {
  const existing = user.devices.find((d) => d.deviceId === deviceId);

  if (existing) {
    existing.lastUsed = new Date();
    existing.useCount = (existing.useCount || 0) + 1;
    // Track unique locations for this device
    if (!existing.locations) existing.locations = [];
    if (!existing.locations.includes(location)) {
      existing.locations.push(location);
    }
  } else {
    user.devices.push({
      deviceId,
      name: deviceName || 'Unknown Device',
      firstSeen: new Date(),
      lastUsed: new Date(),
      useCount: 1,
      locations: [location],
      isTrusted: false,
      isBlocked: false,
    });
  }
}

/**
 * Update location history for the user.
 */
function updateLocationRecord(user, location) {
  const existing = user.locationHistory.find(
    (loc) => loc.location.toLowerCase() === location.toLowerCase()
  );

  if (existing) {
    existing.lastUsed = new Date();
    existing.count = (existing.count || 0) + 1;
  } else {
    user.locationHistory.push({ location, lastUsed: new Date(), count: 1 });
  }
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/transactions
 * Submit a new transaction for fraud detection and analysis.
 * userId now comes from the authenticated JWT (req.user.id).
 */
export const submitTransaction = async (req, res) => {
  try {
    // ── Identity from JWT, not body ─────────────────────────────────────────
    const userId = req.user.id;
    const { amount, location, deviceId, deviceName, category, currency = 'USD' } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'NotFound', message: 'User not found' });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // ── Historical context ──────────────────────────────────────────────────
    const recentTransactions = await Transaction.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const averageAmount =
      recentTransactions.length > 0
        ? recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length
        : amount;

    // ── Fraud analysis ──────────────────────────────────────────────────────
    const fraudAnalysis = await fraudService.calculateFraudScore(userId, {
      amount,
      location,
      deviceId,
      timestamp: new Date(),
    });

    const explanations = explainabilityService.generateExplanations(
      { amount, location, deviceId, deviceName, timestamp: new Date() },
      fraudAnalysis,
      { averageAmount }
    );

    const summary = explainabilityService.generateSummary(fraudAnalysis.score, explanations);

    const isFlagged = fraudAnalysis.score > (parseFloat(process.env.FRAUD_THRESHOLD) || 0.6);
    const status    = isFlagged ? 'flagged' : 'completed';

    // ── Persist transaction ─────────────────────────────────────────────────
    const transaction = new Transaction({
      userId,
      amount,
      currency,
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

    // ── Update user behavioral fingerprint ─────────────────────────────────
    updateDeviceRecord(user, { deviceId, deviceName, location });
    updateLocationRecord(user, location);

    // Track last transaction time (for decay calculation)
    user.lastTransactionAt = new Date();

    // ── Recalculate trust score ─────────────────────────────────────────────
    const newTrustScore = await trustScoreService.calculateTrustScore(userId);
    user.trustScore = newTrustScore.score;
    user.riskLevel  = newTrustScore.riskLevel;

    if (isFlagged && user.trustScore < 40) {
      user.accountStatus = 'flagged';
    }

    await user.save();

    // ── Fraud log ───────────────────────────────────────────────────────────
    const fraudLog = new FraudLog({
      transactionId:        transaction._id,
      userId,
      fraudScore:           fraudAnalysis.score,
      aiReasons:            explanations,
      riskFactors: {
        amountAnomaly:    { detected: fraudAnalysis.riskFactors.amountRisk > 0.5,    reason: 'Amount deviation detected' },
        locationAnomaly:  { detected: fraudAnalysis.riskFactors.locationRisk > 0.4,  reason: 'Unusual location detected' },
        timeAnomaly:      { detected: fraudAnalysis.riskFactors.timeRisk > 0.5,      reason: 'Unusual transaction time' },
        deviceAnomaly:    { detected: fraudAnalysis.riskFactors.deviceRisk > 0.5,    reason: 'New device detected' },
        frequencyAnomaly: { detected: fraudAnalysis.riskFactors.frequencyRisk > 0.4, reason: 'High transaction frequency' },
      },
      trustScoreAdjustment: isFlagged ? -5 : 0,
    });

    await fraudLog.save();

    // ── Real-time Socket.io broadcast ───────────────────────────────────────
    if (isFlagged && req.io) {
      req.io.emit('fraudFlagged', {
        transactionId: transaction._id,
        userId,
        amount,
        location,
        deviceName,
        category,
        fraudScore:       fraudAnalysis.score,
        riskLevel:        newTrustScore.riskLevel,
        summary:          summary.summary,
        severity:         fraudAnalysis.score > 0.8 ? 'critical' : 'high',
        timestamp:        new Date().toISOString(),
        explanations,
        trustScoreImpact: -5,
      });
      console.log(`🚨 [REALTIME] Fraud detected and broadcast: ${transaction._id}`);
    }

    return res.json({
      transaction:  transaction._id,
      status,
      fraudScore:   fraudAnalysis.score.toFixed(3),
      isFlagged,
      summary,
      explanations,
      trustScore:   user.trustScore,
      riskLevel:    user.riskLevel,
    });
  } catch (error) {
    console.error('Transaction submission error:', error);
    return res.status(500).json({ error: 'InternalError', message: error.message });
  }
};

/**
 * GET /api/transactions/user/:userId
 */
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { limit = 20, offset = 0 } = req.query;

    // Users can only read their own transactions
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }

    const transactions = await Transaction.find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Transaction.countDocuments({ userId });

    return res.json({ transactions, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    return res.status(500).json({ error: 'InternalError', message: error.message });
  }
};

/**
 * GET /api/transactions/trust-score/:userId
 */
export const getTrustScore = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'NotFound', message: 'User not found' });

    const insights = await trustScoreService.getTrustScoreInsights(userId);

    if (user.trustScore !== insights.currentScore || user.riskLevel !== insights.riskLevel) {
      user.trustScore = insights.currentScore;
      user.riskLevel = insights.riskLevel;
      await user.save();
    }

    return res.json({
      userId,
      trustScore:    insights.currentScore,
      riskLevel:     insights.riskLevel,
      accountStatus: user.accountStatus,
      insights,
    });
  } catch (error) {
    return res.status(500).json({ error: 'InternalError', message: error.message });
  }
};

/**
 * GET /api/transactions/fraud-log/:transactionId
 */
export const getFraudLog = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const fraudLog = await FraudLog.findOne({ transactionId });
    if (!fraudLog) {
      return res.status(404).json({ error: 'NotFound', message: 'Fraud log not found' });
    }

    // Verify this log belongs to the requesting user
    if (fraudLog.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }

    return res.json(fraudLog);
  } catch (error) {
    return res.status(500).json({ error: 'InternalError', message: error.message });
  }
};

export default { submitTransaction, getUserTransactions, getTrustScore, getFraudLog };
