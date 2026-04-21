/**
 * Synthetic Transaction Data Generator
 * Generates realistic transaction patterns for testing and training
 * Includes normal behavior and fraud anomalies
 */

class SyntheticDataGenerator {
  constructor() {
    // Geographic data
    this.locations = [
      'New York', 'Los Angeles', 'Chicago', 'Boston', 'Miami',
      'San Francisco', 'Seattle', 'Denver', 'Austin', 'Dallas',
      'London', 'Tokyo', 'Singapore', 'Dubai', 'Toronto'
    ];

    this.primaryLocations = ['New York', 'Los Angeles', 'Chicago'];

    // Device data
    this.devices = [
      { name: 'Windows PC', id: 'device-windows-pc' },
      { name: 'MacBook Pro', id: 'device-macbook-pro' },
      { name: 'iPad Air', id: 'device-ipad-air' },
      { name: 'Samsung Galaxy S24', id: 'device-galaxy-s24' },
      { name: 'Google Pixel 8', id: 'device-pixel-8' },
    ];

    // Transaction categories
    this.categories = ['shopping', 'dining', 'utilities', 'entertainment', 'transfer', 'withdrawal'];

    // Customer profiles with different spending patterns
    this.customerProfiles = {
      lowSpender: {
        avgDailyAmount: 50,
        amountStdDev: 30,
        transactionsPerDay: 0.5,
        categories: { shopping: 0.3, dining: 0.2, utilities: 0.3, entertainment: 0.1, transfer: 0.1 },
        deviceLoyalty: 0.9,
        locationLoyalty: 0.85,
        workingHoursOnly: true,
      },
      moderateSpender: {
        avgDailyAmount: 150,
        amountStdDev: 80,
        transactionsPerDay: 1.2,
        categories: { shopping: 0.45, dining: 0.25, utilities: 0.1, entertainment: 0.15, transfer: 0.05 },
        deviceLoyalty: 0.75,
        locationLoyalty: 0.80,
        workingHoursOnly: false,
      },
      highSpender: {
        avgDailyAmount: 400,
        amountStdDev: 300,
        transactionsPerDay: 2.0,
        categories: { shopping: 0.40, dining: 0.30, entertainment: 0.15, utilities: 0.10, transfer: 0.05 },
        deviceLoyalty: 0.60,
        locationLoyalty: 0.70,
        workingHoursOnly: false,
      },
      businessUser: {
        avgDailyAmount: 800,
        amountStdDev: 600,
        transactionsPerDay: 3.0,
        categories: { transfer: 0.50, shopping: 0.30, dining: 0.15, utilities: 0.05, entertainment: 0.0 },
        deviceLoyalty: 0.85,
        locationLoyalty: 0.65,
        workingHoursOnly: true,
      },
      internationalTraveler: {
        avgDailyAmount: 200,
        amountStdDev: 150,
        transactionsPerDay: 1.8,
        categories: { dining: 0.40, shopping: 0.35, entertainment: 0.20, utilities: 0.05 },
        deviceLoyalty: 0.50,
        locationLoyalty: 0.30,
        workingHoursOnly: false,
      },
    };

    // Fraud patterns
    this.fraudPatterns = {
      largeUnusualAmount: {
        description: 'Single large transaction significantly above normal',
        amountMultiplier: 5, // 5x average
        likelihood: 0.1,
      },
      rapidBurst: {
        description: 'Multiple transactions in short time span',
        transactionsPerHour: 5,
        likelihood: 0.08,
      },
      newLocationFirst: {
        description: 'First transaction from new location with large amount',
        isNewLocation: true,
        amountMultiplier: 3,
        likelihood: 0.07,
      },
      impossibleTravel: {
        description: 'Transactions from geographically distant locations in short time',
        speedMph: 600,
        likelihood: 0.05,
      },
      unusualTime: {
        description: 'Transaction at unusual hour for this user',
        hourRange: [2, 3, 4, 5], // 2-5 AM
        likelihood: 0.06,
      },
      weekendUnusual: {
        description: 'Large spending on weekend when user typically shops weekdays',
        dayOfWeek: [0, 6],
        amountMultiplier: 4,
        likelihood: 0.04,
      },
      velocitySpike: {
        description: 'Transaction frequency spike',
        maxTransactionsPerDay: 20,
        likelihood: 0.03,
      },
    };
  }

