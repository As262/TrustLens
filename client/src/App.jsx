import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Privacy from './pages/Privacy';
import FraudSimulation from './pages/FraudSimulation';
import SendPayment from './pages/SendPayment';
import Alerts from './pages/Alerts';
import Auth from './pages/Auth';
import useTrust from './hooks/useTrust';
import useAlerts from './hooks/useAlerts';
import { authAPI } from './utils/api';

function App() {
  const { score } = useTrust();
  const { unreadCount } = useAlerts();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('trustlens_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.success) {
            setUser(res.data.user);
            window.dispatchEvent(new Event('trustScoreUpdated'));
          }
        } catch (error) {
          console.error('Auth session expired', error);
          localStorage.removeItem('trustlens_token');
          await authAPI.logout().catch(() => undefined);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('trustlens_token', token);
    setUser(userData);
    window.dispatchEvent(new Event('trustScoreUpdated'));
  };

  const handleLogout = () => {
    localStorage.removeItem('trustlens_token');
    authAPI.logout().catch(() => undefined);
    setUser(null);
    window.location.href = '/';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse bg-blue-100 text-blue-800 px-6 py-3 rounded-full font-medium">Loading TrustLens...</div></div>;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Router>
      <MainLayout
        user={user}
        trustScore={score?.score || 60}
        alertCount={unreadCount}
        isConnected={true}
        onLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/transactions" element={<Transactions user={user} />} />
          <Route path="/privacy" element={<Privacy user={user} />} />
          <Route path="/fraud-simulator" element={<FraudSimulation user={user} />} />          <Route path="/send-payment" element={<SendPayment user={user} />} />          <Route path="/alerts" element={<Alerts user={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
