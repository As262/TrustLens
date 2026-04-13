import React, { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import TrustScoreCard from './components/TrustScoreCard';
import TransactionList from './components/TransactionList';
import FraudAlertPanel from './components/FraudAlertPanel';
import ExplanationBox from './components/ExplanationBox';
import TransactionForm from './components/TransactionForm';
import { transactionAPI } from './services/api';
import socketService from './services/socketService';

const DEMO_USER_ID = '507f1f77bcf86cd799439011'; // Demo user ID

function App() {
  const [transactions, setTransactions] = useState([]);
  const [trustScore, setTrustScore] = useState(85);
  const [riskLevel, setRiskLevel] = useState('low');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize
  useEffect(() => {
    initializeApp();
    connectSocket();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize demo data by creating sample transactions
      console.log('🚀 TrustLens initialized');
      loadTrustScore();
      loadTransactions();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const connectSocket = () => {
    try {
      socketService.connect(DEMO_USER_ID);
      socketService.on('fraudDetected', (data) => {
        console.log('🚨 Fraud Alert:', data);
        setCurrentAlert({
          fraudScore: data.fraudScore,
          riskLevel: data.riskLevel,
          summary: data.summary,
          explanations: data.explanations,
        });
      });
      setIsConnected(true);
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.getTransactions(DEMO_USER_ID, 10, 0);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadTrustScore = async () => {
    try {
      const response = await transactionAPI.getTrustScore(DEMO_USER_ID);
      setTrustScore(response.data.trustScore);
      setRiskLevel(response.data.riskLevel);
    } catch (error) {
      console.error('Error loading trust score:', error);
    }
  };

  const handleSubmitTransaction = async (formData) => {
    setLoading(true);
    try {
      const transactionData = {
        userId: DEMO_USER_ID,
        amount: parseFloat(formData.amount),
        location: formData.location,
        deviceId:
          formData.deviceName.toLowerCase().replace(/\s+/g, '-') ||
          `device-${Date.now()}`,
        deviceName: formData.deviceName,
        category: formData.category,
      };

      const response = await transactionAPI.submit(transactionData);

      // Update UI with response
      const newTransaction = {
        _id: response.data.transaction,
        ...transactionData,
        fraudScore: parseFloat(response.data.fraudScore),
        isFlagged: response.data.isFlagged,
        explanations: response.data.explanations,
        status: response.data.status,
        timestamp: new Date(),
      };

      setTransactions((prev) => [newTransaction, ...prev]);
      setTrustScore(response.data.trustScore);
      setRiskLevel(response.data.riskLevel);

      // Show alert if flagged
      if (response.data.isFlagged) {
        setCurrentAlert({
          fraudScore: parseFloat(response.data.fraudScore),
          riskLevel: response.data.summary.riskLevel,
          summary: response.data.summary.summary,
          explanations: response.data.explanations,
        });
      } else {
        setCurrentAlert(null);
      }

      // Emit via socket
      socketService.emit('transactionAlert', {
        fraudScore: parseFloat(response.data.fraudScore),
        riskLevel: response.data.summary.riskLevel,
        summary: response.data.summary.summary,
        explanations: response.data.explanations,
      });

      alert('✅ Transaction submitted successfully!');
    } catch (error) {
      console.error('Error submitting transaction:', error);
      alert('❌ Error submitting transaction: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Navigation className="w-8 h-8 text-clay-600" />
          <h1 className="text-4xl font-bold text-gray-800">TrustLens</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Explainable AI Layer for Digital Banking
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected to AI Engine' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Transaction Form + Trust Score */}
        <div className="lg:col-span-1 space-y-8">
          <TransactionForm onSubmit={handleSubmitTransaction} loading={loading} />
          <TrustScoreCard trustScore={trustScore} riskLevel={riskLevel} />
        </div>

        {/* Column 2: Main Content - Alert + Explanation */}
        <div className="lg:col-span-1 space-y-8">
          <FraudAlertPanel alert={currentAlert} onDismiss={() => setCurrentAlert(null)} />
          <ExplanationBox
            transaction={selectedTransaction}
            loading={loading}
          />
        </div>

        {/* Column 3: Transaction History */}
        <div className="lg:col-span-1">
          <TransactionList
            transactions={transactions}
            onTransactionClick={(tx) => {
              setSelectedTransaction(tx);
              setCurrentAlert(null);
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          © 2024 TrustLens - Built for the Hackathon. Real-time fraud detection
          with explainable AI.
        </p>
      </div>
    </div>
  );
}

export default App;
