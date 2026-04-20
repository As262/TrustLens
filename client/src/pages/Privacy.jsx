import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Pie, PieChart, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { PrivacySkeleton } from '../components/LoadingSkeletons';
import useTrust from '../hooks/useTrust';

const COLORS = ['#1A56DB', '#10B981', '#D97706', '#DC2626', '#64748B'];

export default function Privacy() {
  const { factors, loading, error, refetch } = useTrust();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toggles, setToggles] = useState({
    location: true,
    history: true,
    device: true,
    patterns: true,
  });

  const dataTypes = [
    {
      id: 'location',
      name: 'Location',
      why: 'Detect unusual geographic patterns and travel anomalies.',
      retention: '90 days',
    },
    {
      id: 'history',
      name: 'Transaction History',
      why: 'Build your baseline spending behavior and anomaly thresholds.',
      retention: '12 months',
    },
    {
      id: 'device',
      name: 'Device Info',
      why: 'Confirm known devices and flag risky logins.',
      retention: '30 days',
    },
    {
      id: 'patterns',
      name: 'Login Patterns',
      why: 'Identify unusual access times and account takeover attempts.',
      retention: '6 months',
    },
  ];

  const chartData = useMemo(() => {
    if (!factors || factors.length === 0) {
      return [
        { name: 'Amount', value: 30 },
        { name: 'Location', value: 20 },
        { name: 'Device', value: 15 },
        { name: 'Behavior', value: 35 },
      ];
    }
    return factors.map((factor) => ({
      name: factor.name,
      value: Math.abs(Number(factor.weight || 0)) || 1,
    }));
  }, [factors]);

  const handleExport = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      dataControls: toggles,
      factors,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trustlens-data-${Date.now()}.json`;
    link.click();
  };

  if (loading) {
    return <PrivacySkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-white p-6" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          We could not load privacy data.
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
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
          Privacy Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Control what data TrustLens uses to protect you.
        </p>
      </div>

      <div className="rounded-lg border bg-white p-5" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Trust Score Data Usage
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
          What Data We Use
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataTypes.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border bg-white p-5"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                    {item.name}
                  </h3>
                  <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                    {item.why}
                  </p>
                  <p className="text-xs mt-3" style={{ color: 'var(--color-text-light)' }}>
                    Retention: {item.retention}
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={toggles[item.id]}
                    onChange={() =>
                      setToggles((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                  />
                  <div
                    className="w-10 h-6 rounded-full transition-colors"
                    style={{
                      backgroundColor: toggles[item.id]
                        ? 'var(--color-success)'
                        : 'var(--color-border)',
                    }}
                  >
                    <div
                      className="h-4 w-4 bg-white rounded-full transition-transform"
                      style={{
                        transform: toggles[item.id] ? 'translate(18px, 4px)' : 'translate(4px, 4px)',
                      }}
                    />
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleExport}
          className="rounded-lg border px-4 py-3 font-semibold"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
        >
          Export Data
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-lg border px-4 py-3 font-semibold"
          style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
        >
          Delete Account
        </button>
      </div>

      <div className="rounded-lg border bg-white p-5" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
          Delete Account
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Permanently remove your data and close the account.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="mt-4 px-4 py-2 rounded-lg border font-semibold"
          style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
        >
          Delete Account
        </button>
      </div>

      {showDeleteConfirm && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="rounded-lg border bg-white p-6 max-w-md w-full mx-4"
            style={{ borderColor: 'var(--color-border)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              Confirm Deletion
            </h3>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border font-semibold"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-white"
                style={{ backgroundColor: 'var(--color-danger)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
