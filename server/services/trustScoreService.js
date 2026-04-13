/**
 * Trust Score Service
 * Manages user trust scores based on transaction history and behavior
 *
 * Formula:
 * Trust Score = 100
 *   - (fraud_risk * 40)
 *   - (device_penalties)
 *   - (location_anomaly_penalty)
 *   + (consistent_behavior_bonus)
 */

export class TrustScoreService {
  constructor(userModel, transactionModel) {
    this.User = userModel;
    this.Transaction = transactionModel;
  }

  /**
   * Calculate new trust score for a user
   */
  async calculateTrustScore(userId) {
    const user = await this.User.findById(userId);
    if (!user) throw new Error('User not found');

    const recentTransactions = await this.Transaction.find({
      userId,
      timestamp: {
        $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      },
    });

    let score = 100;

    // Factor 1: Fraud risk impact
    const avgFraudScore = recentTransactions.reduce((sum, t) => sum + t.fraudScore, 0) / recentTransactions.length || 0;
    score -= avgFraudScore * 40;

    // Factor 2: Flagged transaction penalty
    const flaggedCount = recentTransactions.filter((t) => t.isFlagged).length;
    score -= flaggedCount * 5;

    // Factor 3: Device consistency bonus
    const uniqueDevices = new Set(recentTransactions.map((t) => t.deviceId)).size;
    if (uniqueDevices <= 2) {
      score += 10; // Bonus for consistent device usage
    } else if (uniqueDevices > 5) {
      score -= 15; // Penalty for too many devices
    }

    // Factor 4: Location consistency bonus
    const uniqueLocations = new Set(recentTransactions.map((t) => t.location)).size;
    if (uniqueLocations <= 3) {
      score += 8; // Bonus for consistent locations
    }

    // Factor 5: Transaction frequency consistency
    if (recentTransactions.length > 5) {
      score += 5; // Bonus for established activity history
    }

    // Factor 6: Recent clean history
    const recentClean = recentTransactions.filter(
      (t) =>
        t.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
        !t.isFlagged &&
        t.fraudScore < 0.3
    ).length;

    if (recentClean >= 3) {
      score += 10; // Bonus for recent clean activity
    }

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Determine risk level
    let riskLevel = 'low';
    if (score < 40) riskLevel = 'high';
    else if (score < 70) riskLevel = 'medium';

    return {
      score: Math.round(score),
      riskLevel,
      factors: {
        fraudRiskPenalty: Math.round(avgFraudScore * 40),
        flaggedTransactionPenalty: flaggedCount * 5,
        deviceConsistencyBonus: uniqueDevices <= 2 ? 10 : uniqueDevices > 5 ? -15 : 0,
        locationConsistencyBonus: uniqueLocations <= 3 ? 8 : 0,
        historyBonus: recentTransactions.length > 5 ? 5 : 0,
        recentCleanBonus: recentClean >= 3 ? 10 : 0,
      },
    };
  }

  /**
   * Update user trust score in database
   */
  async updateUserTrustScore(userId) {
    const calculation = await this.calculateTrustScore(userId);

    await this.User.findByIdAndUpdate(userId, {
      trustScore: calculation.score,
      riskLevel: calculation.riskLevel,
    });

    return calculation;
  }

  /**
   * Get trust score insights
   */
  async getTrustScoreInsights(userId) {
    const user = await this.User.findById(userId);
    if (!user) throw new Error('User not found');

    const calculation = await this.calculateTrustScore(userId);
    const recentTransactions = await this.Transaction.find({
      userId,
      timestamp: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    });

    const flaggedTransactions = recentTransactions.filter((t) => t.isFlagged).length;
    const totalTransactions = recentTransactions.length;

    return {
      currentScore: calculation.score,
      riskLevel: calculation.riskLevel,
      breakdown: calculation.factors,
      statistics: {
        totalTransactionsLastMonth: totalTransactions,
        flaggedTransactionsLastMonth: flaggedTransactions,
        approvalRate: totalTransactions > 0 ? ((totalTransactions - flaggedTransactions) / totalTransactions * 100).toFixed(1) : 100,
        uniqueDevices: new Set(recentTransactions.map((t) => t.deviceId)).size,
        uniqueLocations: new Set(recentTransactions.map((t) => t.location)).size,
      },
    };
  }
}

export default TrustScoreService;
