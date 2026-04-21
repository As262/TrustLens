import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Zap, ListIcon, Lock, AlertCircle, Menu, X, Send
} from 'lucide-react';
import AlertBadge from '../AlertBadge';

const navItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: Home },
  { path: '/app/send-payment', label: 'Send Payment', icon: Send },
  { path: '/app/transactions', label: 'Transactions', icon: ListIcon },
  { path: '/app/fraud-simulator', label: 'Fraud Detection', icon: Zap },
  { path: '/app/alerts', label: 'Alerts', icon: AlertCircle },
  { path: '/app/privacy', label: 'Privacy', icon: Lock },
];

export default function Sidebar({ isOpen, setOpen, alertCount = 0 }) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !isOpen) {
        setOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, setOpen]);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg border transition-all"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
        }}
        onClick={() => setOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:static w-64 h-screen flex-shrink-0 rounded-none transition-all duration-300 z-40 flex flex-col border-r`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header Spacing for Mobile */}
        <div className="md:hidden h-[72px]" />

        {/* Logo/Brand */}
        <div className="px-6 h-[72px] border-b flex-shrink-0 flex flex-col justify-center" style={{ borderColor: 'var(--color-border)' }}>
          <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--color-primary)' }}>
            TrustLens
          </h1>
          <p className="text-[11px] leading-tight mt-0.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Explainable AI Banking
          </p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'font-bold'
                    : 'opacity-90 hover:opacity-100 hover:bg-slate-800'
                }`}
                style={{
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--color-text-light)' }}>
            🔐 Encrypted & Secure
          </p>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 md:hidden z-30 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
