import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const FraudAlertPanel = ({ alert = null, onDismiss }) => {
  if (!alert) {
    return (
      <div className="clay-card">
        <div className="flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div>
            <p className="font-semibold text-gray-800">All Clear</p>
            <p className="text-sm text-gray-600">No fraudulent activity detected</p>
          </div>
        </div>
      </div>
    );
  }

  const getAlertIcon = () => {
    if (alert.riskLevel.includes('High')) {
      return <AlertTriangle className="w-8 h-8 text-red-500" />;
    }
    return <AlertCircle className="w-8 h-8 text-amber-500" />;
  };

  const getAlertBackground = () => {
    if (alert.riskLevel.includes('High')) {
      return 'bg-red-50 border-l-4 border-red-500';
    }
    if (alert.riskLevel.includes('Medium')) {
      return 'bg-amber-50 border-l-4 border-amber-500';
    }
    return 'bg-green-50 border-l-4 border-green-500';
  };

  return (
    <div className={`clay-card ${getAlertBackground()} alert-slide-in`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {getAlertIcon()}
          <div className="flex-1">
            <p className="font-bold text-lg text-gray-800">{alert.riskLevel}</p>
            <p className="text-sm text-gray-700 mt-2">{alert.summary}</p>

            {/* Fraud score */}
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-2">Fraud Score: {(alert.fraudScore * 100).toFixed(1)}%</p>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${alert.fraudScore * 100}%`,
                    backgroundColor:
                      alert.fraudScore > 0.6
                        ? '#ef4444'
                        : alert.fraudScore > 0.3
                        ? '#f59e0b'
                        : '#10b981',
                  }}
                />
              </div>
            </div>

            {/* Reasons */}
            {alert.explanations && alert.explanations.length > 0 && (
              <div className="mt-4 space-y-1">
                <p className="text-xs font-semibold text-gray-600 uppercase">Risk Factors:</p>
                {alert.explanations.map((reason, idx) => (
                  <p key={idx} className="text-sm text-gray-700">
                    • {reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default FraudAlertPanel;
