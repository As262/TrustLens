const SUSPICIOUS_KEYWORDS = [
  'verify',
  'update-kyc',
  'secure-login',
  'claim-prize',
  'free-money',
  'gift-card',
  'otp',
  'wallet-update',
  'urgent',
];

const SUSPICIOUS_DOMAINS = new Set([
  'secure-upi-check.com',
  'paytm-verification.net',
  'upi-auth-check.org',
  'wallet-safe-check.info',
  'instant-refund-now.co',
]);

const SHORTENER_DOMAINS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'cutt.ly']);
const BRAND_TOKENS = ['paytm', 'phonepe', 'gpay', 'googlepay', 'paypal', 'amazonpay', 'bhim', 'sbi', 'hdfc', 'icici', 'axis'];
const INTENT_PAYMENT_HINTS = ['pay', 'collect', 'request', 'amount', 'txn', 'transaction', 'upi', 'send'];
const INTENT_LOGIN_HINTS = ['login', 'signin', 'verify', 'otp', 'password', 'auth', 'kyc'];

export class LinkAnalysisService {
  normalizeRecipient(recipientRaw) {
    const recipient = String(recipientRaw || '').trim();
    return recipient;
  }

  isLikelyUrl(recipient) {
    return /^https?:\/\//i.test(recipient);
  }

  isLikelyUpiUri(recipient) {
    return /^upi:\/\//i.test(recipient);
  }

  isLikelyUpi(recipient) {
    return /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/i.test(recipient);
  }

  sanitizeUrl(rawUrl) {
    try {
      const url = new URL(rawUrl);
      return {
        ok: true,
        url,
      };
    } catch {
      return {
        ok: false,
        error: 'Invalid URL format',
      };
    }
  }

  extractUpiIdFromUrl(url) {
    if (!url) return null;

    const upiParam =
      url.searchParams.get('pa') ||
      url.searchParams.get('upi') ||
      url.searchParams.get('vpa') ||
      url.searchParams.get('receiver');

    if (!upiParam) return null;
    return this.isLikelyUpi(upiParam) ? upiParam : null;
  }

  scoreDomainSimilarity(rootDomain) {
    if (!rootDomain) return { score: 0, matchedBrand: null };

    const normalized = rootDomain.replace(/[^a-z0-9]/g, '').toLowerCase();
    let bestScore = 0;
    let matchedBrand = null;

    for (const brand of BRAND_TOKENS) {
      const brandNorm = brand.replace(/[^a-z0-9]/g, '');
      if (!brandNorm) continue;

      const containsWithExtra = normalized.includes(brandNorm) && normalized !== brandNorm;
      const prefixTrick = normalized.startsWith(`${brandNorm}secure`) || normalized.endsWith(`secure${brandNorm}`);
      const similarity = this.diceCoefficient(normalized, brandNorm);
      const score = containsWithExtra || prefixTrick ? Math.max(0.8, similarity) : similarity;

      if (score > bestScore) {
        bestScore = score;
        matchedBrand = brand;
      }
    }

    return { score: Number(bestScore.toFixed(3)), matchedBrand };
  }

  diceCoefficient(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;

    const aBigrams = new Map();
    for (let i = 0; i < a.length - 1; i += 1) {
      const gram = a.slice(i, i + 2);
      aBigrams.set(gram, (aBigrams.get(gram) || 0) + 1);
    }

    let overlap = 0;
    for (let i = 0; i < b.length - 1; i += 1) {
      const gram = b.slice(i, i + 2);
      const count = aBigrams.get(gram) || 0;
      if (count > 0) {
        aBigrams.set(gram, count - 1);
        overlap += 1;
      }
    }

    return (2 * overlap) / (a.length + b.length - 2);
  }

  classifyIntent({ pathname, search, extractedUpiId }) {
    const haystack = `${pathname || ''} ${search || ''}`.toLowerCase();
    if (extractedUpiId || INTENT_PAYMENT_HINTS.some((hint) => haystack.includes(hint))) {
      return 'PAYMENT_REQUEST';
    }
    if (INTENT_LOGIN_HINTS.some((hint) => haystack.includes(hint))) {
      return 'LOGIN_REQUEST';
    }
    return 'UNKNOWN_INTENT';
  }

