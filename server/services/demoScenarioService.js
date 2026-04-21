/**
 * Demo Scenario Service
 * Provides predefined transaction scenarios for hackathon demo
 */

export class DemoScenarioService {
  static SCENARIOS = {
    SAFE_PAYMENT: {
      id: 'safe-payment',
      title: 'Safe Payment',
      description: 'Low risk payment to trusted UPI recipient',
      icon: '✅',
      color: 'green',
      transaction: {
        amount: 180,
        location: 'New York',
        time: 13,
        device: 'known',
        category: 'shopping',
        recipient: 'safe@upi',
      },
      expectedDecision: 'APPROVED',
      expectedRiskLevel: 'LOW',
      narrative: 'Trusted UPI with normal behavior signals',
    },

    FRAUDULENT_UPI: {
      id: 'fraudulent-upi',
      title: 'Fraudulent UPI',
      description: 'Reported UPI ID with elevated fraud risk',
      icon: '🚩',
      color: 'red',
      transaction: {
        amount: 950,
        location: 'Unknown IP',
        time: 2,
        device: 'unknown',
        category: 'transfer',
        recipient: 'fraudster@upi',
      },
      expectedDecision: 'BLOCKED',
      expectedRiskLevel: 'HIGH',
      narrative: 'High amount plus community-reported UPI should be blocked',
    },

    FAKE_LINK: {
      id: 'fake-link',
      title: 'Fake Link',
      description: 'Suspicious payment URL with phishing signals',
      icon: '⚠️',
      color: 'amber',
      transaction: {
        amount: 420,
        location: 'London',
        time: 1,
        device: 'unknown',
        category: 'shopping',
        recipient: 'http://secure-upi-check.com/pay?pa=lottery-claim@oksbi',
      },
      expectedDecision: 'WARNING',
      expectedRiskLevel: 'MEDIUM',
      narrative: 'Non-HTTPS suspicious domain and reported UPI should trigger warning/block checks',
    },

    NORMAL: {
      id: 'normal',
      title: 'Normal Transaction',
      description: 'A typical transaction matching user profile',
      icon: '✅',
      color: 'green',
      transaction: {
        amount: 75,
        location: 'New York',
        time: 14,
        device: 'known',
        category: 'shopping',
      },
      expectedDecision: 'APPROVE',
      expectedRiskLevel: 'LOW',
      narrative: 'Regular shopping transaction during business hours on trusted device',
    },

    SUSPICIOUS: {
      id: 'suspicious',
      title: 'Suspicious Transaction',
      description: 'Unusual amount, new location, requires verification',
      icon: '🟡',
      color: 'amber',
      transaction: {
        amount: 250,
        location: 'Tokyo',
        time: 3,
        device: 'unknown',
        category: 'shopping',
      },
      expectedDecision: 'CHALLENGE',
      expectedRiskLevel: 'MEDIUM',
      narrative: 'Unusual combination: large amount, new location, unusual time, unknown device',
    },

    FRAUD: {
      id: 'fraud',
      title: 'Likely Fraud',
      description: 'Multiple fraud indicators detected',
      icon: '🚩',
      color: 'red',
      transaction: {
        amount: 2000,
        location: 'Dubai',
        time: 4,
        device: 'unknown',
        category: 'transfer',
      },
      expectedDecision: 'DECLINE',
      expectedRiskLevel: 'HIGH',
      narrative: 'High-risk transaction: very large amount (10x+ average), international location, middle of night, unknown device',
    },
  };

  /**
   * Get all demo scenarios
   */
  static getAllScenarios() {
    return Object.values(this.SCENARIOS);
  }

  /**
   * Get scenario by ID
   */
  static getScenario(scenarioId) {
    return this.SCENARIOS[scenarioId.toUpperCase()] || null;
  }

  /**
   * Get scenario details with explanations
   */
  static getScenarioDetails(scenarioId) {
    const scenario = this.getScenario(scenarioId);
    if (!scenario) return null;

    return {
      ...scenario,
      explanations: this.getExplanations(scenarioId),
    };
  }

  /**
   * Get detailed explanations for why each scenario gets its decision
   */
  static getExplanations(scenarioId) {
    const explanations = {
      NORMAL: [
        '✅ Amount $75 is within user typical range ($50-$200)',
        '✅ New York is a primary transaction location',
        '✅ 2:00 PM is typical business hours',
        '✅ Known device matches recent device history',
        '✅ Shopping matches user spending pattern',
      ],
      SUSPICIOUS: [
        '⚠️ Amount $250 is 3.3x user average ($75)',
        '⚠️ Tokyo is a NEW location (not in user history)',
        '⚠️ 3:00 AM is unusual time for transactions',
        '⚠️ Unknown device - first time seeing this device',
        '⚠️ Combination of factors increases risk',
      ],
      FRAUD: [
        '🚩 Amount $2,000 is 26.7x user average ($75)',
        '🚩 Dubai is an INTERNATIONAL location - high-risk',
        '🚩 4:00 AM is extremely unusual (late night)',
        '🚩 Unknown device - new device detected',
        '🚩 Transfer category with high amount is suspicious',
        '🚩 Multiple red flags together indicate likely fraud',
      ],
    };

    return explanations[scenarioId.toUpperCase()] || [];
  }

  /**
   * Get demo metric insights (for dashboard context)
   */
  static getDemoMetrics() {
    return {
      totalTransactions: 1100,
      fraudRate: '~5%',
      avgAmount: '$175',
      topLocations: ['New York', 'Los Angeles', 'Chicago'],
      deviceLoyalty: '78%',
      profileConfidence: '95%',
    };
  }
}

export default DemoScenarioService;
