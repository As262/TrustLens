/**
 * Trust Score Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Formula (base 78):
 *   + consistency/history bonuses
 *   - fraud/flagged/inactivity penalties
 *   - inactivity_decay             (1 pt/day after 30 day gap, max -15)
 */

export class TrustScoreService {
  constructor(userModel, transactionModel) {
    this.User        = userModel;
    this.Transaction = transactionModel;
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Calculate how many inactivity-decay points to apply.
   * Rule: if the user's last transaction was > 30 days ago,
   *       decay 1 pt per day of inactivity beyond 30 days (max 15 pts).
   */
  _calcInactivityDecay(user, recentTransactions) {
    // If there are recent transactions (last 30 days), no decay
    if (recentTransactions.length > 0) return 0;

    const lastTxAt = user.lastTransactionAt;
    if (!lastTxAt) return 0; // Brand-new account — no decay

    const daysSinceLast = Math.floor((Date.now() - lastTxAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLast <= 30) return 0;

    const decayDays  = daysSinceLast - 30;
    const decayPts   = Math.min(decayDays, 15); // cap at 15 points
    return decayPts;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Calculate new trust score for a user.
   * Does NOT persist — call updateUserTrustScore() for that.
   */
  async calculateTrustScore(userId) {
    const user = await this.User.findById(userId);
    if (!user) throw new Error('User not found');

    const recentTransactions = await this.Transaction.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Last 90 days
    });

    // Start users below 100 so trust can grow or shrink based on behavior.
    let score = 78;

    // Factor 1: Average fraud score impact
    const avgFraudScore =
      recentTransactions.length > 0
        ? recentTransactions.reduce((sum, t) => sum + t.fraudScore, 0) / recentTransactions.length
        : 0;
    const fraudPenalty = avgFraudScore * 45;
    score -= fraudPenalty;

    // Factor 2: Flagged transaction penalty
    const flaggedCount     = recentTransactions.filter((t) => t.isFlagged).length;
    const flaggedPenalty   = flaggedCount * 8;
    score -= flaggedPenalty;

    // Factor 3: Device consistency
    const uniqueDevices = new Set(recentTransactions.map((t) => t.deviceId).filter(Boolean)).size;
    let deviceBonus = 0;
    if (recentTransactions.length > 0 && uniqueDevices <= 2) deviceBonus = 10;
    else if (uniqueDevices > 5) deviceBonus = -15;
    score += deviceBonus;

    // Factor 4: Location consistency
    const uniqueLocations = new Set(recentTransactions.map((t) => t.location).filter(Boolean)).size;
    const locationBonus   = recentTransactions.length > 0 && uniqueLocations <= 3 ? 8 : 0;
    score += locationBonus;

    // Factor 5: Established history bonus
    const historyBonus = recentTransactions.length > 10 ? 6 : recentTransactions.length > 4 ? 3 : 0;
    score += historyBonus;

    // Factor 6: Recent clean streak (last 7 days, no flags, low score)
    const recentClean = recentTransactions.filter(
      (t) =>
        t.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
        !t.isFlagged &&
        t.fraudScore < 0.3
    ).length;
    const cleanBonus = recentClean >= 3 ? 10 : 0;
    score += cleanBonus;

    // Factor 7: Inactivity decay ─ NEW
    const decayPenalty = this._calcInactivityDecay(user, recentTransactions);
    score -= decayPenalty;

    // Clamp
    score = Math.max(0, Math.min(100, Math.round(score)));

    const riskLevel = score < 40 ? 'high' : score < 70 ? 'medium' : 'low';

    return {
      score,
      riskLevel,
      factors: {
        fraudRiskPenalty:          Math.round(fraudPenalty),
        flaggedTransactionPenalty: flaggedPenalty,
        deviceConsistencyBonus:    deviceBonus,
        locationConsistencyBonus:  locationBonus,
        historyBonus,
        recentCleanBonus:          cleanBonus,
        inactivityDecayPenalty:    decayPenalty,        // ← new
      },
    };
  }

  /**
   * Calculate + persist trust score update for a user.
   */
  async updateUserTrustScore(userId) {
    const calculation = await this.calculateTrustScore(userId);

    await this.User.findByIdAndUpdate(userId, {
      trustScore: calculation.score,
      riskLevel:  calculation.riskLevel,
      trustScoreLastDecayAt: new Date(),
    });

    return calculation;
  }

  /**
   * Full insights object for the /trust-score endpoint.
   */
  async getTrustScoreInsights(userId) {
    const user = await this.User.findById(userId);
    if (!user) throw new Error('User not found');

    const calculation = await this.calculateTrustScore(userId);

    const recentTransactions = await this.Transaction.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const flaggedTransactions = recentTransactions.filter((t) => t.isFlagged).length;
    const totalTransactions   = recentTransactions.length;

    return {
      currentScore: calculation.score,
      riskLevel:    calculation.riskLevel,
      breakdown:    calculation.factors,
      statistics: {
        totalTransactionsLastMonth:   totalTransactions,
        flaggedTransactionsLastMonth: flaggedTransactions,
        approvalRate:
          totalTransactions > 0
            ? (((totalTransactions - flaggedTransactions) / totalTransactions) * 100).toFixed(1)
            : 100,
        uniqueDevices:    new Set(recentTransactions.map((t) => t.deviceId)).size,
        uniqueLocations:  new Set(recentTransactions.map((t) => t.location)).size,
        daysSinceLastActivity: user.lastTransactionAt
          ? Math.floor((Date.now() - user.lastTransactionAt.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      },
    };
  }
}

export default TrustScoreService;
