/**
 * Explainability Service
 * Provides human-readable explanations for fraud detection decisions
 * This is the "Why?" layer of the AI
 */

export class ExplainabilityService {
  /**
   * Generate explanations based on fraud detection results
   */
  generateExplanations(transactionData, fraudAnalysis, userContext) {
    const reasons = [];

    // Check amount anomaly
    if (fraudAnalysis.riskFactors.amountRisk > 0.5) {
      const avgAmount = userContext.averageAmount || 0;
      const multiplier = (transactionData.amount / avgAmount).toFixed(1);
      reasons.push(
        `🔴 High Transaction Amount: ${multiplier}x your typical transaction (${transactionData.amount.toFixed(2)} vs avg ${avgAmount.toFixed(2)})`
      );
    }

    // Check location anomaly
    if (fraudAnalysis.riskFactors.locationRisk > 0.4) {
      reasons.push(`📍 Unusual Location: Transaction from "${transactionData.location}" - not in your typical locations`);
    }

    // Check time anomaly
    if (fraudAnalysis.riskFactors.timeRisk > 0.5) {
      const hour = new Date(transactionData.timestamp).getHours();
      reasons.push(`⏰ Unusual Time: Transaction at ${hour}:00 - outside typical activity hours`);
    }

    // Check device anomaly
    if (fraudAnalysis.riskFactors.deviceRisk > 0.5) {
      reasons.push(`📱 New Device: Device "${transactionData.deviceName}" not previously associated with your account`);
    }

    // Check frequency anomaly
    if (fraudAnalysis.riskFactors.frequencyRisk > 0.4) {
      reasons.push(`⚡ High Frequency: Multiple transactions detected in a short time span`);
    }

    return reasons.length > 0 ? reasons : ['✅ No suspicious patterns detected - transaction appears normal'];
  }

  /**
   * Generate summary explanation
   */
  generateSummary(fraudScore, reasons) {
    let summary = '';
    let riskLevel = 'Low Risk';

    if (fraudScore > 0.7) {
      riskLevel = '🔴 High Risk - Transaction Flagged';
      summary = 'Multiple suspicious patterns detected. Manual review recommended.';
    } else if (fraudScore > 0.4) {
      riskLevel = '🟡 Medium Risk - Under Review';
      summary = 'Some anomalies detected. Additional verification may be required.';
    } else {
      riskLevel = '🟢 Low Risk - Approved';
      summary = 'Transaction appears normal and safe to proceed.';
    }

    return {
      riskLevel,
      summary,
      reasonCount: reasons.length,
    };
  }

  /**
   * Generate detailed confidence metrics
   */
  generateConfidenceMetrics(fraudAnalysis) {
    return {
      amountConfidence: `${(fraudAnalysis.riskFactors.amountRisk * 100).toFixed(1)}%`,
      locationConfidence: `${(fraudAnalysis.riskFactors.locationRisk * 100).toFixed(1)}%`,
      timeConfidence: `${(fraudAnalysis.riskFactors.timeRisk * 100).toFixed(1)}%`,
      deviceConfidence: `${(fraudAnalysis.riskFactors.deviceRisk * 100).toFixed(1)}%`,
      frequencyConfidence: `${(fraudAnalysis.riskFactors.frequencyRisk * 100).toFixed(1)}%`,
    };
  }
}

export default ExplainabilityService;
