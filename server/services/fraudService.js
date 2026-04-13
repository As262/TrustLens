/**
 * Fraud Detection Service
 * Implements lightweight fraud detection using:
 * - Amount anomaly detection
 * - Location anomaly detection
 * - Time-based anomaly detection
 * - Device anomaly detection
 * - Frequency-based anomaly detection
 */

export class FraudService {
  constructor(userModel, transactionModel) {
    this.User = userModel;
    this.Transaction = transactionModel;
  }

  /**
   * Calculate fraud score for a transaction (0-1 scale)
   * Uses multiple features to detect suspicious behavior
   */
  async calculateFraudScore(userId, transactionData) {
    const user = await this.User.findById(userId);
    if (!user) throw new Error('User not found');

    const recentTransactions = await this.Transaction.find({
      userId,
      timestamp: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    }).sort({ timestamp: -1 });

    // Calculate individual risk scores (0-1)
    const amountRisk = this._calcAmountAnomaly(transactionData.amount, recentTransactions);
    const locationRisk = this._calcLocationAnomaly(transactionData.location, user.locationHistory);
    const timeRisk = this._calcTimeAnomaly(transactionData.timestamp || new Date());
    const deviceRisk = this._calcDeviceAnomaly(transactionData.deviceId, user.devices);
    const frequencyRisk = this._calcFrequencyAnomaly(recentTransactions);

    // Weighted fraud score (ensemble)
    const fraudScore =
      amountRisk * 0.3 +
      locationRisk * 0.25 +
      timeRisk * 0.15 +
      deviceRisk * 0.2 +
      frequencyRisk * 0.1;

    return {
      score: Math.min(1, fraudScore),
      riskFactors: {
        amountRisk,
        locationRisk,
        timeRisk,
        deviceRisk,
        frequencyRisk,
      },
    };
  }

  /**
   * Detect unusual transaction amounts
   */
  _calcAmountAnomaly(amount, recentTransactions) {
    if (recentTransactions.length === 0) return 0.1; // Low risk if no history

    const amounts = recentTransactions.map((t) => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, val) => sum + Math.pow(val - avgAmount, 2), 0) / amounts.length
    );

    // Z-score based detection
    const zScore = stdDev > 0 ? Math.abs((amount - avgAmount) / stdDev) : 0;

    // Risk increases with z-score
    if (zScore > 3) return 0.9;
    if (zScore > 2.5) return 0.7;
    if (zScore > 2) return 0.5;
    if (zScore > 1.5) return 0.3;
    return 0.1;
  }

  /**
   * Detect unusual locations
   */
  _calcLocationAnomaly(location, locationHistory) {
    if (!locationHistory || locationHistory.length === 0) return 0.3; // Moderate risk for new location

    const knownLocation = locationHistory.find(
      (loc) => loc.location.toLowerCase() === location.toLowerCase()
    );

    if (knownLocation) {
      // Known location = low risk
      return 0.05;
    }

    // Unknown location = higher risk
    return 0.5;
  }

  /**
   * Detect unusual transaction times
   */
  _calcTimeAnomaly(timestamp) {
    const hour = new Date(timestamp).getHours();

    // Very unusual times (2 AM - 5 AM) = higher risk
    if (hour >= 2 && hour <= 5) return 0.6;

    // Late night (10 PM - 2 AM) = moderate risk
    if (hour >= 22 || hour <= 2) return 0.3;

    // Normal business hours = low risk
    return 0.1;
  }

  /**
   * Detect unusual devices
   */
  _calcDeviceAnomaly(deviceId, devices) {
    if (!devices || devices.length === 0) return 0.4; // New device

    const knownDevice = devices.find((d) => d.deviceId === deviceId);

    if (!knownDevice) {
      // New/unknown device = higher risk
      return 0.6;
    }

    // Known device = low risk
    return 0.1;
  }

  /**
   * Detect unusual transaction frequency
   */
  _calcFrequencyAnomaly(recentTransactions) {
    if (recentTransactions.length < 3) return 0.2;

    // Count transactions in last 24 hours
    const last24h = recentTransactions.filter(
      (t) => t.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    // Unusual frequency = many transactions in short time
    if (last24h.length > 10) return 0.7;
    if (last24h.length > 7) return 0.5;
    if (last24h.length > 5) return 0.3;

    return 0.1;
  }
}

export default FraudService;