  /**
   * Generate a complete user profile with realistic behavioral patterns
   */
  generateUserProfile(profileType = 'moderateSpender', baseDate = new Date()) {
    const profile = this.customerProfiles[profileType];

    // Create time pattern distribution (24 hours)
    const typicalHours = this._generateHourDistribution(profile.workingHoursOnly);

    // Create day pattern distribution (7 days)
    const typicalDays = this._generateDayDistribution();

    return {
      profileType,
      typicalHours,
      typicalDays,
      amountStats: {
        mean: profile.avgDailyAmount,
        median: profile.avgDailyAmount * 0.9,
        stdDev: profile.amountStdDev,
        p25: profile.avgDailyAmount * 0.3,
        p50: profile.avgDailyAmount * 0.6,
        p75: profile.avgDailyAmount * 1.2,
        p95: profile.avgDailyAmount * 2.5,
        p99: profile.avgDailyAmount * 4.0,
        minAmount: 5,
        maxAmount: profile.avgDailyAmount * 5,
        rangeLabel: profileType === 'lowSpender' ? 'low' : profileType === 'highSpender' ? 'high' : 'moderate',
      },
      categoryPreferences: this._generateCategoryPreferences(profile.categories),
      velocityMetrics: {
        maxPerHour: Math.ceil(profile.transactionsPerDay / 3),
        maxPerDay: Math.ceil(profile.transactionsPerDay * 4),
        maxPerWeek: Math.ceil(profile.transactionsPerDay * 7 * 1.5),
        typicalPerDay: profile.transactionsPerDay,
      },
      primaryLocations: this._selectPrimaryLocations(),
      usualCountries: ['US'],
      newLocationFrequency: 0.05,
      travelPattern: profileType === 'internationalTraveler' ? 'global' : 'mostly_local',
      deviceCount: Math.floor(Math.random() * 3) + 1,
      deviceLoyalty: profile.deviceLoyalty,
      deviceRotation: 1 - profile.deviceLoyalty,
      accountCreatedDate: new Date(baseDate.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      accountAge: Math.floor(Math.random() * 1095) + 30, // 1 month to 3 years
      totalTransactions: 0,
      transactionVelocity: profile.transactionsPerDay,
      fraudFlagCount: 0,
      fraudFlagRate: 0,
      declinedTransactionCount: 0,
      lastAccountReview: baseDate,
      profileConfidence: 0.8,
    };
  }

  /**
   * Generate realistic transactions for a user
   */
  generateTransactions(userId, userProfile, count = 200, startDate = new Date()) {
    const transactions = [];
    const profile = this.customerProfiles[userProfile.profileType];
    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() - Math.floor(count / userProfile.transactionVelocity));

    let fraudCharacteristics = {
      fraudCount: 0,
      fraudPatternUsed: null,
    };

    for (let i = 0; i < count; i++) {
      // Randomly skip days based on velocity
      const skipDays = Math.random() > userProfile.transactionVelocity ? 1 : 0;
      currentDate.setDate(currentDate.getDate() + skipDays);

      // Determine if this should be a fraud transaction
      const isFraud = Math.random() < 0.05; // 5% fraud rate

      let transaction;
      if (isFraud) {
        transaction = this._generateFraudTransaction(userId, userProfile, currentDate);
        fraudCharacteristics.fraudCount++;
        if (!fraudCharacteristics.fraudPatternUsed) {
          fraudCharacteristics.fraudPatternUsed = transaction.fraudPattern;
        }
      } else {
        transaction = this._generateNormalTransaction(userId, userProfile, currentDate);
      }

      transactions.push(transaction);
    }

    // Update profile stats
    userProfile.totalTransactions = count;
    userProfile.fraudFlagCount = fraudCharacteristics.fraudCount;
    userProfile.fraudFlagRate = fraudCharacteristics.fraudCount / count;

    return transactions;
  }

