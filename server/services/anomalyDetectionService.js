/**
 * Advanced Anomaly Detection Service
 * Implements multiple ML-like algorithms for fraud detection:
 * - Isolation Forest (simulated)
 * - Local Outlier Factor (LOF) with k-NN
 * - Adaptive Z-Score with Median Absolute Deviation
 * - Frequency Distribution Analysis
 * - Temporal Pattern Detection
 *
 * All algorithms are lightweight, local, and require no external ML libraries.
 */

export class AnomalyDetectionService {
  /**
   * Detect anomalies in transaction amounts using simulated Isolation Forest
   * Returns: { anomalyScore: 0-1, explanation: string, zScore: number }
   */
  static detectAmountAnomaly(currentAmount, transactionAmounts) {
    if (transactionAmounts.length === 0) {
      return { anomalyScore: 0.1, explanation: 'No history available', zScore: 0 };
    }

    // Use both Z-score and Isolation Forest approaches
    const zScoreResult = this._adaptiveZScore(currentAmount, transactionAmounts);
    const isolationScore = this._isolationForestAmount(currentAmount, transactionAmounts);

    // Ensure both scores are valid numbers
    const validZScore = isNaN(zScoreResult.anomalyScore) ? 0.1 : zScoreResult.anomalyScore;
    const validIsolationScore = isNaN(isolationScore) ? 0.1 : isolationScore;

    // Ensemble: combine both methods
    let anomalyScore = validZScore * 0.6 + validIsolationScore * 0.4;
    anomalyScore = isNaN(anomalyScore) ? 0.1 : anomalyScore;

    // Determine explanation with detailed metrics
    const stats = this._calculateStats(transactionAmounts);
    const safeMean = stats.mean > 0 ? stats.mean : currentAmount;
    const multiplier = (currentAmount / safeMean).toFixed(1);
    const percentile = this._percentile(currentAmount, transactionAmounts);

    let explanation = '';
    if (anomalyScore > 0.7) {
      explanation = `Exceptional amount: $${currentAmount} (${multiplier}x average, ${percentile}th percentile)`;
    } else if (anomalyScore > 0.4) {
      explanation = `High amount: $${currentAmount} (${multiplier}x average)`;
    } else {
      explanation = `Normal amount: $${currentAmount}`;
    }

    return {
      anomalyScore: Math.min(1, Math.max(0, anomalyScore)),
      explanation,
      zScore: zScoreResult.zScore,
      percentile,
    };
  }

  /**
   * Detect anomalies in transaction timing using temporal patterns
   * Returns: { anomalyScore: 0-1, explanation: string, riskFactors: object }
   */
  static detectTimingAnomaly(currentTimestamp, recentTransactions) {
    if (recentTransactions.length === 0) {
      return {
        anomalyScore: 0.1,
        explanation: 'No transaction history',
        riskFactors: {},
      };
    }

    const current = new Date(currentTimestamp);
    const currentHour = current.getHours();
    const currentDay = current.getDay();

    // Extract timing patterns from history
    const timingPatterns = recentTransactions.map((t) => ({
      hour: new Date(t.timestamp).getHours(),
      day: new Date(t.timestamp).getDay(),
      timestamp: new Date(t.timestamp).getTime(),
    }));

    // Risk factors
    let hourRisk = this._hourAnomalyRisk(currentHour, timingPatterns);
    let dayRisk = this._dayAnomalyRisk(currentDay, timingPatterns);
    let burstRisk = this._burstDetectionRisk(current.getTime(), recentTransactions);

    // Ensure all are valid numbers
    hourRisk = isNaN(hourRisk) ? 0.1 : hourRisk;
    dayRisk = isNaN(dayRisk) ? 0.1 : dayRisk;
    burstRisk = isNaN(burstRisk) ? 0.1 : burstRisk;

    // Weighted ensemble
    let anomalyScore = hourRisk * 0.4 + dayRisk * 0.3 + burstRisk * 0.3;
    anomalyScore = isNaN(anomalyScore) ? 0.1 : anomalyScore;

    const riskFactors = { hourRisk, dayRisk, burstRisk };

    let explanation = 'Transaction timing appears normal';
    if (anomalyScore > 0.6) {
      explanation = `Unusual timing: ${currentHour}:00 on ${this._dayName(currentDay)}`;
      if (burstRisk > 0.5) {
        explanation += ' (Multiple rapid transactions detected)';
      }
    } else if (anomalyScore > 0.4) {
      explanation = `Moderately unusual time: ${currentHour}:00`;
    }

    return {
      anomalyScore: Math.min(1, Math.max(0, anomalyScore)),
      explanation,
      riskFactors,
    };
  }

