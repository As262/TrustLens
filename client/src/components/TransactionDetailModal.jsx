import React from 'react';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Laptop,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import RiskFactorCard from './RiskFactorCard';

const formatAmount = (amt) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amt || 0);

const formatTime = (date) =>
  new Date(date || Date.now()).toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getConfidencePercent = (value) => {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return numeric > 1 ? Math.round(numeric) : Math.round(numeric * 100);
};

const getDecisionMeta = (transaction) => {
  const decision = transaction?.decision || (transaction?.isFlagged ? 'ESCALATE' : 'APPROVE');
  const labels = {
    APPROVE: { label: 'Approve', color: 'var(--color-success)' },
    CHALLENGE: { label: 'Challenge', color: 'var(--color-warning)' },
    DECLINE: { label: 'Decline', color: 'var(--color-danger)' },
    ESCALATE: { label: 'Escalate', color: 'var(--color-warning)' },
    HOLD: { label: 'Hold', color: 'var(--color-info)' },
  };
  return labels[decision] || { label: decision, color: 'var(--color-text-muted)' };
};

const buildRiskFactors = (transaction) => {
  const amount = transaction?.amount || 0;
  const fraudScore = Number(transaction?.fraudScore || 0);
  const hour = new Date(transaction?.timestamp || Date.now()).getHours();

  const amountStatus = amount >= 5000 || fraudScore > 0.8 ? 'danger' : amount >= 2000 ? 'warning' : 'normal';
  const timeStatus = hour < 6 || hour > 22 ? 'warning' : 'normal';
  const locationStatus = transaction?.location?.toLowerCase?.().includes('unknown') ? 'warning' : 'normal';
  const deviceStatus = transaction?.deviceName?.toLowerCase?.().includes('unknown') ||
    transaction?.deviceId?.toLowerCase?.().includes('unknown')
    ? 'warning'
    : 'normal';

  return [
    {
      name: 'Amount Pattern',
      status: amountStatus,
      description: amountStatus === 'danger'
        ? 'Amount deviates sharply from recent behavior.'
        : amountStatus === 'warning'
          ? 'Amount is above your typical range.'
          : 'Amount aligns with your usual spending.'
      ,
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      name: 'Location Signal',
      status: locationStatus,
      description: locationStatus === 'warning'
        ? 'Unrecognized or rare location detected.'
        : 'Location matches normal activity.'
      ,
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      name: 'Device Trust',
      status: deviceStatus,
      description: deviceStatus === 'warning'
        ? 'New or unknown device observed.'
        : 'Known device in good standing.'
      ,
      icon: <Laptop className="w-4 h-4" />,
    },
    {
      name: 'Time Behavior',
      status: timeStatus,
      description: timeStatus === 'warning'
        ? 'Transaction time is outside typical hours.'
        : 'Timing aligns with normal patterns.'
      ,
      icon: <Clock className="w-4 h-4" />,
    },
  ];
};

export default function TransactionDetailModal({ transaction, onClose }) {
  if (!transaction) return null;

  const summary =
    transaction?.summary ||
    transaction?.systemMessage ||
    transaction?.reasoning?.fraudReason ||
    'This transaction aligns with your usual activity patterns.';

  const explanation =
    transaction?.humanReadable ||
    transaction?.reasoning?.decisionFactors?.join(' ') ||
    (transaction?.explanations?.map ? transaction?.explanations?.map(exp => typeof exp === 'string' ? exp : exp.detail || exp.factor).join('. ') : undefined) ||
    'No additional explanation is available at this time.';

  const confidence = getConfidencePercent(transaction?.confidence);
  const recommendation = getDecisionMeta(transaction);
  const factors = buildRiskFactors(transaction);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl mx-4 rounded-lg border bg-white p-6 max-h-[90vh] overflow-y-auto"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              Transaction Details
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Review the AI decision and underlying factors.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border text-sm"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div
            className="rounded-lg border p-4"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-secondary)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
              Amount
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {formatAmount(transaction?.amount)}
            </p>
          </div>
          <div
            className="rounded-lg border p-4"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-secondary)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
              Merchant
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {transaction?.merchant || 'Unknown Merchant'}
            </p>
          </div>
          <div
            className="rounded-lg border p-4"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-secondary)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
              Location
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {transaction?.location || 'Unknown'}
            </p>
          </div>
          <div
            className="rounded-lg border p-4"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-secondary)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
              Time
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {formatTime(transaction?.timestamp)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-lg border p-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4" style={{ color: recommendation.color }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-light)' }}>
                Recommendation
              </p>
            </div>
            <p className="text-base font-semibold" style={{ color: recommendation.color }}>
              {recommendation.label}
            </p>
          </div>
          <div
            className="rounded-lg border p-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-light)' }}>
                Fraud Score
              </p>
            </div>
            <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
              {(Number(transaction?.fraudScore || 0) * 100).toFixed(0)}%
            </p>
          </div>
          <div
            className="rounded-lg border p-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-light)' }}>
                Confidence
              </p>
            </div>
            <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
              {confidence !== null ? `${confidence}%` : 'N/A'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            AI Summary
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {summary}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            Risk Factors
          </h3>
          <div className="space-y-3">
            {factors.map((factor) => (
              <RiskFactorCard key={factor.name} factor={factor} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            Human-Readable Explanation
          </h3>
          <blockquote
            className="border-l-4 pl-4 py-2 rounded-r-lg"
            style={{
              borderColor: 'var(--color-primary)',
              backgroundColor: 'var(--color-surface-secondary)',
              color: 'var(--color-text-muted)',
            }}
          >
            {explanation}
          </blockquote>
        </div>
      </div>
    </div>
  );
}