  buildZeroDayAssessment({
    hostname,
    protocol,
    pathname,
    search,
    extractedUpiId,
    sourceType,
    hasPriorInteraction,
  }) {
    const reasons = [];
    let riskBoost = 0;
    let uncertainty = 0;

    const parts = (hostname || '').split('.').filter(Boolean);
    const rootDomain = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || '';
    const subdomainCount = Math.max(0, parts.length - 2);

    const similarity = this.scoreDomainSimilarity(rootDomain);
    if (similarity.score >= 0.74 && rootDomain !== similarity.matchedBrand) {
      riskBoost += 0.25;
      uncertainty += 0.2;
      reasons.push(`Domain resembles known service (${similarity.matchedBrand})`);
    }

    if (subdomainCount >= 2) {
      riskBoost += 0.18;
      reasons.push('Unusual subdomain depth detected');
    }

    const combined = `${hostname || ''}${pathname || ''}${search || ''}`.toLowerCase();
    const matchedKeywords = SUSPICIOUS_KEYWORDS.filter((keyword) => combined.includes(keyword));
    if (matchedKeywords.length > 0) {
      riskBoost += Math.min(0.24, matchedKeywords.length * 0.08);
      reasons.push(`Suspicious keywords present (${matchedKeywords.slice(0, 3).join(', ')})`);
    }

    if (protocol !== 'https:') {
      riskBoost += 0.28;
      reasons.push('HTTP link without TLS protection');
    }

    if (sourceType === 'unknown') {
      riskBoost += 0.14;
      uncertainty += 0.12;
      reasons.push('Link received from unknown source');
    }

    if (!hasPriorInteraction) {
      riskBoost += 0.16;
      uncertainty += 0.16;
      reasons.push('No prior interaction with this recipient');
    }

    const intent = this.classifyIntent({ pathname, search, extractedUpiId });
    if (intent === 'PAYMENT_REQUEST') {
      riskBoost += 0.1;
      reasons.push('Payment intent detected');
    } else if (intent === 'LOGIN_REQUEST') {
      riskBoost += 0.16;
      reasons.push('Login/credential intent detected');
    } else {
      uncertainty += 0.2;
      reasons.push('Intent could not be confidently classified');
    }

    const confidenceScore = Math.max(0.05, Math.min(1, 0.92 - uncertainty - (riskBoost * 0.2)));
    const confidenceLevel = confidenceScore >= 0.75 ? 'HIGH' : confidenceScore >= 0.5 ? 'MEDIUM' : 'LOW';

    let riskLevel = 'LOW';
    if (riskBoost >= 0.55) riskLevel = 'HIGH';
    else if (riskBoost >= 0.28) riskLevel = 'MEDIUM';

    const status = confidenceLevel === 'LOW' ? 'UNVERIFIED' : 'VERIFIED';
    const recommendation = status === 'UNVERIFIED' ? 'Verify before proceeding' : 'Proceed with caution';

    return {
      status,
      confidenceLevel,
      confidenceScore: Number(confidenceScore.toFixed(3)),
      riskLevel,
      riskBoost: Number(Math.min(0.55, riskBoost).toFixed(3)),
      intent,
      reasons,
      recommendation,
    };
  }