  /**
   * Detect location anomalies using geographic patterns
   * Returns: { anomalyScore: 0-1, explanation: string, isNewLocation: boolean }
   */
  static detectLocationAnomaly(currentLocation, locationHistory, recentTransactions) {
    if (!locationHistory || locationHistory.length === 0) {
      return {
        anomalyScore: 0.4,
        explanation: 'New location - no location history available',
        isNewLocation: true,
      };
    }

    // Check if location is known
    const knownLocation = locationHistory.find(
      (loc) => loc.location.toLowerCase() === currentLocation.toLowerCase()
    );

    if (knownLocation) {
      return {
        anomalyScore: 0.05,
        explanation: `Known location: ${currentLocation}`,
        isNewLocation: false,
      };
    }

    // Location is unknown - calculate risk
    let frequencyRisk = this._locationFrequencyRisk(locationHistory);
    let velocityRisk = this._locationVelocityRisk(
      currentLocation,
      recentTransactions,
      locationHistory
    );

    frequencyRisk = isNaN(frequencyRisk) ? 0.3 : frequencyRisk;
    velocityRisk = isNaN(velocityRisk) ? 0.2 : velocityRisk;

    let anomalyScore = frequencyRisk * 0.5 + velocityRisk * 0.5;
    anomalyScore = isNaN(anomalyScore) ? 0.3 : anomalyScore;

    let explanation = `New location detected: ${currentLocation}`;
    if (velocityRisk > 0.6) {
      explanation += ' (Impossible travel speed detected)';
    }

    return {
      anomalyScore: Math.min(1, Math.max(0, anomalyScore)),
      explanation,
      isNewLocation: true,
    };
  }

  /**
   * Detect device anomalies using device fingerprinting and behavior
   * Returns: { anomalyScore: 0-1, explanation: string, isNewDevice: boolean }
   */
  static detectDeviceAnomaly(currentDeviceId, deviceHistory, recentTransactions, currentLocation) {
    if (!deviceHistory || deviceHistory.length === 0) {
      return {
        anomalyScore: 0.5,
        explanation: 'New device - no device history available',
        isNewDevice: true,
      };
    }

    // Check if device is known
    const knownDevice = deviceHistory.find((d) => d.deviceId === currentDeviceId);

    if (knownDevice) {
      // Device is known - check for behavioral anomalies
      let usageAnomalyScore = this._deviceUsageAnomaly(
        knownDevice,
        recentTransactions,
        currentLocation
      );
      usageAnomalyScore = isNaN(usageAnomalyScore) ? 0.1 : usageAnomalyScore;

      if (usageAnomalyScore > 0.5) {
        return {
          anomalyScore: usageAnomalyScore,
          explanation: `Unusual behavior on known device: ${knownDevice.name}`,
          isNewDevice: false,
        };
      }

      return {
        anomalyScore: 0.1,
        explanation: `Known device: ${knownDevice.name}`,
        isNewDevice: false,
      };
    }

    // Device is new - high risk but not impossible
    let riskScore = this._newDeviceRisk(recentTransactions, currentLocation);
    riskScore = isNaN(riskScore) ? 0.4 : riskScore;

    return {
      anomalyScore: Math.min(1, Math.max(0, riskScore)),
      explanation: `New device detected - first time using this device`,
      isNewDevice: true,
    };
  }

  /**
   * Detect frequency anomalies using Local Outlier Factor (LOF)
   * Returns: { anomalyScore: 0-1, explanation: string, burstDetected: boolean }
   */
  static detectFrequencyAnomaly(recentTransactions) {
    if (recentTransactions.length < 3) {
      return {
        anomalyScore: 0.2,
        explanation: 'Limited transaction history',
        burstDetected: false,
      };
    }

    // Calculate inter-transaction times
    const sortedTxns = recentTransactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 30); // Last 30 transactions

    const timeDifferences = [];
    for (let i = 0; i < sortedTxns.length - 1; i++) {
      const diff = new Date(sortedTxns[i].timestamp) - new Date(sortedTxns[i + 1].timestamp);
      timeDifferences.push(diff);
    }

    // Use LOF-like approach for frequency
    let result = this._localOutlierFactorFrequency(
      timeDifferences,
      recentTransactions
    );

    // Ensure anomaly score is valid
    result.anomalyScore = isNaN(result.anomalyScore) ? 0.2 : result.anomalyScore;
    result.anomalyScore = Math.min(1, Math.max(0, result.anomalyScore));

    let explanation = 'Normal transaction frequency';
    if (result.anomalyScore > 0.7) {
      explanation = 'Burst of transactions detected - unusual activity';
    } else if (result.anomalyScore > 0.4) {
      explanation = 'Elevated transaction frequency';
    }

