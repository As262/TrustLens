import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import FraudLog from '../models/FraudLog.js';
import AuditLog from '../models/AuditLog.js';
import Alert from '../models/Alert.js';
import { FraudService } from '../services/fraudService.js';
import { ExplainabilityService } from '../services/explainabilityService.js';
import { TrustScoreService } from '../services/trustScoreService.js';
import DecisionEngine from '../services/decisionEngine.js';
import { SmartRiskEngineService } from '../services/smartRiskEngineService.js';
import { WebsiteReputationService } from '../services/websiteReputationService.js';

const fraudService = new FraudService(User, Transaction);
const explainabilityService = new ExplainabilityService();
const trustScoreService = new TrustScoreService(User, Transaction);
const smartRiskEngine = new SmartRiskEngineService(User, Transaction);
const websiteReputationService = new WebsiteReputationService();

const clampTrust = (score) => Math.max(0, Math.min(100, Math.round(score)));

const mapFinalToLegacyDecision = (finalDecision) => {
  if (finalDecision === 'BLOCKED') return 'DECLINE';
  if (finalDecision === 'WARNING') return 'CHALLENGE';
  return 'APPROVE';
};

const mapFinalToStatus = (finalDecision) => {
  if (finalDecision === 'BLOCKED') return 'declined';
  if (finalDecision === 'WARNING') return 'flagged';
  return 'completed';
};

/**
 * Trust score impact for the SENDER.
 *
 * Core principle (per product requirement):
 *   - Unusual sender behaviour (large amount, new location, odd hour) should NOT
 *     reduce the sender's trust score.  These are risk signals for the current
 *     payment only, not proof that the sender is untrustworthy.
 *   - The score only falls when the PAYEE is identified as fraudulent, i.e. there
 *     is community-reported fraud or payee-level fraud evidence for the recipient.
 *   - A successful safe payment still earns a small reward.
 */
const calculateTrustImpactFromDecision = (analysis) => {
  const reportCount   = analysis.community?.reportCount || 0;
  const payeeFraud    = analysis.payeeTrust?.payeeTrustLevel === 'LOW_TRUST';
  const payeeScore    = Number(analysis.payeeTrust?.payeeTrustScore ?? 100);
  const riskScore     = Number(analysis.finalRiskScore || 0);

  // ── 1. Community-confirmed fraud recipient ─────────────────────────────────
  // Other users have already reported this payee — highest penalty.
  if (reportCount >= 8) return -12;
  if (reportCount >= 3) return -8;
  if (reportCount > 0)  return -5;

  // ── 2. Payee identified as LOW_TRUST by the AI payee-trust engine ──────────
  // The AI determined the recipient is suspicious regardless of sender behaviour.
  if (payeeFraud || payeeScore < 30) return -6;
  if (payeeScore < 50)               return -3;

  // ── 3. Transaction is BLOCKED but NOT due to payee fraud ──────────────────
  // e.g. triggered purely by sender-side anomaly (unusual amount, new location).
  // → Do NOT penalise the sender.  They may simply be making a large purchase.
  if (analysis.status === 'BLOCKED') {
    // Only penalise if the block was payee-driven (high risk score AND payee-related)
    const payeeDrivenBlock = riskScore > 0.85 && (payeeFraud || reportCount > 0);
    return payeeDrivenBlock ? -8 : 0;
  }

  // ── 4. WARNING status ─────────────────────────────────────────────────────
  // Warnings from sender-side anomalies (amount, location, time) → no penalty.
  if (analysis.status === 'WARNING') return 0;

  // ── 5. Safe, approved payment → small reward ──────────────────────────────
  if (riskScore < 0.2) return 4;
  return 2;
};

const validateTransactionInput = (payload, requireRecipient = true) => {
  const { userId, amount, location, deviceId, recipient } = payload;
  if (!userId || Number.isNaN(Number(amount)) || Number(amount) <= 0 || !location || !deviceId) {
    return 'Missing or invalid required fields';
  }
  if (requireRecipient && !String(recipient || '').trim()) {
    return 'Recipient is required';
  }
  return null;
};

