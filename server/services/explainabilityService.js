/**
 * Explainability Service
 * Provides detailed, context-aware explanations for fraud detection decisions
 * Uses advanced anomaly detection details to generate human-readable insights
 * This is the "Why?" layer of the AI fraud detection system
 */

export class ExplainabilityService {
  /**
   * Generate contextual explanations based on advanced fraud detection results
   * Uses the detailed anomaly analysis for specific, actionable reasons
   */
  generateExplanations(transactionData, fraudAnalysis, userContext) {
    const reasons = [];

    // Use detailed anomaly information from advanced detection
    const anomalyDetails = fraudAnalysis.anomalyDetails || {};

    // Amount anomaly explanations
    if (anomalyDetails.amount && anomalyDetails.amount.anomalyScore > 0.4) {
      reasons.push(
        `💰 ${anomalyDetails.amount.explanation || `Amount anomaly detected: $${transactionData.amount}`}`
      );

      // Add percentile information if available
      if (anomalyDetails.amount.percentile) {
        reasons.push(`   └─ This is higher than ${anomalyDetails.amount.percentile}% of your transactions`);
      }

      // Add Z-score detail if very high
      if (anomalyDetails.amount.zScore > 3) {
        reasons.push(`   └─ Statistical deviation: ${anomalyDetails.amount.zScore.toFixed(2)}σ`);
      }
    }

    // Location anomaly explanations
    if (anomalyDetails.location && anomalyDetails.location.anomalyScore > 0.4) {
      reasons.push(`📍 ${anomalyDetails.location.explanation || `Location anomaly: ${transactionData.location}`}`);

      if (anomalyDetails.location.isNewLocation) {
        reasons.push(`   └─ First time transaction from this location`);
      }
    }

    // Time anomaly explanations
    if (anomalyDetails.time && anomalyDetails.time.anomalyScore > 0.4) {
      reasons.push(`⏰ ${anomalyDetails.time.explanation || `Time anomaly detected`}`);

      const riskFactors = anomalyDetails.time.riskFactors || {};
      if (riskFactors.burstRisk > 0.5) {
        reasons.push(`   └─ Multiple rapid transactions detected`);
      }
    }

    // Device anomaly explanations
    if (anomalyDetails.device && anomalyDetails.device.anomalyScore > 0.4) {
      reasons.push(`📱 ${anomalyDetails.device.explanation || `Device anomaly: ${transactionData.deviceName}`}`);

      if (anomalyDetails.device.isNewDevice) {
        reasons.push(`   └─ First time using this device`);
      }
    }

    // Frequency anomaly explanations
    if (anomalyDetails.frequency && anomalyDetails.frequency.anomalyScore > 0.4) {
      reasons.push(`⚡ ${anomalyDetails.frequency.explanation || `Transaction frequency anomaly`}`);

      if (anomalyDetails.frequency.burstDetected) {
        reasons.push(`   └─ Burst pattern detected: unusually rapid succession`);
      }
    }

    // If no significant anomalies, provide positive confirmation
    if (reasons.length === 0) {
      reasons.push('✅ Transaction appears normal - no suspicious patterns detected');
    }

    return reasons;
  }

  /**
   * Generate detailed summary with risk assessment and confidence metrics
   */
  generateSummary(fraudScore, reasons) {
    let summary = '';
    let riskLevel = 'Low Risk';

    if (fraudScore > 0.75) {
      riskLevel = '🔴 Critical Risk - Transaction Blocked';
      summary =
        'Multiple severe anomalies detected. Transaction requires immediate manual review and likely rejection.';
    } else if (fraudScore > 0.6) {
      riskLevel = '🔴 High Risk - Transaction Flagged';
      summary = 'Multiple suspicious patterns detected. Manual review recommended before processing.';
    } else if (fraudScore > 0.4) {
      riskLevel = '🟡 Medium Risk - Under Review';
      summary = 'Some anomalies detected. Additional verification may be required.';
    } else if (fraudScore > 0.2) {
      riskLevel = '🟢 Low Risk - Approved';
      summary = 'Minor anomalies detected, but transaction appears generally safe to proceed.';
    } else {
      riskLevel = '🟢 Very Low Risk - Approved';
      summary = 'Transaction appears normal with no suspicious indicators.';
    }

    return {
      riskLevel,
      summary,
      reasonCount: reasons.length,
      confidenceScore: (Math.round(fraudScore * 1000) / 10).toFixed(1) + '%',
    };
  }

