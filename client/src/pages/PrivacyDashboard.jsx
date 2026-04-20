import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Lock, Shield, Eye, Database, Check } from 'lucide-react';

const DATA_CATEGORIES = [
  {
    id: 'location',
    name: 'Location Data',
    icon: 'location',
    riskLevel: 'MEDIUM',
    riskEmoji: '📍',
    collected: 'Your transaction locations (city/region)',
    why: 'Used to detect impossible travel scenarios and establish your typical activity zones',
    retention: '2 years',
    usage: ['Fraud Detection', 'Pattern Analysis', 'Account Security'],
    isShared: false,
  },
  {
    id: 'spending',
    name: 'Spending Patterns',
    icon: 'spending',
    riskLevel: 'LOW',
    riskEmoji: '💰',
    collected: 'Transaction amounts, frequency, and categories',
    why: 'Helps establish your normal spending profile to detect anomalies',
    retention: '2 years',
    usage: ['Behavioral Profiling', 'Risk Assessment', 'Personalization'],
    isShared: false,
  },
  {
    id: 'time',
    name: 'Time Patterns',
    icon: 'time',
    riskLevel: 'LOW',
    riskEmoji: '⏰',
    collected: 'Time of day and day of week for transactions',
    why: 'Identifies unusual activity times that may indicate compromised accounts',
    retention: '1 year',
    usage: ['Anomaly Detection', 'Behavioral Analysis'],
    isShared: false,
  },
  {
    id: 'device',
    name: 'Device Information',
    icon: 'device',
    riskLevel: 'MEDIUM',
    riskEmoji: '📱',
    collected: 'Device names, types, and identifiers',
    why: 'Tracks known vs. unknown devices to prevent unauthorized access',
    retention: '2 years',
    usage: ['Device Verification', 'Security Monitoring', 'Risk Assessment'],
    isShared: false,
  },
  {
    id: 'metadata',
    name: 'Transaction Metadata',
    icon: 'metadata',
    riskLevel: 'LOW',
    riskEmoji: '📡',
    collected: 'IP addresses, user agents, session info',
    why: 'Provides technical context for security auditing and investigation',
    retention: '90 days',
    usage: ['Security Audits', 'Incident Investigation'],
    isShared: false,
  },
  {
    id: 'compliance',
    name: 'Regulatory Compliance',
    icon: 'compliance',
    riskLevel: 'LOW',
    riskEmoji: '🔐',
    collected: 'Account age, identity verification, watchlist status',
    why: 'Required by law to comply with AML/KYC regulations',
    retention: '7 years',
    usage: ['Compliance', 'Legal Requirements', 'Fraud Prevention'],
    isShared: true,
    sharedWith: 'Financial Regulators (when legally required)',
  },
];