  analyze(recipientRaw, context = {}) {
    const recipient = this.normalizeRecipient(recipientRaw);
    const reasons = [];
    const sourceType = context.sourceType || 'unknown';
    const hasPriorInteraction = Boolean(context.hasPriorInteraction);

    if (!recipient) {
      return {
        recipient,
        recipientType: 'UNKNOWN',
        sanitizedRecipient: null,
        extractedUpiId: null,
        isHttps: false,
        linkRiskScore: 1,
        reasons: ['Recipient is required'],
      };
    }

    if (this.isLikelyUpi(recipient)) {
      return {
        recipient,
        recipientType: 'UPI',
        sanitizedRecipient: recipient.toLowerCase(),
        extractedUpiId: recipient.toLowerCase(),
        isHttps: false,
        linkRiskScore: 0.05,
        zeroDay: {
          confidenceLevel: 'MEDIUM',
          confidenceScore: 0.72,
          riskLevel: hasPriorInteraction ? 'LOW' : 'MEDIUM',
          status: hasPriorInteraction ? 'VERIFIED' : 'UNVERIFIED',
          intent: 'PAYMENT_REQUEST',
          reasons: hasPriorInteraction ? ['Known UPI interaction pattern'] : ['No historical data available'],
          recommendation: hasPriorInteraction ? 'Proceed with caution' : 'Verify before proceeding',
        },
        reasons: [],
      };
    }

    if (this.isLikelyUpiUri(recipient)) {
      const parsed = this.sanitizeUrl(recipient);
      const extractedUpiId = parsed.ok ? this.extractUpiIdFromUrl(parsed.url) : null;
      const qrReasons = [];
      let qrScore = 0.08;

      if (!extractedUpiId) {
        qrScore = 0.7;
        qrReasons.push('QR payload does not contain a valid UPI ID');
      }

      return {
        recipient,
        recipientType: 'QR_UPI_URI',
        sanitizedRecipient: parsed.ok ? parsed.url.toString() : recipient,
        extractedUpiId,
        isHttps: false,
        linkRiskScore: Math.max(qrScore, hasPriorInteraction ? 0.08 : 0.42),
        zeroDay: {
          confidenceLevel: extractedUpiId ? 'MEDIUM' : 'LOW',
          confidenceScore: extractedUpiId ? 0.62 : 0.32,
          riskLevel: extractedUpiId ? (hasPriorInteraction ? 'LOW' : 'MEDIUM') : 'MEDIUM',
          status: extractedUpiId && hasPriorInteraction ? 'VERIFIED' : 'UNVERIFIED',
          intent: 'PAYMENT_REQUEST',
          reasons: extractedUpiId
            ? hasPriorInteraction
              ? ['QR payload contains valid UPI ID']
              : ['No historical data available']
            : ['QR payload does not contain a valid UPI ID'],
          recommendation: extractedUpiId && hasPriorInteraction ? 'Proceed with caution' : 'Verify before proceeding',
        },
        reasons: qrReasons,
      };
    }

    if (!this.isLikelyUrl(recipient)) {
      return {
        recipient,
        recipientType: 'UNKNOWN',
        sanitizedRecipient: null,
        extractedUpiId: null,
        isHttps: false,
        linkRiskScore: 0.8,
        zeroDay: {
          confidenceLevel: 'LOW',
          confidenceScore: 0.2,
          riskLevel: 'MEDIUM',
          status: 'UNVERIFIED',
          intent: 'UNKNOWN_INTENT',
          reasons: ['Unsupported recipient format', 'Intent could not be confidently classified'],
          recommendation: 'Verify before proceeding',
        },
        reasons: ['Recipient must be a valid UPI ID or URL'],
      };
    }

    const parsed = this.sanitizeUrl(recipient);
    if (!parsed.ok) {
      return {
        recipient,
        recipientType: 'LINK',
        sanitizedRecipient: null,
        extractedUpiId: null,
        isHttps: false,
        linkRiskScore: 0.9,
        zeroDay: {
          confidenceLevel: 'LOW',
          confidenceScore: 0.16,
          riskLevel: 'HIGH',
          status: 'UNVERIFIED',
          intent: 'UNKNOWN_INTENT',
          reasons: ['Malformed URL payload', 'No historical data available'],
          recommendation: 'Verify before proceeding',
        },
        reasons: [parsed.error],
      };
    }

    const { url } = parsed;
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();
    const fullUrl = url.toString();
    let score = 0.15;

    if (url.protocol !== 'https:') {
      score += 0.35;
      reasons.push('Link is not HTTPS secured');
    }

    if (SUSPICIOUS_DOMAINS.has(hostname)) {
      score += 0.4;
      reasons.push('Suspicious domain detected');
    }

    if (SHORTENER_DOMAINS.has(hostname)) {
      score += 0.2;
      reasons.push('URL shortener used');
    }

    const combined = `${hostname}${pathname}${url.search.toLowerCase()}`;
    if (SUSPICIOUS_KEYWORDS.some((kw) => combined.includes(kw))) {
      score += 0.2;
      reasons.push('Suspicious link pattern detected');
    }

    const extractedUpiId = this.extractUpiIdFromUrl(url);
    if (!extractedUpiId) {
      score += 0.1;
      reasons.push('No valid UPI ID found in link');
    }

    const zeroDay = this.buildZeroDayAssessment({
      hostname,
      protocol: url.protocol,
      pathname,
      search: url.search.toLowerCase(),
      extractedUpiId,
      sourceType,
      hasPriorInteraction,
    });

    score += zeroDay.riskBoost;
    if (zeroDay.status === 'UNVERIFIED') {
      score = Math.max(score, 0.45);
    }

    return {
      recipient,
      recipientType: 'LINK',
      sanitizedRecipient: fullUrl,
      extractedUpiId,
      isHttps: url.protocol === 'https:',
      hostname,
      zeroDay,
      linkRiskScore: Math.min(1, Number(score.toFixed(3))),
      reasons,
    };
  }
}

export default LinkAnalysisService;
