import { FraudService } from './fraudService.js';
import { LinkAnalysisService } from './linkAnalysisService.js';
import { CommunityIntelligenceService } from './communityIntelligenceService.js';
import { WebsiteReputationService } from './websiteReputationService.js';

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const WEIGHTS = {
  fraud: 0.5,
  link: 0.3,
  community: 0.2,
};

const DECISION_CONFIG = {
  APPROVED: {
    recommendation: 'Proceed with payment',
    riskLevel: 'LOW',
  },
  WARNING: {
    recommendation: 'Proceed with caution',
    riskLevel: 'MEDIUM',
  },
  BLOCKED: {
    recommendation: 'Do not proceed. Recipient appears unsafe',
    riskLevel: 'HIGH',
  },
};

export class SmartRiskEngineService {
  constructor(userModel, transactionModel) {
    this.fraudService = new FraudService(userModel, transactionModel);
    this.linkAnalysisService = new LinkAnalysisService();
    this.communityIntelligenceService = new CommunityIntelligenceService();
    this.websiteReputationService = new WebsiteReputationService();
    this.Transaction = transactionModel;
  }

  resolveDecision(finalRiskScore) {
    if (finalRiskScore < 0.4) return 'APPROVED';
    if (finalRiskScore <= 0.7) return 'WARNING';
    return 'BLOCKED';
  }

  async buildPayeeTrustProfile({ recipient, extractedUpiId, reportCount, linkRiskScore, zeroDayStatus }) {
    const normalizedRecipient = String(recipient || '').trim();
    const normalizedUpi = String(extractedUpiId || '').trim().toLowerCase();

    const recipientFilter = normalizedUpi
      ? {
          $or: [
            { recipient: normalizedRecipient },
            { recipient: normalizedUpi },
            { 'linkMeta.extractedUpiId': normalizedUpi },
          ],
        }
      : { recipient: normalizedRecipient };

    const [historicalCount, completedCount, riskyCount] = await Promise.all([
      this.Transaction.countDocuments(recipientFilter),
      this.Transaction.countDocuments({ ...recipientFilter, status: 'completed' }),
      this.Transaction.countDocuments({
        $and: [
          recipientFilter,
          {
            $or: [
              { status: 'flagged' },
              { status: 'declined' },
              { finalDecision: 'BLOCKED' },
            ],
          },
        ],
      }),
    ]);

    let score = 78;
    const reasons = [];

    if (reportCount > 0) {
      score -= Math.min(45, reportCount * 5);
      reasons.push(`Payee reported by ${reportCount} user(s)`);
    }

    score -= Math.round((Number(linkRiskScore || 0) * 22));
    if (Number(linkRiskScore || 0) > 0.55) {
      reasons.push('Payee link pattern is structurally suspicious');
    }

    if (zeroDayStatus === 'UNVERIFIED') {
      score -= 12;
      reasons.push('Payee identity is unverified for this request');
    }

    if (historicalCount === 0) {
      score -= 8;
      reasons.push('No historical interaction with this payee');
    } else {
      score += Math.min(14, completedCount * 2);
      if (completedCount > 0) {
        reasons.push(`Historical successful payments: ${completedCount}`);
      }
    }

    if (riskyCount > 0) {
      score -= Math.min(18, riskyCount * 3);
      reasons.push(`Historical risky interactions: ${riskyCount}`);
    }

    score = Math.max(1, Math.min(99, Math.round(score)));

    let trustLevel = 'HIGH_TRUST';
    let recommendation = 'Payee appears trustworthy. Continue with normal caution.';
    if (score < 50) {
      trustLevel = 'LOW_TRUST';
      recommendation = 'Do not trust this payee without independent verification.';
    } else if (score < 75) {
      trustLevel = 'CAUTION';
      recommendation = 'Payee trust is moderate. Verify recipient details before payment.';
    }

    return {
      payeeTrustScore: score,
      payeeTrustLevel: trustLevel,
      recommendation,
      reasons: reasons.slice(0, 4),
      history: {
        historicalCount,
        completedCount,
        riskyCount,
      },
    };
  }

  buildFraudReasons(fraudAnalysis) {
    const reasons = [];
    if ((fraudAnalysis?.riskFactors?.amountRisk || 0) > 0.65) {
      reasons.push('Amount higher than usual behavior');
    }
    if ((fraudAnalysis?.riskFactors?.locationRisk || 0) > 0.65) {
      reasons.push('Location differs from usual pattern');
    }
    if ((fraudAnalysis?.riskFactors?.deviceRisk || 0) > 0.65) {
      reasons.push('New or unknown device detected');
    }
    if ((fraudAnalysis?.riskFactors?.timeRisk || 0) > 0.65) {
      reasons.push('Transaction time is unusual');
    }
    if (fraudAnalysis?.ruleAnalysis?.blockedByRule) {
      reasons.push('Security rule triggered for this transaction');
    }
    return reasons;
  }

