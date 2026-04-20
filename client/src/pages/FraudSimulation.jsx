import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Activity, ShieldCheck } from 'lucide-react';
import TrustScoreBadge from '../components/TrustScoreBadge';
import { FraudSimulationSkeleton } from '../components/LoadingSkeletons';
import useTrust from '../hooks/useTrust';
import { demoAPI } from '../utils/api';
import socketService from '../services/socketService';

const scenarios = [
  {
    type: 'card_cloning',
    name: 'Card Cloning',
    description: 'Multiple small transactions in quick succession across cities.',
    what: '5 rapid purchases in different locations within minutes.',
    trustDelta: -25,
    explanation: 'Velocity and geo-anomaly signals triggered. Device mismatch raised risk score.',
    alerts: [
      { severity: 'critical', message: 'Velocity spike detected across 5 locations.' },
      { severity: 'high', message: 'Unrecognized devices used within 3 minutes.' },
    ],
    transactions: [
      { merchant: 'QuickMart', amount: 1200, location: 'Mumbai', category: 'shopping' },
      { merchant: 'MetroStop', amount: 980, location: 'Delhi', category: 'shopping' },
      { merchant: 'CityLine', amount: 1400, location: 'Bangalore', category: 'shopping' },
      { merchant: 'DailyNow', amount: 760, location: 'Chennai', category: 'shopping' },
      { merchant: 'StreetHub', amount: 1150, location: 'Kolkata', category: 'shopping' },
    ],
  },
  {
    type: 'account_takeover',
    name: 'Account Takeover',
    description: 'New country login followed by immediate large transfer.',
    what: 'Large international transfer and new device login.',
    trustDelta: -40,
    explanation: 'Geo-risk and device anomalies stacked with high-value transfer.',
    alerts: [
      { severity: 'critical', message: 'Login from new country detected.' },
      { severity: 'critical', message: 'Large transfer flagged for verification.' },
    ],
    transactions: [
      { merchant: 'Global Wire', amount: 55000, location: 'Singapore', category: 'transfer' },
      { merchant: 'FX Relay', amount: 48000, location: 'Bangkok', category: 'transfer' },
    ],
  },
  {
    type: 'merchant_fraud',
    name: 'Merchant Fraud',
    description: 'Risky merchant category triggers heightened monitoring.',
    what: 'High-risk merchant category and new merchant ID.',
    trustDelta: -18,
    explanation: 'Merchant risk profile exceeded category thresholds.',
    alerts: [
      { severity: 'high', message: 'High-risk merchant category detected.' },
    ],
    transactions: [
      { merchant: 'Crypto Exchange XYZ', amount: 12000, location: 'Unknown', category: 'transfer' },
    ],
  },
  {
    type: 'velocity_attack',
    name: 'Velocity Attack',
    description: '10+ transactions fired by automated bot activity.',
    what: '12 rapid-fire transactions in under 5 minutes.',
    trustDelta: -35,
    explanation: 'Burst rate exceeded velocity thresholds and triggered automated block.',
    alerts: [
      { severity: 'critical', message: 'Transaction burst rate exceeded safe limits.' },
      { severity: 'high', message: 'Automated behavior detected.' },
    ],
    transactions: [
      { merchant: 'Digital Goods', amount: 640, location: 'Virtual', category: 'shopping' },
      { merchant: 'Online Store', amount: 820, location: 'Virtual', category: 'shopping' },
      { merchant: 'API Charge', amount: 950, location: 'Virtual', category: 'shopping' },
      { merchant: 'Marketplace', amount: 1100, location: 'Virtual', category: 'shopping' },
    ],
  },
];

const severityColor = {
  critical: 'var(--color-danger)',
  high: 'var(--color-warning)',
  medium: 'var(--color-info)',
  low: 'var(--color-text-muted)',
};

