import React, { useEffect, useState } from 'react';
import { Bell, TrendingDown, TrendingUp, Wifi, WifiOff, LogOut } from 'lucide-react';     

export default function Header({ trustScore = 0, isConnected = false, alertCount = 0, onLogout }) {
  const [prevScore, setPrevScore] = useState(trustScore);
  const [scoreChange, setScoreChange] = useState(0);

  useEffect(() => {
    if (trustScore !== prevScore) {
      setScoreChange(trustScore - prevScore);
      setPrevScore(trustScore);
      const timer = setTimeout(() => setScoreChange(0), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [trustScore, prevScore]);

  const getScoreColors = (score) => {
    if (score >= 75) return { bg: 'rgba(22, 163, 74, 0.12)', text: '#16A34A' };
    if (score >= 50) return { bg: 'rgba(217, 119, 6, 0.12)', text: '#D97706' };
    return { bg: 'rgba(220, 38, 38, 0.12)', text: '#DC2626' };
  };

  const colors = getScoreColors(trustScore);

  return (
    <header
      className="sticky top-0 z-40 border-b px-6 h-[72px] flex flex-shrink-0 items-center"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Mobile Branding (hidden on desktop because sidebar has it) */}
        <div className="flex items-center gap-3 md:hidden">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            TL
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>
              TrustLens
            </p>
            <p className="text-xs leading-tight" style={{ color: 'var(--color-text-light)' }}>
              Explainable AI Banking
            </p>
          </div>
        </div>

        {/* Right side items (pushed to right using ml-auto on desktop) */}
        <div className="flex items-center gap-3 ml-auto">
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border ${
              scoreChange !== 0 ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: colors.bg,
              borderColor: 'var(--color-border)',
              color: colors.text,
            }}
          >
            <span className="text-xs">Trust</span>
            <span className="text-sm font-semibold">{trustScore}/100</span>
            {scoreChange > 0 && <TrendingUp className="w-3 h-3" />}
            {scoreChange < 0 && <TrendingDown className="w-3 h-3" />}
          </div>

          {alertCount > 0 && (
            <div
              className="px-3 py-2 rounded-lg flex items-center gap-2 text-white font-semibold"
              style={{ backgroundColor: 'var(--color-danger)' }}
            >
              <Bell className="w-4 h-4" />
              <span className="text-sm">{alertCount}</span>
            </div>
          )}

          <div
            className="flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold"
            style={{
              backgroundColor: isConnected ? 'var(--color-success)' : 'var(--color-danger)',
              borderColor: isConnected ? 'var(--color-success)' : 'var(--color-danger)',
              color: 'white',
            }}
          >
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
