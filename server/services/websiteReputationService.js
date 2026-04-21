import WebsiteReputation from '../models/WebsiteReputation.js';

const DEFAULT_WEBSITES = [
  { domain: 'paytm.com', displayName: 'Paytm', category: 'payment', isLegit: true, trustScore: 92, riskLevel: 'LOW', tags: ['wallet', 'upi'] },
  { domain: 'phonepe.com', displayName: 'PhonePe', category: 'payment', isLegit: true, trustScore: 93, riskLevel: 'LOW', tags: ['upi'] },
  { domain: 'google.com', displayName: 'Google', category: 'payment', isLegit: true, trustScore: 95, riskLevel: 'LOW', tags: ['gpay'] },
  { domain: 'paypal.com', displayName: 'PayPal', category: 'payment', isLegit: true, trustScore: 94, riskLevel: 'LOW', tags: ['global-payments'] },
  { domain: 'amazon.in', displayName: 'Amazon India', category: 'ecommerce', isLegit: true, trustScore: 90, riskLevel: 'LOW', tags: ['shopping'] },
  { domain: 'flipkart.com', displayName: 'Flipkart', category: 'ecommerce', isLegit: true, trustScore: 88, riskLevel: 'LOW', tags: ['shopping'] },
  { domain: 'onlinesbi.sbi', displayName: 'SBI Online', category: 'banking', isLegit: true, trustScore: 90, riskLevel: 'LOW', tags: ['banking'] },
  { domain: 'hdfcbank.com', displayName: 'HDFC Bank', category: 'banking', isLegit: true, trustScore: 91, riskLevel: 'LOW', tags: ['banking'] },
  { domain: 'icicibank.com', displayName: 'ICICI Bank', category: 'banking', isLegit: true, trustScore: 90, riskLevel: 'LOW', tags: ['banking'] },
  { domain: 'secure-upi-check.com', displayName: 'Secure UPI Check', category: 'other', isLegit: false, trustScore: 8, riskLevel: 'HIGH', tags: ['phishing'] },
  { domain: 'upi-auth-check.org', displayName: 'UPI Auth Check', category: 'other', isLegit: false, trustScore: 12, riskLevel: 'HIGH', tags: ['phishing'] },
  { domain: 'instant-refund-now.co', displayName: 'Instant Refund', category: 'other', isLegit: false, trustScore: 15, riskLevel: 'HIGH', tags: ['refund-scam'] },
];

export class WebsiteReputationService {
  constructor() {
    this.seeded = false;
  }

  normalizeHostname(hostname) {
    const host = String(hostname || '').toLowerCase().trim();
    return host.replace(/^www\./, '');
  }

  async ensureDefaults() {
    if (this.seeded) return;

    const count = await WebsiteReputation.countDocuments();
    if (count === 0) {
      await WebsiteReputation.insertMany(DEFAULT_WEBSITES);
    }

    this.seeded = true;
  }

  async getDomainProfile(hostname) {
    await this.ensureDefaults();

    const normalized = this.normalizeHostname(hostname);
    if (!normalized) return null;

    const parts = normalized.split('.');
    const rootDomain = parts.length >= 2 ? `${parts[parts.length - 2]}.${parts[parts.length - 1]}` : normalized;

    const exact = await WebsiteReputation.findOne({ domain: normalized }).lean();
    if (exact) return { ...exact, matchedBy: 'exact' };

    const root = await WebsiteReputation.findOne({ domain: rootDomain }).lean();
    if (root) return { ...root, matchedBy: 'root' };

    return null;
  }

  async listKnownWebsites({ limit = 100 } = {}) {
    await this.ensureDefaults();

    const websites = await WebsiteReputation.find({})
      .sort({ isLegit: -1, trustScore: -1, domain: 1 })
      .limit(limit)
      .lean();

    return websites.map((site) => ({
      domain: site.domain,
      displayName: site.displayName,
      category: site.category,
      isLegit: site.isLegit,
      trustScore: site.trustScore,
      riskLevel: site.riskLevel,
      tags: site.tags,
    }));
  }
}

export default WebsiteReputationService;