export default function FraudSimulation({ user }) {
  const { score, loading, error, refetch } = useTrust();
  const baseScore = score?.score ?? 60;

  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [trustScore, setTrustScore] = useState(baseScore);
  const [feed, setFeed] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [apiError, setApiError] = useState(null);

  const intervalRef = useRef(null);

  useEffect(() => {
    setTrustScore(baseScore);
  }, [baseScore]);

  useEffect(() => {
    const socket = socketService.connect(user?.id);
    socket.on('connect', () => setIsLive(true));
    socket.on('disconnect', () => setIsLive(false));
    return () => socketService.disconnect();
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const runSimulation = async (scenario) => {
    if (!scenario) return;

    setSelectedScenario(scenario);
    setIsRunning(true);
    setApiError(null);
    setFeed([]);
    setAlerts([]);
    setExplanation('');

    try {
      await demoAPI.simulate({ type: scenario.type });
    } catch (err) {
      setApiError('Simulation API unavailable. Running local demo instead.');
    }

    const startScore = baseScore;
    setTrustScore(startScore);
    const targetScore = Math.max(0, startScore + scenario.trustDelta);
    const steps = 8;
    let step = 0;

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      step += 1;
      const nextScore = Math.round(
        startScore + ((targetScore - startScore) * step) / steps
      );
      setTrustScore(nextScore);

      const nextTransaction = scenario.transactions[step - 1];
      if (nextTransaction) {
        setFeed((prev) => [
          {
            ...nextTransaction,
            timestamp: new Date(),
          },
          ...prev,
        ]);
      }

      const nextAlert = scenario.alerts[step - 1];
      if (nextAlert) {
        setAlerts((prev) => [nextAlert, ...prev]);
      }

      if (step >= steps) {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setExplanation(scenario.explanation);
      }
    }, 500);
  };

  const resetSimulation = () => {
    setSelectedScenario(null);
    setIsRunning(false);
    setTrustScore(baseScore);
    setFeed([]);
    setAlerts([]);
    setExplanation('');
    setApiError(null);
    clearInterval(intervalRef.current);
  };

  const scenarioTitle = useMemo(() => selectedScenario?.name || 'Select a scenario', [selectedScenario]);

  if (loading) {
    return <FraudSimulationSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-white p-6" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          We could not load simulation data.
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          {error}
        </p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 rounded-lg border font-semibold"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Fraud Simulation
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Stress-test TrustLens against real-world fraud patterns.
          </p>
        </div>
        <div
          className="px-3 py-2 rounded-lg border text-xs font-semibold"
          style={{
            borderColor: isLive ? 'var(--color-success)' : 'var(--color-border)',
            color: isLive ? 'var(--color-success)' : 'var(--color-text-muted)',
          }}
        >
          {isLive ? 'Socket.io Live' : 'Simulated'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario) => (
          <div
            key={scenario.type}
            className="rounded-lg border bg-white p-5"
            style={{
              borderColor:
                selectedScenario?.type === scenario.type
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
            }}
          >
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {scenario.name}
            </h3>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {scenario.description}
            </p>
            <p className="text-xs mt-3" style={{ color: 'var(--color-text-light)' }}>
              What it does: {scenario.what}
            </p>
            <button
              onClick={() => runSimulation(scenario)}
              disabled={isRunning}
              className="mt-4 w-full px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isRunning && selectedScenario?.type === scenario.type
                ? 'Running...'
                : 'Run Simulation'}
            </button>
          </div>
        ))}
      </div>

      {apiError && (
        <div className="rounded-lg border bg-white p-4" style={{ borderColor: 'var(--color-warning)' }}>
          <p className="text-sm" style={{ color: 'var(--color-warning)' }}>
            {apiError}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-5" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
            Trust Score
          </p>
          <div className="mt-4 flex items-center justify-center">
            <TrustScoreBadge score={trustScore} size="md" />
          </div>
          <p className="text-sm mt-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
            Scenario: {scenarioTitle}
          </p>
          <button
            onClick={resetSimulation}
            className="mt-4 w-full px-4 py-2 rounded-lg border font-semibold"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            Reset
          </button>
        </div>

        <div className="rounded-lg border bg-white p-5" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              Live Transaction Feed
            </h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {feed.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Transactions will appear here during the simulation.
              </p>
            ) : (
              feed.map((txn, index) => (
                <div
                  key={`${txn.merchant}-${index}`}
                  className="rounded-lg border p-3"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {txn.merchant}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {txn.location} • {txn.category}
                  </p>
                  <p className="text-sm font-semibold mt-2" style={{ color: 'var(--color-primary)' }}>
                    INR {txn.amount}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              Alerts Fired
            </h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Alerts will appear here once triggered.
              </p>
            ) : (
              alerts.map((alert, index) => {
                const severity = alert.severity || 'low';
                return (
                  <div
                    key={`${alert.message}-${index}`}
                    className="rounded-lg border p-3"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <p className="text-xs font-semibold" style={{ color: severityColor[severity] }}>
                      {severity.toUpperCase()}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text)' }}>
                      {alert.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
            How TrustLens Detected This
          </h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {explanation || 'Run a scenario to see the detection rationale.'}
        </p>
      </div>
    </div>
  );
}
