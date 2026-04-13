/**
 * Fraud Detection Service
 * Implements advanced ML-like fraud detection using:
 * - Isolation Forest-based amount anomaly detection
 * - Geographic velocity and pattern-based location anomaly detection
 * - Temporal pattern and burst detection
 * - Device fingerprinting and behavior analysis
 * - Frequency anomaly using Local Outlier Factor (LOF)
 *
 * All algorithms are implemented in pure JavaScript with no external ML dependencies.
 */

import AnomalyDetectionService from './anomalyDetectionService.js';

export class FraudService {
  constructor(userModel, transactionModel) {
    this.User = userModel;
    this.Transaction = transactionModel;
  }

  /**
   * Calculate fraud score for a transaction (0-1 scale)
   * Uses multiple advanced anomaly detection algorithms to detect suspicious behavior
   */
  async calculateFraudScore(userId, transactionData) {
    try {
      const user = await this.User.findById(userId);
      if (!user) throw new Error('User not found');

      const recentTransactions = await this.Transaction.find({
        userId,
        timestamp: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      }).sort({ timestamp: -1 });

      // Calculate individual risk scores using advanced anomaly detection
      const amountResult = this._calcAmountAnomaly(transactionData.amount, recentTransactions);
      const locationResult = this._calcLocationAnomaly(
        transactionData.location,
        user.locationHistory,
        recentTransactions
      );
      const timeResult = this._calcTimeAnomaly(
        transactionData.timestamp || new Date(),
        recentTransactions
      );
      const deviceResult = this._calcDeviceAnomaly(
        transactionData.deviceId,
        user.devices,
        recentTransactions,
        transactionData.location
      );
      const frequencyResult = this._calcFrequencyAnomaly(recentTransactions);

      // Extract risk scores with safety defaults
      let amountRisk = isNaN(amountResult) ? 0.1 : amountResult;
      let locationRisk = isNaN(locationResult) ? 0.1 : locationResult;
      let timeRisk = isNaN(timeResult) ? 0.1 : timeResult;
      let deviceRisk = isNaN(deviceResult) ? 0.1 : deviceResult;
      let frequencyRisk = isNaN(frequencyResult) ? 0.1 : frequencyResult;

      // Ensure all are in [0, 1] range
      amountRisk = Math.min(1, Math.max(0, amountRisk));
      locationRisk = Math.min(1, Math.max(0, locationRisk));
      timeRisk = Math.min(1, Math.max(0, timeRisk));
      deviceRisk = Math.min(1, Math.max(0, deviceRisk));
      frequencyRisk = Math.min(1, Math.max(0, frequencyRisk));

      // Weighted fraud score (ensemble)
      let fraudScore =
        amountRisk * 0.3 +
        locationRisk * 0.25 +
        timeRisk * 0.15 +
        deviceRisk * 0.2 +
        frequencyRisk * 0.1;

      // Final safety check
      fraudScore = isNaN(fraudScore) ? 0.1 : fraudScore;
      fraudScore = Math.min(1, Math.max(0, fraudScore));

      return {
        score: fraudScore,
        riskFactors: {
          amountRisk,
          locationRisk,
          timeRisk,
          deviceRisk,
          frequencyRisk,
        },
        // Store detailed analysis for explainability
        anomalyDetails: {
          amountScore: amountResult,
          locationScore: locationResult,
          timeScore: timeResult,
          deviceScore: deviceResult,
          frequencyScore: frequencyResult,
        },
      };
    } catch (error) {
      console.error('Error calculating fraud score:', error);
      // Return safe default on error
      return {
        score: 0.1,
        riskFactors: {
          amountRisk: 0.1,
          locationRisk: 0.1,
          timeRisk: 0.1,
          deviceRisk: 0.1,
          frequencyRisk: 0.1,
        },
        anomalyDetails: {},
      };
    }
  }

  /**
   * Detect unusual transaction amounts using Isolation Forest + Adaptive Z-Score
   * Advanced anomaly detection that identifies statistical outliers
   */
  _calcAmountAnomaly(amount, recentTransactions) {
    try {
      const amounts = recentTransactions.map((t) => t.amount);
      const result = AnomalyDetectionService.detectAmountAnomaly(amount, amounts);
      return result.anomalyScore || 0.1;
    } catch (error) {
      console.error('Amount anomaly error:', error);
      return 0.1;
    }
  }

  /**
   * Detect unusual locations using geographic patterns and velocity analysis
   * Identifies impossible travel speeds and new location patterns
   */
  _calcLocationAnomaly(location, locationHistory, recentTransactions) {
    try {
      const result = AnomalyDetectionService.detectLocationAnomaly(
        location,
        locationHistory,
        recentTransactions
      );
      return result.anomalyScore || 0.1;
    } catch (error) {
      console.error('Location anomaly error:', error);
      return 0.1;
    }
  }

  /**
   * Detect unusual transaction times using temporal patterns and burst detection
   * Identifies unusual hours, days, and clustering patterns
   */
  _calcTimeAnomaly(timestamp, recentTransactions) {
    try {
      const result = AnomalyDetectionService.detectTimingAnomaly(timestamp, recentTransactions);
      return result.anomalyScore || 0.1;
    } catch (error) {
      console.error('Time anomaly error:', error);
      return 0.1;
    }
  }

  /**
   * Detect unusual device patterns using device fingerprinting and behavior analysis
   * Identifies new devices and unusual device usage patterns
   */
  _calcDeviceAnomaly(deviceId, devices, recentTransactions, currentLocation) {
    try {
      const result = AnomalyDetectionService.detectDeviceAnomaly(
        deviceId,
        devices,
        recentTransactions,
        currentLocation
      );
      return result.anomalyScore || 0.1;
    } catch (error) {
      console.error('Device anomaly error:', error);
      return 0.1;
    }
  }

  /**
   * Detect unusual transaction frequency using Local Outlier Factor (LOF)
   * Identifies burst patterns and abnormal transaction clustering
   */
  _calcFrequencyAnomaly(recentTransactions) {
    try {
      const result = AnomalyDetectionService.detectFrequencyAnomaly(recentTransactions);
      return result.anomalyScore || 0.1;
    } catch (error) {
      console.error('Frequency anomaly error:', error);
      return 0.1;
    }
  }
}

export default FraudService;
