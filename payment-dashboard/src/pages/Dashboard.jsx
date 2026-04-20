import React, { useState } from 'react';
import PaymentForm from '../components/PaymentForm';
import TrustScoreCard from '../components/TrustScoreCard';
import TransactionStatus from '../components/TransactionStatus';
import BlockReasons from '../components/BlockReasons';
import TransactionTable from '../components/TransactionTable';
import TrustScoreChart from '../components/TrustScoreChart';
import { usePayment } from '../hooks/usePayment';
import { ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { submitPayment, loading, error, result } = usePayment();
  const [history, setHistory] = useState([
    {
       transactionId: 'txn_initial01',
       amount: 15.0,
       score: 95,
       decision: 'Approved',
       reasons: [],
       timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
       transactionId: 'txn_initial02',
       amount: 42.5,
       score: 92,
       decision: 'Approved',
       reasons: [],
       timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const data = await submitPayment(paymentData);
      
      // Add to history
      setHistory(prev => [data, ...prev]);
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8 flex items-center gap-3 border-b border-white/10 pb-6">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">TrustPay</h1>
          <p className="text-slate-400 mt-1">Smart Payment Dashboard with Real-time Fraud Analysis</p>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Payment Form */}
        <div className="lg:col-span-5 space-y-6">
          <PaymentForm onSubmit={handlePaymentSubmit} loading={loading} />
          
          {/* Status and Reasons shown below form if available */}
          {result && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <TransactionStatus decision={result.decision} />
              <BlockReasons reasons={result.reasons} />
            </div>
          )}
        </div>

        {/* Right Column - Analysis & History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TrustScoreCard 
              score={result?.score || history[0]?.score} 
              riskLevel={result?.riskLevel || (history[0]?.score >= 80 ? 'Low' : history[0]?.score >= 50 ? 'Medium' : 'High')} 
            />
            <TrustScoreChart history={history} />
          </div>

          <TransactionTable history={history} />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
