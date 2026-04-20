import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import FraudLog from '../models/FraudLog.js';
import AuditLog from '../models/AuditLog.js';
import Alert from '../models/Alert.js';
import { FraudService } from '../services/fraudService.js';
import { ExplainabilityService } from '../services/explainabilityService.js';
import { TrustScoreService } from '../services/trustScoreService.js';
import DecisionEngine from '../services/decisionEngine.js';

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

    const summary = explainabilityService.generateSummary(fraudAnalysis.fraudScore, explanations, fraudAnalysis);

    // Determine if transaction should be flagged
    const isFlagged = fraudAnalysis.fraudScore > 0.6;
    const status = isFlagged ? 'flagged' : 'completed';

    // Use DecisionEngine to make production-grade decision
    const decisionResult = await DecisionEngine.makeDecision(
      { amount, location, deviceId, deviceName, timestamp: new Date(), category },
      fraudAnalysis,
      user
    );

    // Create transaction record with decision data
    const transaction = new Transaction({
      userId,
      amount,
      location,
      deviceId,
      deviceName,
      category,
      fraudScore: fraudAnalysis.fraudScore,
      isFlagged,
      explanations,
      status,
      decision: decisionResult.decisionName,
      riskLevel: decisionResult.riskLevel,
      trustLevel: decisionResult.trustLevel,
      systemMessage: decisionResult.systemMessage,
      reasoning: decisionResult.reasoning,
      trustScoreImpact: DecisionEngine.calculateTrustImpact(
        decisionResult.decisionName,
        fraudAnalysis.fraudScore
      ),
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
      fraudScore: fraudAnalysis.fraudScore,
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

    // Create audit log for complete audit trail
    const auditLog = new AuditLog({
      transactionId: transaction._id,
      userId,
      decision: decisionResult.decisionName,
      riskLevel: decisionResult.riskLevel,
      trustLevel: decisionResult.trustLevel,
      fraudScore: fraudAnalysis.fraudScore,
      trustScore: user.trustScore,
      confidence: decisionResult.confidence,
      systemMessage: decisionResult.systemMessage,
      reasoning: decisionResult.reasoning,
      transactionDetails: {
        amount,
        location,
        timestamp: new Date(),
        category,
        deviceName,
        deviceId,
      },
      userContext: {
        accountAge: user.behavioralProfile?.accountAge || 0,
        accountStatus: user.accountStatus,
        fraudHistoryCount: user.behavioralProfile?.fraudFlagCount || 0,
        historicalFlagRate: user.behavioralProfile?.fraudFlagRate || 0,
        behavioralProfile: {
          typicalAmountMean: user.behavioralProfile?.amountStats?.mean || 0,
          typicalAmountStdDev: user.behavioralProfile?.amountStats?.stdDev || 0,
          primaryLocations: user.behavioralProfile?.primaryLocations || [],
        },
      },
      decisionEngine: {
        version: decisionResult.decisionEngineVersion,
        model: decisionResult.model,
        updatedAt: decisionResult.timestamp,
      },
      action: {
        taken: decisionResult.decisionName === 'APPROVE' ? 'APPROVED' :
               decisionResult.decisionName === 'CHALLENGE' ? 'CHALLENGED' :       
               decisionResult.decisionName === 'DECLINE' ? 'DECLINED' :
               decisionResult.decisionName === 'ESCALATE' ? 'ESCALATED' : 'HELD', 
        approvalTime: new Date(),
        manualReview: ['ESCALATE', 'CHALLENGE'].includes(decisionResult.decisionName),
      },
    });

    await auditLog.save();

    // Associate audit log with transaction
    transaction.auditLogId = auditLog._id;
    await transaction.save();

    // Create an alert if flagged
    if (isFlagged) {
      const alert = new Alert({
        userId,
        type: 'fraud',
        severity: fraudAnalysis.fraudScore > 0.8 ? 'critical' : 'high',
        message: `High risk transaction flagged: ${category} payment of $${amount} in ${location}.`,
        metadata: {
          transactionId: transaction._id,
          amount,
          location,
          fraudScore: fraudAnalysis.fraudScore,
          decision: decisionResult.decisionName,
        },
      });
      await alert.save();
    }

    return res.json({
      transaction: transaction._id,
      decision: decisionResult.decisionName,
      riskLevel: decisionResult.riskLevel,
      trustLevel: decisionResult.trustLevel,
      fraudScore: decisionResult.fraudScore.toFixed(3),
      confidence: decisionResult.confidence.toFixed(2),
      systemMessage: decisionResult.systemMessage,
      status,
      isFlagged,
      summary,
      explanations,
      reasoning: decisionResult.reasoning,
      canAppeal: decisionResult.canAppeal,
      auditLogId: auditLog._id,
      trustScore: user.trustScore,
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
    const { limit = 20, offset = 0, status, isFlagged } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (isFlagged !== undefined) query.isFlagged = isFlagged === 'true';

    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Transaction.countDocuments(query);

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

/**
 * PUT /api/transactions/:transactionId/approve
 * Manually approve a flagged or declined transaction
 */
export const approveTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const { userId } = transaction;
    const user = await User.findById(userId);

    // Increase trust score significantly for a manual override
    if (user) {
      user.trustScore = Math.min(100, user.trustScore + 15);
      await user.save();
    }

    // Update transaction to approved
    transaction.status = 'completed';
    transaction.decision = 'APPROVE';
    transaction.isFlagged = false;
    transaction.trustScoreImpact = 15;
    
    if (transaction.reasoning) {
      transaction.reasoning.fraudReason = 'Manually verified and approved by user request.';
      transaction.systemMessage = 'Payment Allowed (Manual Override)';
    } else {
      transaction.systemMessage = 'Payment Allowed (Manual Override)';
    }

    await transaction.save();

    res.json({ message: 'Transaction successfully approved', transaction, updatedTrustScore: user?.trustScore });
  } catch (error) {
    console.error('Approve Error: ', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  submitTransaction,
  getUserTransactions,
  getTrustScore,
  getFraudLog,
  approveTransaction,
};
