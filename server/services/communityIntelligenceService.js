const COMMUNITY_REPORTS = {
  upi: {
    'safe@upi': { reportCount: 0, riskLevel: 'LOW' },
    'merchant.safe@okaxis': { reportCount: 0, riskLevel: 'LOW' },
    'fraudster@upi': { reportCount: 11, riskLevel: 'HIGH' },
    'lottery-claim@oksbi': { reportCount: 8, riskLevel: 'HIGH' },
    'unknowncash@okhdfc': { reportCount: 4, riskLevel: 'MEDIUM' },
  },
  domains: {
    'trustedpay.example': { reportCount: 0, riskLevel: 'LOW' },
    'secure-upi-check.com': { reportCount: 13, riskLevel: 'HIGH' },
    'upi-auth-check.org': { reportCount: 9, riskLevel: 'HIGH' },
    'instant-refund-now.co': { reportCount: 6, riskLevel: 'MEDIUM' },
  },
};

const RISK_TO_SCORE = {
  LOW: 0.05,
  MEDIUM: 0.55,
  HIGH: 0.9,
};

export class CommunityIntelligenceService {
  lookup({ upiId, hostname }) {
    const normalizedUpi = String(upiId || '').toLowerCase().trim();
    const normalizedHost = String(hostname || '').toLowerCase().trim();

    const upiHit = normalizedUpi ? COMMUNITY_REPORTS.upi[normalizedUpi] : null;
    const domainHit = normalizedHost ? COMMUNITY_REPORTS.domains[normalizedHost] : null;

    const reportCount = Math.max(upiHit?.reportCount || 0, domainHit?.reportCount || 0);
    const riskLevel =
      upiHit?.riskLevel ||
      domainHit?.riskLevel ||
      'LOW';

    const reasons = [];
    if (upiHit?.reportCount > 0) {
      reasons.push(`UPI ID reported by ${upiHit.reportCount} user(s)`);
    }
    if (domainHit?.reportCount > 0) {
      reasons.push(`Domain reported by ${domainHit.reportCount} user(s)`);
    }

    return {
      reportCount,
      riskLevel,
      communityRiskScore: RISK_TO_SCORE[riskLevel] ?? 0.05,
      reasons,
    };
  }
}

export default CommunityIntelligenceService;