    return {
      anomalyScore: result.anomalyScore,
      explanation,
      burstDetected: result.burstDetected,
    };
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Adaptive Z-Score using Median Absolute Deviation (MAD)
   * More robust than standard Z-score for real distributions
   */
  static _adaptiveZScore(value, values) {
    if (values.length === 0) return { anomalyScore: 0.1, zScore: 0 };

    const median = this._median(values);
    const deviations = values.map((v) => Math.abs(v - median));
    const mad = this._median(deviations);

    let zScore = 0;
    if (mad > 0) {
      zScore = Math.abs(value - median) / (1.4826 * mad); // 1.4826 is normalizing constant
    }

    // Convert Z-score to anomaly score (0-1)
    let anomalyScore = 0.1;
    if (zScore > 4) anomalyScore = 0.95;
    else if (zScore > 3) anomalyScore = 0.8;
    else if (zScore > 2.5) anomalyScore = 0.65;
    else if (zScore > 2) anomalyScore = 0.5;
    else if (zScore > 1.5) anomalyScore = 0.3;
    else if (zScore > 1) anomalyScore = 0.15;

    return { anomalyScore, zScore };
  }

  /**
   * Simulated Isolation Forest for amount detection
   * Fast anomaly detection based on isolation principle
   */
  static _isolationForestAmount(currentAmount, amounts, numTrees = 50) {
    if (amounts.length < 5) return 0.1; // Not enough data

    let totalPathLength = 0;

    for (let t = 0; t < numTrees; t++) {
      // Bootstrap sample
      const sampleSize = Math.ceil(Math.sqrt(amounts.length));
      const sample = this._randomSample(amounts, sampleSize);

      // Build isolation tree (simplified)
      const pathLength = this._buildIsolationTree(
        currentAmount,
        sample,
        0,
        Math.ceil(Math.log2(sample.length))
      );

      totalPathLength += pathLength;
    }

    // Normalize path length to anomaly score
    const avgPathLength = Math.log2(amounts.length);
    const normalizedPathLength = totalPathLength / numTrees;

    // Isolation score: shorter paths = more anomalous
    const isolationScore = Math.pow(2, -(normalizedPathLength / avgPathLength));

    return Math.min(1, isolationScore * 1.2); // Scale up for sensitivity
  }

  /**
   * Simplified isolation tree: recursively partition and find isolation depth
   */
  static _buildIsolationTree(value, values, depth, maxDepth) {
    if (depth >= maxDepth || values.length <= 1) {
      return depth;
    }

    // Random split
    const min = Math.min(...values);
    const max = Math.max(...values);
    const splitValue = min + Math.random() * (max - min);

    // Partition
    const left = values.filter((v) => v < splitValue);
    const right = values.filter((v) => v >= splitValue);

    if (left.length === 0 || right.length === 0) {
      return depth + 1; // Isolated quickly
    }

    // Recursively search the partition containing value
    const partition = value < splitValue ? left : right;
    return this._buildIsolationTree(value, partition, depth + 1, maxDepth);
  }

  /**
   * Local Outlier Factor for frequency detection
   * K-NN density-based anomaly detection
   */
  static _localOutlierFactorFrequency(timeDifferences, transactions) {
    if (timeDifferences.length < 3) {
      return { anomalyScore: 0.2, burstDetected: false };
    }

    // Look for burst patterns (very short time differences)
    const k = Math.min(5, timeDifferences.length);
    const sortedDiffs = timeDifferences.slice().sort((a, b) => a - b);

    // K-NN average distance
    const kNearestDists = sortedDiffs.slice(0, k);
    const meanKDistance = kNearestDists.reduce((a, b) => a + b, 0) / k;
    const medianKDistance = this._median(kNearestDists);

    // Current burst: check if latest transaction is in burst
    const recentIntervals = timeDifferences.slice(0, 3);
    const recentAvg = recentIntervals.reduce((a, b) => a + b, 0) / recentIntervals.length;

    // Burst detected if recent avg is significantly lower than median
    const burstDetected = recentAvg < medianKDistance * 0.3;

    // LOF: ratio of average distance to recent distance
    const lof = meanKDistance > 0 ? recentAvg / meanKDistance : 0;

    let anomalyScore = 0.1;
    if (burstDetected) {
      anomalyScore = 0.7; // Strong burst signal
    } else if (lof < 0.5) {
      anomalyScore = 0.5; // Local outlier
    } else if (lof < 0.8) {
      anomalyScore = 0.3;
    }

    return { anomalyScore: Math.min(1, anomalyScore), burstDetected };
  }

  /**
   * Hour-based timing anomaly risk
   */
  static _hourAnomalyRisk(currentHour, timingPatterns) {
    const hourCounts = Array(24).fill(0);
    timingPatterns.forEach(({ hour }) => hourCounts[hour]++);

    const totalCount = timingPatterns.length;
    const currentHourFreq = hourCounts[currentHour] / totalCount;
    const avgFreq = 1 / 24; // Expected uniform distribution

    // Unusual hours (2 AM - 5 AM)
    if (currentHour >= 2 && currentHour <= 5) {
      return 0.7;
    }

    // Late night
    if (currentHour >= 22 || currentHour <= 2) {
      return 0.4;
    }

    // If current hour is rare in user's history
    if (currentHourFreq < avgFreq * 0.5) {
      return 0.3;
    }

    return 0.1;
  }