  /**
   * Generate a normal transaction based on user profile
   */
  _generateNormalTransaction(userId, userProfile, date) {
    const profile = this.customerProfiles[userProfile.profileType];

    // Select time based on typical hours
    const hour = this._selectWeightedHour(userProfile);
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);

    const transactionDate = new Date(date);
    transactionDate.setHours(hour, minute, second, 0);

    // Select location
    const location = this._selectLocation(userProfile.primaryLocations, userProfile.deviceLoyalty);

    // Select category
    const category = this._selectCategory(userProfile.categoryPreferences);

    // Generate amount with log-normal distribution for realistic spending
    const amount = this._generateAmount(
      userProfile.amountStats,
      profile.avgDailyAmount,
      profile.amountStdDev
    );

    // Select device
    const device = this._selectDevice(userProfile.deviceLoyalty);

    return {
      userId,
      amount: Math.round(amount * 100) / 100,
      currency: 'USD',
      location,
      deviceId: device.id,
      deviceName: device.name,
      timestamp: transactionDate,
      category,
      fraudScore: 0.1 + Math.random() * 0.2, // Normal transactions: 0.1-0.3
      isFlagged: false,
      explanations: [],
      status: 'completed',
      trustScoreImpact: 1,
    };
  }

  /**
   * Generate a fraudulent transaction with characteristic patterns
   */
  _generateFraudTransaction(userId, userProfile, date) {
    const fraudPattern = this._selectFraudPattern();
    const profile = this.customerProfiles[userProfile.profileType];

    let transaction = {
      userId,
      currency: 'USD',
      timestamp: date,
      category: 'shopping',
      explanations: [`Fraud Pattern: ${fraudPattern.description}`],
      status: 'flagged',
      fraudScore: 0.7 + Math.random() * 0.3, // Fraud transactions: 0.7-1.0
      isFlagged: true,
      trustScoreImpact: -5,
      fraudPattern: Object.keys(this.fraudPatterns).find(
        key => this.fraudPatterns[key].description === fraudPattern.description
      ),
    };

    // Apply fraud pattern characteristics
    if (fraudPattern === this.fraudPatterns.largeUnusualAmount) {
      transaction.amount = userProfile.amountStats.mean * fraudPattern.amountMultiplier;
      transaction.location = this._selectLocation(userProfile.primaryLocations, 0.5);
      transaction.deviceId = this._selectDevice(0.3).id;
      transaction.category = 'shopping';
    } else if (fraudPattern === this.fraudPatterns.rapidBurst) {
      transaction.amount = userProfile.amountStats.mean * 0.5;
      transaction.location = userProfile.primaryLocations[0];
      transaction.deviceId = this._selectDevice(0.4).id;
      const hour = Math.floor(Math.random() * 24);
      transaction.timestamp.setHours(hour, Math.floor(Math.random() * 60), 0);
      transaction.category = 'shopping';
    } else if (fraudPattern === this.fraudPatterns.newLocationFirst) {
      transaction.amount = userProfile.amountStats.mean * fraudPattern.amountMultiplier;
      transaction.location = this.locations[Math.floor(Math.random() * this.locations.length)];
      // Ensure it's actually a new location
      while (userProfile.primaryLocations.includes(transaction.location)) {
        transaction.location = this.locations[Math.floor(Math.random() * this.locations.length)];
      }
      transaction.deviceId = this._selectDevice(0.2).id;
    } else if (fraudPattern === this.fraudPatterns.impossibleTravel) {
      transaction.amount = userProfile.amountStats.mean * 1.5;
      // Select a distant location
      const distantLocations = ['Tokyo', 'London', 'Dubai'];
      transaction.location = distantLocations[Math.floor(Math.random() * distantLocations.length)];
      // Set time right after previous transaction
      transaction.timestamp.setHours(
        Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 60),
        0
      );
      transaction.deviceId = this._selectDevice(0.1).id;
    } else if (fraudPattern === this.fraudPatterns.unusualTime) {
      transaction.amount = userProfile.amountStats.mean * 0.8;
      transaction.deviceId = this._selectDevice(0.6).id;
      const hour = fraudPattern.hourRange[Math.floor(Math.random() * fraudPattern.hourRange.length)];
      transaction.timestamp.setHours(hour, Math.floor(Math.random() * 60), 0);
      transaction.location = userProfile.primaryLocations[0];
      transaction.category = 'transfer';
    } else if (fraudPattern === this.fraudPatterns.weekendUnusual) {
      transaction.amount = userProfile.amountStats.mean * fraudPattern.amountMultiplier;
      transaction.location = this._selectLocation(userProfile.primaryLocations, 0.4);
      transaction.deviceId = this._selectDevice(0.5).id;
      const day = fraudPattern.dayOfWeek[Math.floor(Math.random() * 2)];
      transaction.timestamp.setDate(date.getDate() + (day === 0 ? 0 : 6));
    } else if (fraudPattern === this.fraudPatterns.velocitySpike) {
      transaction.amount = userProfile.amountStats.mean * 0.6;
      transaction.location = userProfile.primaryLocations[Math.floor(Math.random() * userProfile.primaryLocations.length)];
      transaction.deviceId = this._selectDevice(0.7).id;
      transaction.category = this.categories[Math.floor(Math.random() * this.categories.length)];
    }

    transaction.amount = Math.round(transaction.amount * 100) / 100;
    // Ensure deviceId is always set
    if (!transaction.deviceId) {
      transaction.deviceId = this._selectDevice(0.5).id;
    }
    const device = this._selectDevice(0.2);
    transaction.deviceName = device.name;

    return transaction;
  }

  /**
   * Helper: Generate hour distribution for typical transaction times
   */
  _generateHourDistribution(workingHoursOnly = false) {
    const distribution = new Array(24).fill(0);

    if (workingHoursOnly) {
      // Peak during 9-17 with small secondary peak at lunch
      for (let i = 9; i < 18; i++) {
        distribution[i] = 12 + Math.random() * 8;
      }
      for (let i = 12; i < 14; i++) {
        distribution[i] += 5;
      }
    } else {
      // Broader distribution with peaks during morning/evening
      for (let i = 7; i < 23; i++) {
        distribution[i] = 5 + Math.random() * 10;
      }
      // Morning peak
      for (let i = 9; i < 12; i++) {
        distribution[i] += 8;
      }
      // Evening peak
      for (let i = 17; i < 20; i++) {
        distribution[i] += 8;
      }
    }

    // Normalize to sum to 1
    const sum = distribution.reduce((a, b) => a + b, 0);
    const normalized = distribution.map(v => v / sum);

    // Calculate mean (expected hour)
    let mean = 0;
    for (let i = 0; i < 24; i++) {
      mean += i * normalized[i];
    }

    // Calculate mode (most common hour)
    const mode = distribution.indexOf(Math.max(...distribution));

    return {
      distribution: normalized,
      mean: Math.round(mean),
      mode: mode,
      std: Math.random() * 2 + 1, // Placeholder std dev
    };
  }

  /**
   * Helper: Generate day distribution for typical transaction days
   */
  _generateDayDistribution() {
    const distribution = new Array(7).fill(0);

    // Weekday bias
    for (let i = 1; i < 6; i++) {
      distribution[i] = 15 + Math.random() * 5;
    }
    // Weekend (less activity)
    distribution[0] = 8 + Math.random() * 4;
    distribution[6] = 8 + Math.random() * 4;

    // Normalize
    const sum = distribution.reduce((a, b) => a + b, 0);
    return {
      distribution: distribution.map(v => v / sum),
      businessDaysOnly: Math.random() > 0.7,
      weekendRate: (distribution[0] + distribution[6]) / sum,
    };
  }

  /**
   * Helper: Generate category preferences
   */
  _generateCategoryPreferences(categoryWeights) {
    const prefs = new Map();

    this.categories.forEach(cat => {
      const weight = categoryWeights[cat] || 0.1;
      prefs.set(cat, {
        count: Math.floor(weight * 200),
        avgAmount: 50 + Math.random() * 200,
        frequency: this._frequencyLabel(weight),
      });
    });

    return prefs;
  }

  /**
   * Helper: Convert weight to frequency label
   */
  _frequencyLabel(weight) {
    if (weight > 0.3) return 'daily';
    if (weight > 0.15) return 'weekly';
    if (weight > 0.05) return 'monthly';
    return 'quarterly';
  }

  /**
   * Helper: Select primary locations for user
   */
  _selectPrimaryLocations(count = 3) {
    const result = [];
    const primary = this.primaryLocations.slice(0, count);

    while (result.length < count && primary.length > 0) {
      const idx = Math.floor(Math.random() * primary.length);
      result.push(primary[idx]);
      primary.splice(idx, 1);
    }

    return result;
  }

  /**
   * Helper: Select weighted hour from distribution
   */
  _selectWeightedHour(userProfile) {
    // Defensive: ensure typicalHours exists with distribution
    if (!userProfile?.typicalHours?.distribution) {
      console.warn('Warning: typicalHours.distribution not found, using random hour');
      return Math.floor(Math.random() * 24);
    }

    const { distribution } = userProfile.typicalHours;
    const rand = Math.random();
    let cumulative = 0;

    for (let i = 0; i < 24; i++) {
      cumulative += distribution[i];
      if (rand < cumulative) return i;
    }

    return Math.floor(Math.random() * 24);
  }

  /**
   * Helper: Select location with loyalty bias
   */
  _selectLocation(primaryLocations, loyalty) {
    // Defensive: ensure primaryLocations is valid
    if (!primaryLocations || primaryLocations.length === 0) {
      return this.locations[Math.floor(Math.random() * this.locations.length)];
    }

    if (Math.random() < loyalty) {
      return primaryLocations[Math.floor(Math.random() * primaryLocations.length)];
    }
    return this.locations[Math.floor(Math.random() * this.locations.length)];
  }

  /**
   * Helper: Select category from preferences
   */
  _selectCategory(categoryPrefs) {
    const categories = Array.from(categoryPrefs.keys());
    return categories[Math.floor(Math.random() * categories.length)];
  }

  /**
   * Helper: Generate transaction amount with log-normal distribution
   */
  _generateAmount(amountStats, mean, stdDev) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    let amount = mean + z * stdDev;

    // Clamp to reasonable range
    amount = Math.max(amountStats.minAmount, Math.min(amount, amountStats.maxAmount));

    return amount;
  }

  /**
   * Helper: Select device with loyalty bias
   */
  _selectDevice(loyalty = 0.8) {
    try {
      if (Math.random() < loyalty && this.devices.length > 0) {
        const device = this.devices[0]; // Primary device
        return { id: device.id || `device-${Date.now()}`, name: device.name || 'Primary Device' };
      }
      const device = this.devices[Math.floor(Math.random() * this.devices.length)];
      return { id: device.id || `device-${Date.now()}`, name: device.name || 'Device' };
    } catch (e) {
      // Fallback
      return { id: `device-${Date.now()}`, name: 'Device' };
    }
  }

  /**
   * Helper: Select fraud pattern
   */
  _selectFraudPattern() {
    const patterns = Object.values(this.fraudPatterns);
    const rand = Math.random();
    const total = patterns.reduce((s, p) => s + p.likelihood, 0);

    let cumulative = 0;
    for (const pattern of patterns) {
      cumulative += pattern.likelihood / total;
      if (rand < cumulative) return pattern;
    }

    return patterns[0];
  }
}

export default SyntheticDataGenerator;