  /**
   * Generate detailed confidence metrics with anomaly scores
   */
  generateConfidenceMetrics(fraudAnalysis) {
    const riskFactors = fraudAnalysis.riskFactors || {};
    const anomalyDetails = fraudAnalysis.anomalyDetails || {};

    // Calculate feature importance based on risk contributions
    const total = Object.values(riskFactors).reduce((a, b) => a + b, 0) || 1;
    const amountImportance = ((riskFactors.amountRisk || 0) / total * 100).toFixed(1);
    const locationImportance = ((riskFactors.locationRisk || 0) / total * 100).toFixed(1);
    const timeImportance = ((riskFactors.timeRisk || 0) / total * 100).toFixed(1);
    const deviceImportance = ((riskFactors.deviceRisk || 0) / total * 100).toFixed(1);
    const frequencyImportance = ((riskFactors.frequencyRisk || 0) / total * 100).toFixed(1);

    return {
      // Individual risk scores as percentages
      amountConfidence: `${(riskFactors.amountRisk * 100).toFixed(1)}%`,
      locationConfidence: `${(riskFactors.locationRisk * 100).toFixed(1)}%`,
      timeConfidence: `${(riskFactors.timeRisk * 100).toFixed(1)}%`,
      deviceConfidence: `${(riskFactors.deviceRisk * 100).toFixed(1)}%`,
      frequencyConfidence: `${(riskFactors.frequencyRisk * 100).toFixed(1)}%`,

      // Feature importance in the decision
      featureImportance: {
        amount: `${amountImportance}%`,
        location: `${locationImportance}%`,
        time: `${timeImportance}%`,
        device: `${deviceImportance}%`,
        frequency: `${frequencyImportance}%`,
      },

      // Top contributing factors
      topRiskFactors: this._getTopRiskFactors(riskFactors),

      // Anomaly detection method tags
      detectionMethods: this._getDetectionMethods(anomalyDetails),
    };
  }

  /**
   * Helper: Get top risk contributing factors
   */
  _getTopRiskFactors(riskFactors) {
    const factors = [
      { name: 'Amount', score: riskFactors.amountRisk, weight: 0.3 },
      { name: 'Location', score: riskFactors.locationRisk, weight: 0.25 },
      { name: 'Time', score: riskFactors.timeRisk, weight: 0.15 },
      { name: 'Device', score: riskFactors.deviceRisk, weight: 0.2 },
      { name: 'Frequency', score: riskFactors.frequencyRisk, weight: 0.1 },
    ];

    return factors
      .sort((a, b) => b.score * b.weight - a.score * a.weight)
      .slice(0, 3)
      .map((f) => ({
        factor: f.name,
        contribution: `${(f.score * f.weight * 100).toFixed(1)}%`,
      }));
  }

  /**
   * Helper: Get detection methods used
   */
  _getDetectionMethods(anomalyDetails) {
    const methods = [];

    if (anomalyDetails.amount) {
      methods.push('Isolation Forest + Adaptive Z-Score');
    }

    if (anomalyDetails.location) {
      methods.push('Geographic Velocity Analysis');
    }

    if (anomalyDetails.time) {
      methods.push('Temporal Pattern Detection');
    }

    if (anomalyDetails.device) {
      methods.push('Device Fingerprinting');
    }

    if (anomalyDetails.frequency) {
      methods.push('Local Outlier Factor (LOF)');
    }

    return methods;
  }
}

export default ExplainabilityService;