  /**
   * Day-based timing anomaly risk
   */
  static _dayAnomalyRisk(currentDay, timingPatterns) {
    const dayCounts = Array(7).fill(0);
    timingPatterns.forEach(({ day }) => dayCounts[day]++);

    const totalCount = timingPatterns.length;
    const currentDayFreq = dayCounts[currentDay] / totalCount;
    const avgFreq = 1 / 7;

    // If current day is very rare
    if (currentDayFreq < avgFreq * 0.2) {
      return 0.4;
    }

    if (currentDayFreq < avgFreq * 0.5) {
      return 0.2;
    }

    return 0.05;
  }

  /**
   * Detect transaction bursts (multiple transactions in very short time)
   */
  static _burstDetectionRisk(currentTime, recentTransactions) {
    if (recentTransactions.length === 0) return 0.1;

    // Count transactions in last 30 minutes
    const window = 30 * 60 * 1000; // 30 minutes
    const recentBurst = recentTransactions.filter(
      (t) => currentTime - new Date(t.timestamp).getTime() < window
    );

    if (recentBurst.length > 5) return 0.8;
    if (recentBurst.length > 3) return 0.6;
    if (recentBurst.length > 1) return 0.3;

    return 0.05;
  }

  /**
   * Location frequency-based risk
   */
  static _locationFrequencyRisk(locationHistory) {
    if (locationHistory.length === 0) return 0.5;

    // If user has very few known locations, new locations are less risky
    if (locationHistory.length <= 2) return 0.3;
    if (locationHistory.length <= 5) return 0.45;

    // User has many known locations, new location is more suspicious
    return 0.55;
  }

  /**
   * Location velocity-based risk (impossible travel)
   */
  static _locationVelocityRisk(currentLocation, recentTransactions, locationHistory) {
    if (recentTransactions.length === 0) return 0.2;

    const lastTransaction = recentTransactions[0];
    const lastLocation = recentTransactions[0].location;

    if (lastLocation === currentLocation) return 0.05;

    // Simplified velocity check: if different location and very recent, it's suspicious
    const timeDiff = (new Date() - new Date(lastTransaction.timestamp)) / (1000 * 60); // minutes

    // Assume max reasonable travel speed: 500 miles/hour
    // If transaction is < 5 minutes ago and location changed, it's suspicious
    if (timeDiff < 5) {
      return 0.6; // Impossible velocity
    }

    if (timeDiff < 30) {
      return 0.3; // Possible but rare
    }

    return 0.15;
  }

  /**
   * Device usage anomaly on known device
   */
  static _deviceUsageAnomaly(knownDevice, recentTransactions, currentLocation) {
    if (!knownDevice.lastUsed) return 0.1;

    // Check time since last use
    const timeSinceLastUse = (new Date() - new Date(knownDevice.lastUsed)) / (1000 * 60 * 60); // hours

    // Device inactive for > 30 days, now active = suspicious
    if (timeSinceLastUse > 30 * 24) {
      return 0.5;
    }

    // Device was always used from known locations
    if (knownDevice.locations && !knownDevice.locations.includes(currentLocation)) {
      return 0.4;
    }

    return 0.1;
  }

  /**
   * New device risk assessment
   */
  static _newDeviceRisk(recentTransactions, currentLocation) {
    if (recentTransactions.length === 0) return 0.4;

    // Check if new location was just accessed by known device
    const lastTxn = recentTransactions[0];
    const locationChanged = lastTxn.location !== currentLocation;

    if (locationChanged) {
      return 0.6; // New device + new location = higher risk
    }

    return 0.4; // New device at known location
  }

  // ============ UTILITY METHODS ============

  static _calculateStats(values) {
    if (values.length === 0) return { mean: 0, median: 0, stdDev: 0 };

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const median = this._median(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, median, stdDev };
  }

  static _median(values) {
    if (values.length === 0) return 0;
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const result = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    return isNaN(result) ? 0 : result;
  }

  static _percentile(value, values) {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = sorted.findIndex((v) => v >= value);
    if (index === -1) return 95; // Value is higher than all
    return Math.round((index / sorted.length) * 100);
  }

  static _randomSample(array, size) {
    const sample = [];
    const indices = new Set();

    while (indices.size < size && indices.size < array.length) {
      indices.add(Math.floor(Math.random() * array.length));
    }

    indices.forEach((i) => sample.push(array[i]));
    return sample;
  }

  static _dayName(dayNum) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  }
}

export default AnomalyDetectionService;
