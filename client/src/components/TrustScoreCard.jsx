import React, { useState, useEffect } from 'react';

const TrustScoreCard = ({ trustScore = 60, riskLevel = 'low' }) => {
  const [scoreTheta, setScoreTheta] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScoreTheta((prev) => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Color mapping
  const colors = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444',
  };

  const getRiskColor = () => {
    if (trustScore >= 75) return colors.high;
    if (trustScore >= 50) return colors.medium;
    return colors.low;
  };

  const getRiskLabel = () => {
    if (trustScore >= 75) return '🟢 Low Risk';
    if (trustScore >= 50) return '🟡 Medium Risk';
    return '🔴 High Risk';
  };

  return (
    <div className="card-lg p-8">
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold text-white">Trust Score</h2>

        {/* Circular Score Display */}
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Background circle */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="#374151"
              strokeWidth="8"
            />
            {/* Animated progress ring */}
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke={getRiskColor()}
              strokeWidth="8"
              strokeDasharray={`${(trustScore / 100) * 597} 597`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>

          {/* Score text */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-5xl font-bold" style={{ color: getRiskColor() }}>
              {trustScore}
            </div>
            <div className="text-sm text-slate-400 mt-2">/100</div>
          </div>
        </div>

        {/* Risk indicator */}
        <div className="text-center">
          <p className="text-xl font-semibold mb-2" style={{ color: getRiskColor() }}>{getRiskLabel()}</p>
          <p className="text-sm text-slate-400">
            {trustScore >= 75
              ? 'Your account shows normal behavior patterns'
              : trustScore >= 50
              ? 'Some anomalies detected, monitor your account'
              : 'High risk activity detected - review recent transactions'}
          </p>
        </div>

        {/* Status badge */}
        <div className="badge badge-success">
          <span className="text-sm font-medium">Status: Active</span>
        </div>
      </div>
    </div>
  );
};

export default TrustScoreCard;