const derivePayeeIdentifier = (analysis, recipientRaw) => {
  const extracted = String(analysis?.link?.extractedUpiId || '').trim().toLowerCase();
  if (extracted) return extracted;
  return String(recipientRaw || '').trim().toLowerCase();
};

const applyInboundPayeeReputationDelta = (status) => {
  if (status === 'APPROVED') return 2;
  if (status === 'WARNING') return 0;
  return -2;
};

const updatePayeeReputationFromIncomingPayment = async (analysis, normalizedPayload) => {
  const payeeIdentifier = derivePayeeIdentifier(analysis, normalizedPayload.recipient);
  if (!payeeIdentifier || !payeeIdentifier.includes('@')) {
    return null;
  }

  const payeeUser = await User.findOne({ upiId: payeeIdentifier });
  if (!payeeUser) {
    return null;
  }

  const delta = applyInboundPayeeReputationDelta(analysis.status);
  payeeUser.payeeTrustScore = clampTrust((payeeUser.payeeTrustScore || 60) + delta);
  payeeUser.incomingPaymentsCount = (payeeUser.incomingPaymentsCount || 0) + 1;
  await payeeUser.save();

  return {
    userId: payeeUser._id,
    upiId: payeeUser.upiId,
    payeeTrustScore: payeeUser.payeeTrustScore,
    incomingPaymentsCount: payeeUser.incomingPaymentsCount,
  };
};

/**
 * GET /api/transactions/payee-profile/:userId
 * Get sender trust and inbound payee reputation for current user
 */
export const getPayeeProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId,
      payerTrustScore: user.trustScore,
      payeeTrustScore: user.payeeTrustScore || 60,
      incomingPaymentsCount: user.incomingPaymentsCount || 0,
      upiId: user.upiId || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/transactions/websites
 * Get known website reputation list used by link intelligence
 */