function RiskBadge({ level, emoji }) {
  const colors = {
    LOW: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HIGH: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${colors[level]}`}>
      {emoji} {level}
    </span>
  );
}

function DataCategoryCard({ category, onLearnMore }) {
  return (
    <div className="clay-card p-6 hover:shadow-clay-lg transition-shadow cursor-pointer" onClick={onLearnMore}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-clay-900 mb-2">{category.name}</h3>
          <p className="text-sm text-clay-600">{category.collected}</p>
        </div>
        <span className="text-3xl">{category.riskEmoji}</span>
      </div>

      <div className="flex items-center justify-between">
        <RiskBadge level={category.riskLevel} emoji={category.riskEmoji} />
        <span className="text-xs text-clay-600">Tap for details →</span>
      </div>
    </div>
  );
}

function DetailsModal({ category, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-clay p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-clay-900 flex items-center gap-3">
            <span>{category.riskEmoji}</span>
            {category.name}
          </h2>
          <button
            onClick={onClose}
            className="text-clay-900 hover:text-clay-700 font-bold text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* What */}
          <div>
            <h3 className="font-bold text-clay-900 mb-2 flex items-center gap-2">
              <Database className="w-5 h-5" /> What We Collect
            </h3>
            <p className="text-clay-700 bg-clay-50 p-4 rounded-lg">{category.collected}</p>
          </div>

          {/* Why */}
          <div>
            <h3 className="font-bold text-clay-900 mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5" /> Why We Collect It
            </h3>
            <p className="text-clay-700 bg-clay-50 p-4 rounded-lg">{category.why}</p>
          </div>

          {/* How It's Used */}
          <div>
            <h3 className="font-bold text-clay-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" /> How It's Used
            </h3>
            <div className="space-y-2">
              {category.usage.map((use, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-clay-700">{use}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Retention */}
          <div>
            <h3 className="font-bold text-clay-900 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5" /> Data Retention
            </h3>
            <p className="text-clay-700 bg-blue-50 p-4 rounded-lg">
              We keep this data for <strong>{category.retention}</strong> before secure deletion.
            </p>
          </div>

          {/* Sharing */}
          <div>
            <h3 className="font-bold text-clay-900 mb-2">Is This Data Shared?</h3>
            {category.isShared ? (
              <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
                <p className="text-amber-900 font-semibold mb-1">⚠️ Yes, with conditions</p>
                <p className="text-amber-800">{category.sharedWith}</p>
                <p className="text-xs text-amber-700 mt-2">
                  Only shared when legally required or with your explicit consent.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="text-green-900 font-semibold">✅ No, kept private</p>
                <p className="text-green-800">This data is never shared with third parties.</p>
              </div>
            )}
          </div>

          {/* Risk Level */}
          <div>
            <h3 className="font-bold text-clay-900 mb-2">Risk Level</h3>
            <div className="flex items-center gap-4">
              <RiskBadge level={category.riskLevel} emoji={category.riskEmoji} />
              <p className="text-sm text-clay-700">
                {category.riskLevel === 'LOW' &&
                  'Low-risk data with standard industry protections'}
                {category.riskLevel === 'MEDIUM' &&
                  'Moderate-risk data requiring encryption and access controls'}
                {category.riskLevel === 'HIGH' &&
                  'High-sensitivity data with maximum protection'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-clay-200 bg-clay-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-clay-300 text-clay-900 font-bold rounded-lg hover:bg-clay-400 transition-colors"
          >
            Close
          </button>
          <button className="flex-1 py-3 bg-gradient-trust-high text-white font-bold rounded-lg hover:shadow-clay-lg transition-shadow">
            Download Report
          </button>
        </div>
      </div>
      </div>
}

export default function PrivacyDashboard() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-clay-900 mb-2">Privacy Dashboard</h1>
        <p className="text-clay-600">Transparency about how your data is collected and used</p>
      </div>

      {/* Privacy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="clay-card p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-clay-600 text-sm mb-1">Encryption</p>
              <p className="text-2xl font-bold text-green-600">End-to-End</p>
            </div>
            <Lock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="clay-card p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-clay-600 text-sm mb-1">Data Retention</p>
              <p className="text-2xl font-bold text-blue-600">Auto-Delete</p>
            </div>
            <Database className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="clay-card p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-clay-600 text-sm mb-1">Your Control</p>
              <p className="text-2xl font-bold text-purple-600">Full Rights</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Privacy Statement */}
      <div className="clay-card p-6 bg-blue-50 border-2 border-blue-200">
        <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-6 h-6" /> Your Data Rights
        </h2>
        <ul className="space-y-2 text-blue-900">
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 mt-0.5" />
            <span><strong>Right to Access:</strong> Download all data we hold about you anytime</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 mt-0.5" />
            <span><strong>Right to Delete:</strong> Request deletion of your data (except legally required records)</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 mt-0.5" />
            <span><strong>Right to Portability:</strong> Export your data in standard formats</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 mt-0.5" />
            <span><strong>Right to Opt-Out:</strong> Disable certain data collection features</span>
          </li>
        </ul>
      </div>

      {/* Data Categories */}
      <div>
        <h2 className="text-2xl font-bold text-clay-900 mb-4">Data Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DATA_CATEGORIES.map((category) => (
            <DataCategoryCard
              key={category.id}
              category={category}
              onLearnMore={() => setSelectedCategory(category)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="clay-card p-6 text-center">
        <p className="text-clay-600 mb-4">
          Questions about your privacy? Contact our Data Privacy Officer.
        </p>
        <button className="py-2 px-6 bg-gradient-trust-high text-white font-semibold rounded-lg hover:shadow-clay-lg transition-shadow">
          Contact DPO
        </button>
      </div>

      {/* Modal */}
      {selectedCategory && (
        <DetailsModal category={selectedCategory} onClose={() => setSelectedCategory(null)} />
      )}
    </div>
  );
}