  async analyze({ userId, amount, recipient, location, deviceId, deviceName, category, time, sourceContext }) {
    const startedAt = Date.now();
    const timestamp = time ? new Date(time) : new Date();

    const normalizedRecipient = String(recipient || '').trim();
    const priorCount = await this.Transaction.countDocuments({
      userId,
      recipient: normalizedRecipient,
    });

    const contextSignals = {
      sourceType: sourceContext?.sourceType || 'unknown',
      hasPriorInteraction: priorCount > 0,
    };

    const fraudAnalysis = await this.fraudService.calculateFraudScore(userId, {
      amount,
      location,
      deviceId,
      timestamp,
      category,
    });

    const linkAnalysis = this.linkAnalysisService.analyze(recipient, contextSignals);

    const communityIntel = this.communityIntelligenceService.lookup({
      upiId: linkAnalysis.extractedUpiId || (linkAnalysis.recipientType === 'UPI' ? linkAnalysis.recipient : null),
      hostname: linkAnalysis.hostname,
    });

    const websiteProfile = linkAnalysis.hostname
      ? await this.websiteReputationService.getDomainProfile(linkAnalysis.hostname)
      : null;

    if (websiteProfile?.isLegit) {
      linkAnalysis.linkRiskScore = Math.max(0.05, linkAnalysis.linkRiskScore - 0.12);
      linkAnalysis.reasons = [...(linkAnalysis.reasons || []), `Legitimate domain recognized: ${websiteProfile.displayName}`];
    } else if (websiteProfile && !websiteProfile.isLegit) {
      linkAnalysis.linkRiskScore = Math.min(1, linkAnalysis.linkRiskScore + 0.25);
      linkAnalysis.reasons = [...(linkAnalysis.reasons || []), `Domain is marked high-risk in reputation database (${websiteProfile.displayName})`];
    } else if (linkAnalysis.recipientType === 'LINK') {
      linkAnalysis.reasons = [...(linkAnalysis.reasons || []), 'No historical domain data available'];
    }

    const payeeTrust = await this.buildPayeeTrustProfile({
      recipient: normalizedRecipient,
      extractedUpiId: linkAnalysis.extractedUpiId,
      reportCount: communityIntel.reportCount,
      linkRiskScore: linkAnalysis.linkRiskScore,
      zeroDayStatus: linkAnalysis.zeroDay?.status,
    });

    const finalRiskScore = clamp01(
      fraudAnalysis.fraudScore * WEIGHTS.fraud +
      linkAnalysis.linkRiskScore * WEIGHTS.link +
      communityIntel.communityRiskScore * WEIGHTS.community
    );

    let finalDecision = this.resolveDecision(finalRiskScore);
    const reasons = [
      ...this.buildFraudReasons(fraudAnalysis),
      ...(linkAnalysis.reasons || []),
      ...(linkAnalysis.zeroDay?.reasons || []),
      ...(communityIntel.reasons || []),
    ];

    if (linkAnalysis.zeroDay?.status === 'UNVERIFIED' && finalDecision === 'APPROVED') {
      finalDecision = 'WARNING';
    }
    if (payeeTrust.payeeTrustScore < 45 && finalDecision === 'APPROVED') {
      finalDecision = 'WARNING';
    }

    const uniqueReasons = [...new Set(reasons)].slice(0, 6);
    const confidenceLevel = linkAnalysis.zeroDay?.confidenceLevel || 'MEDIUM';
    const overallStatus = linkAnalysis.zeroDay?.status === 'UNVERIFIED' ? 'UNVERIFIED' : finalDecision;

    let recommendation = DECISION_CONFIG[finalDecision].recommendation;
    if (overallStatus === 'UNVERIFIED') {
      recommendation = 'Verify before proceeding';
    }

    return {
      status: finalDecision,
      overallStatus,
      finalRiskScore: Number(finalRiskScore.toFixed(3)),
      recommendation,
      riskLevel: DECISION_CONFIG[finalDecision].riskLevel,
      confidenceLevel,
      reasons: uniqueReasons.length ? uniqueReasons : ['No major risk signals detected'],
      fraud: {
        fraudScore: Number(fraudAnalysis.fraudScore.toFixed(3)),
        riskFactors: fraudAnalysis.riskFactors,
      },
      link: {
        recipientType: linkAnalysis.recipientType,
        sanitizedRecipient: linkAnalysis.sanitizedRecipient,
        extractedUpiId: linkAnalysis.extractedUpiId,
        isHttps: linkAnalysis.isHttps,
        linkRiskScore: linkAnalysis.linkRiskScore,
        zeroDay: linkAnalysis.zeroDay,
      },
      community: {
        reportCount: communityIntel.reportCount,
        riskLevel: communityIntel.riskLevel,
        communityRiskScore: Number(communityIntel.communityRiskScore.toFixed(3)),
      },
      context: contextSignals,
      payeeTrust,
      website: websiteProfile
        ? {
            domain: websiteProfile.domain,
            displayName: websiteProfile.displayName,
            category: websiteProfile.category,
            isLegit: websiteProfile.isLegit,
            trustScore: websiteProfile.trustScore,
            riskLevel: websiteProfile.riskLevel,
            matchedBy: websiteProfile.matchedBy,
          }
        : null,
      latencyMs: Date.now() - startedAt,
    };
  }
}

export default SmartRiskEngineService;