export const getWebsiteDatabase = async (req, res) => {
  try {
    const websites = await websiteReputationService.listKnownWebsites({ limit: 200 });
    res.json({ websites, total: websites.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/transactions/analyze
 * Real-time risk analysis before payment submission
 */
export const analyzeTransaction = async (req, res) => {
  try {
    const { userId, amount, recipient, location, deviceId, deviceName, category, time, sourceContext } = req.body;

    const validationError = validateTransactionInput(
      { userId, amount, recipient, location, deviceId },
      true
    );
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const analysis = await smartRiskEngine.analyze({
      userId,
      amount: Number(amount),
      recipient: String(recipient).trim(),
      location: String(location).trim(),
      deviceId: String(deviceId).trim(),
      deviceName: String(deviceName || '').trim(),
      category,
      time,
      sourceContext,
    });

    return res.json({
      status: analysis.status,
      overall_status: analysis.overallStatus,
      final_risk_score: analysis.finalRiskScore,
      finalRiskScore: analysis.finalRiskScore,
      confidence_level: analysis.confidenceLevel,
      payee_trust_score: analysis.payeeTrust?.payeeTrustScore,
      payee_trust_level: analysis.payeeTrust?.payeeTrustLevel,
      reasons: analysis.reasons,
      recommendation: analysis.recommendation,
      risk_level: analysis.riskLevel,
      breakdown: {
        fraud_score: analysis.fraud.fraudScore,
        link_risk_score: analysis.link.linkRiskScore,
        community_risk: analysis.community.communityRiskScore,
      },
      community: {
        report_count: analysis.community.reportCount,
        risk_level: analysis.community.riskLevel,
      },
      link: analysis.link,
      context: analysis.context,
      payeeTrust: analysis.payeeTrust,
      website: analysis.website,
      latencyMs: analysis.latencyMs,
      performanceTargetMet: analysis.latencyMs < 500,
    });
  } catch (error) {
    console.error('Transaction analysis error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/transactions
 * Submit a new transaction for fraud detection and analysis
 */
export const submitTransaction = async (req, res) => {
  try {
    const { userId, amount, recipient, location, deviceId, deviceName, category, time, sourceContext } = req.body;

    const validationError = validateTransactionInput(
      { userId, amount, recipient, location, deviceId },
      true
    );
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const normalizedPayload = {
      userId,
      amount: Number(amount),
      recipient: String(recipient).trim(),
      location: String(location).trim(),
      deviceId: String(deviceId).trim(),
      deviceName: String(deviceName || '').trim(),
      category,
      time,
      sourceContext,
    };

    const analysis = await smartRiskEngine.analyze(normalizedPayload);

    const recentTransactions = await Transaction.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const averageAmount = recentTransactions.length > 0
      ? recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length
      : normalizedPayload.amount;

    const fraudAnalysis = await fraudService.calculateFraudScore(userId, {
      amount: normalizedPayload.amount,
      location: normalizedPayload.location,
      deviceId: normalizedPayload.deviceId,
      timestamp: normalizedPayload.time ? new Date(normalizedPayload.time) : new Date(),
    });

    // Generate explanations
    const explanations = explainabilityService.generateExplanations(
      {
        amount: normalizedPayload.amount,
        location: normalizedPayload.location,
        deviceId: normalizedPayload.deviceId,
        deviceName: normalizedPayload.deviceName,
        timestamp: normalizedPayload.time ? new Date(normalizedPayload.time) : new Date(),
      },
      fraudAnalysis,
      { averageAmount }
    );

    const summary = explainabilityService.generateSummary(fraudAnalysis.fraudScore, explanations, fraudAnalysis);

    const isFlagged = analysis.status !== 'APPROVED';
    const status = mapFinalToStatus(analysis.status);
    const decisionName = mapFinalToLegacyDecision(analysis.status);
    const trustScoreImpact = calculateTrustImpactFromDecision(analysis);

    const decisionResult = await DecisionEngine.makeDecision(
      {
        amount: normalizedPayload.amount,
        location: normalizedPayload.location,
        deviceId: normalizedPayload.deviceId,
        deviceName: normalizedPayload.deviceName,
        timestamp: normalizedPayload.time ? new Date(normalizedPayload.time) : new Date(),
        category: normalizedPayload.category,
      },
      fraudAnalysis,
      user
    );

    const transaction = new Transaction({
      userId,
      amount: normalizedPayload.amount,
      recipient: normalizedPayload.recipient,
      location: normalizedPayload.location,
      deviceId: normalizedPayload.deviceId,
      deviceName: normalizedPayload.deviceName,
      category: normalizedPayload.category,
      fraudScore: fraudAnalysis.fraudScore,
      isFlagged,
      explanations,
      status,
      decision: decisionName,
      riskLevel: analysis.riskLevel,
      trustLevel: decisionResult.trustLevel,
      systemMessage: analysis.recommendation,
      reasoning: {
        fraudReason: summary.summary,
        trustReason: `Trust impact ${trustScoreImpact > 0 ? '+' : ''}${trustScoreImpact}`,
        decisionFactors: analysis.reasons,
      },
      trustScoreImpact,
      finalRiskScore: analysis.finalRiskScore,
      finalDecision: analysis.status,
      recommendation: analysis.recommendation,
      riskReasons: analysis.reasons,
      riskBreakdown: {
        fraudScore: analysis.fraud.fraudScore,
        linkRiskScore: analysis.link.linkRiskScore,
        communityRiskScore: analysis.community.communityRiskScore,
        reportCount: analysis.community.reportCount,
      },
      linkMeta: {
        recipientType: analysis.link.recipientType,
        sanitizedRecipient: analysis.link.sanitizedRecipient,
        extractedUpiId: analysis.link.extractedUpiId,
        isHttps: analysis.link.isHttps,
      },
      payeeTrustScore: analysis.payeeTrust?.payeeTrustScore,
      payeeTrustLevel: analysis.payeeTrust?.payeeTrustLevel,
      payeeTrustReasons: analysis.payeeTrust?.reasons || [],
      analysisLatencyMs: analysis.latencyMs,
    });

    await transaction.save();

    // Update user location history
    const existingLocation = user.locationHistory.find(
      (loc) => loc.location.toLowerCase() === normalizedPayload.location.toLowerCase()
    );

    if (existingLocation) {
      existingLocation.lastUsed = new Date();
      existingLocation.count = (existingLocation.count || 0) + 1;
    } else {
      user.locationHistory.push({
        location: normalizedPayload.location,
        lastUsed: new Date(),
        count: 1,
      });
    }

    // Update device history
    const existingDevice = user.devices.find((d) => d.deviceId === normalizedPayload.deviceId);
    if (existingDevice) {
      existingDevice.lastUsed = new Date();
    } else {
      user.devices.push({
        deviceId: normalizedPayload.deviceId,
        name: normalizedPayload.deviceName,
        lastUsed: new Date(),
        isTrusted: false,
      });
    }

    const recalculatedTrust = await trustScoreService.calculateTrustScore(userId);
    user.trustScore = clampTrust(recalculatedTrust.score + trustScoreImpact);
    user.riskLevel = recalculatedTrust.riskLevel;

    if (analysis.status === 'BLOCKED' || isFlagged) {
      user.accountStatus = user.trustScore < 40 ? 'flagged' : 'active';
    }

    await user.save();

    const inboundPayeeUpdate = await updatePayeeReputationFromIncomingPayment(analysis, normalizedPayload);

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
      trustScoreAdjustment: trustScoreImpact,
    });

    await fraudLog.save();

    // Create audit log for complete audit trail
    const auditLog = new AuditLog({
      transactionId: transaction._id,
      userId,
      decision: decisionName,
      riskLevel: analysis.riskLevel,
      trustLevel: decisionResult.trustLevel,
      fraudScore: fraudAnalysis.fraudScore,
      trustScore: user.trustScore,
      confidence: decisionResult.confidence,
      systemMessage: decisionResult.systemMessage,
      reasoning: decisionResult.reasoning,
      transactionDetails: {
        amount: normalizedPayload.amount,
        location: normalizedPayload.location,
        timestamp: normalizedPayload.time ? new Date(normalizedPayload.time) : new Date(),
        category: normalizedPayload.category,
        deviceName: normalizedPayload.deviceName,
        deviceId: normalizedPayload.deviceId,
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
        taken: decisionName === 'APPROVE' ? 'APPROVED' :
               decisionName === 'CHALLENGE' ? 'CHALLENGED' :
               decisionName === 'DECLINE' ? 'DECLINED' :
               decisionName === 'ESCALATE' ? 'ESCALATED' : 'HELD',
        approvalTime: new Date(),
        manualReview: ['ESCALATE', 'CHALLENGE', 'DECLINE'].includes(decisionName),
      },
    });

    await auditLog.save();

    // Associate audit log with transaction
    transaction.auditLogId = auditLog._id;
    await transaction.save();

    if (analysis.status !== 'APPROVED') {
      const alert = new Alert({
        userId,
        type: 'fraud',
        severity: analysis.status === 'BLOCKED' ? 'critical' : 'high',
        message: `${analysis.status === 'BLOCKED' ? 'Blocked' : 'Warning'} payment: ${normalizedPayload.category} payment of ₹${normalizedPayload.amount} to ${normalizedPayload.recipient}.`,
        metadata: {
          transactionId: transaction._id,
          amount: normalizedPayload.amount,
          recipient: normalizedPayload.recipient,
          location: normalizedPayload.location,
          fraudScore: fraudAnalysis.fraudScore,
          finalRiskScore: analysis.finalRiskScore,
          decision: decisionName,
          finalDecision: analysis.status,
        },
      });
      await alert.save();

      req.io?.emit('fraudDetected', {
        type: 'transaction-risk',
        title: 'Suspicious transaction detected',
        status: analysis.status,
        finalRiskScore: analysis.finalRiskScore,
        reasons: analysis.reasons,
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({
      transaction: transaction._id,
      decision: decisionName,
      status: analysis.status,
      overall_status: analysis.overallStatus,
      final_risk_score: analysis.finalRiskScore,
      finalRiskScore: analysis.finalRiskScore,
      confidence_level: analysis.confidenceLevel,
      payee_trust_score: analysis.payeeTrust?.payeeTrustScore,
      payee_trust_level: analysis.payeeTrust?.payeeTrustLevel,
      recommendation: analysis.recommendation,
      reasons: analysis.reasons,
      website: analysis.website,
      riskLevel: analysis.riskLevel,
      trustLevel: decisionResult.trustLevel,
      fraudScore: decisionResult.fraudScore.toFixed(3),
      confidence: decisionResult.confidence.toFixed(2),
      systemMessage: analysis.recommendation,
      transactionStatus: status,
      isFlagged,
      summary,
      explanations,
      reasoning: decisionResult.reasoning,
      canAppeal: decisionResult.canAppeal,
      auditLogId: auditLog._id,
      trustScore: user.trustScore,
      trustScoreImpact,
      payeeTrust: analysis.payeeTrust,
      inboundPayeeUpdate,
      reportCount: analysis.community.reportCount,
      latencyMs: analysis.latencyMs,
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

/**
 * GET /api/transactions/resolve-upi/:upiId
 * Resolve a UPI ID to the registered account holder's name.
 * Checks: 1) our User DB  2) demo mock registry for hackathon demos.
 */
export const resolveUpiId = async (req, res) => {
  try {
    const rawUpiId = String(req.params.upiId || '').trim().toLowerCase();
    if (!rawUpiId || !rawUpiId.includes('@')) {
      return res.status(400).json({ error: 'Invalid UPI ID format' });
    }

    // 1. Check our registered users first
    const user = await User.findOne({ upiId: rawUpiId });
    if (user && user.name) {
      return res.json({
        found: true,
        upiId: rawUpiId,
        name: user.name,
        trustScore: user.payeeTrustScore || 60,
        source: 'registered',
      });
    }

    // 2. Demo mock registry — covers common UPI patterns for hackathon demo
    //    In production this would be a real NPCI VPA resolution call.
    const MOCK_UPI_REGISTRY = {
      'safe@upi':              { name: 'Rahul Sharma',    trust: 92 },
      'merchant@oksbi':        { name: 'Krishna Traders', trust: 88 },
      'shop@ybl':              { name: 'Meena Store',     trust: 85 },
      'store@paytm':           { name: 'PayTM Merchant',  trust: 84 },
      'vendor@upi':            { name: 'Vijay Vendors',   trust: 80 },
      'retailer@okaxis':       { name: 'Axis Retailer',   trust: 83 },
      'business@okhdfcbank':   { name: 'HDFC Business',   trust: 87 },
      'zomato@icici':          { name: 'Zomato Online',   trust: 95 },
      'swiggy@hdfc':           { name: 'Swiggy Food',     trust: 94 },
      'flipkart@ybl':          { name: 'Flipkart India',  trust: 96 },
      'fraudster@upi':         { name: 'FRAUD ACCOUNT',   trust: 10 },
      'demo@trustlens.com':    { name: 'Demo User',       trust: 75 },
    };

    // Exact match in mock registry
    if (MOCK_UPI_REGISTRY[rawUpiId]) {
      const entry = MOCK_UPI_REGISTRY[rawUpiId];
      return res.json({
        found: true,
        upiId: rawUpiId,
        name: entry.name,
        trustScore: entry.trust,
        source: 'registry',
      });
    }

    // 3. Pattern-based inference for phone-number UPIs (e.g. 918699161787@ucc)
    //    Real phone-based UPIs are valid — we just can't resolve the name without
    //    NPCI access, so we return found=false with a helpful message.
    const phoneUpiPattern = /^[6-9]\d{9}@[a-z]+$|^91[6-9]\d{9}@[a-z]+$/;
    if (phoneUpiPattern.test(rawUpiId)) {
      return res.json({
        found: false,
        upiId: rawUpiId,
        name: null,
        message: 'Phone-linked UPI — name lookup requires live bank verification. Scan the payee\'s QR code to confirm their identity.',
        source: 'unresolvable',
      });
    }

    // 4. Not found
    return res.json({
      found: false,
      upiId: rawUpiId,
      name: null,
      message: 'UPI ID not found in registry. Scan the payee\'s QR code to confirm their identity.',
      source: 'not_found',
    });
  } catch (error) {
    console.error('UPI resolve error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  analyzeTransaction,
  submitTransaction,
  getPayeeProfile,
  getWebsiteDatabase,
  getUserTransactions,
  getTrustScore,
  getFraudLog,
  approveTransaction,
};
