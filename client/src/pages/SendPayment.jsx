import React, { useState, useEffect } from 'react';
import { ShieldCheck, Crosshair, ArrowRight, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { transactionAPI } from '../utils/api';
import useTrust from '../hooks/useTrust';

export default function SendPayment({ user }) {
  const { score, refetch: refetchTrust } = useTrust();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const getDeviceName = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Windows")) return "Windows PC";
    if (ua.includes("Mac")) return "Mac";
    if (ua.includes("Linux")) return "Linux PC";
    if (ua.includes("iPhone")) return "iPhone";
    if (ua.includes("iPad")) return "iPad";
    if (ua.includes("Android")) return "Android Device";
    return "Unknown Device";
  };

  const [formData, setFormData] = useState({
    amount: '',
    location: 'New York, US',
    deviceName: getDeviceName(),
    category: 'shopping',
  });

  const categories = ['shopping', 'food', 'transport', 'bills', 'entertainment'];
  const commonLocations = ['New York, US', 'London, UK', 'Tokyo, UK', 'Lagos, NG', 'Unknown IP'];

  useEffect(() => {
    setFormData(prev => ({ ...prev, deviceName: getDeviceName() }));
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        userId: user?.id || user?._id,
        amount: Number(formData.amount),
        location: formData.location,
        deviceName: formData.deviceName,
        deviceId: formData.deviceName.toLowerCase().replace(/\s+/g, '-'),
        category: formData.category,
      };
      console.log("Submitting payment:", payload);
      const response = await transactionAPI.submit(payload);

      if (response && response.transaction) {
        setResult({
           ...response,
           transactionId: response.transaction,
           status: response.decision === 'Approve' ? 'Approved' : response.decision,
           trustScoreImpact: (response.trustLevel === 'Low' || response.riskLevel === 'High') ? -10 : 5 // Just a sample mapping for visuals
        });
        // Instantly refresh the trust score because it changed!
        refetchTrust();
      } else {
        setResult({ error: 'Unexpected response from server.' });
      }
    } catch (error) {
      console.error("Payment error:", error);
      const msg = error.response?.data?.error || error.message || 'Network issue or rate limit.';
      setResult({ error: `Failed to process payment. ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  const isRiskResult =
    result?.isFlagged ||
    result?.status?.toLowerCase() === 'block' ||
    result?.status?.toLowerCase() === 'blocked';

  const resultTheme = isRiskResult
    ? {
        surface: 'rgba(239, 68, 68, 0.14)',
        border: 'rgba(239, 68, 68, 0.45)',
        heading: 'var(--color-danger)',
        panel: 'rgba(239, 68, 68, 0.1)',
      }
    : {
        surface: 'rgba(16, 185, 129, 0.14)',
        border: 'rgba(16, 185, 129, 0.45)',
        heading: 'var(--color-success)',
        panel: 'rgba(16, 185, 129, 0.1)',
      };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Send Payment Simulator</h1>
          <p className="text-sm text-slate-500 mt-1">
            Test TrustLens's live transaction viability intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-slate-600">Current Trust Score:</div>
          <div className={`text-lg font-bold ${score?.score >= 75 ? 'text-green-600' : score?.score >= 50 ? 'text-orange-500' : 'text-red-600'}`}>
            {score?.score || 0}/100
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Payment Details</h2>
          <form onSubmit={handleSimulatePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                required
                min="1"
                placeholder="e.g. 500"
                value={formData.amount}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {commonLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none capitalize"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Device</label>
              <input
                type="text"
                name="deviceName"
                required
                value={formData.deviceName}
                readOnly
                className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 animate-spin" /> Analyzing Viability...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Send Payment <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>
        </div>

        <div
          className="rounded-xl border p-6 flex flex-col items-center justify-center min-h-[400px]"
          style={{
            backgroundColor: 'var(--color-surface-secondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          {!result && !loading && (
            <div className="text-center text-slate-400 max-w-sm">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Submit a payment on the left to see TrustLens analyze its viability and calculate its Trust Score impact.</p>
            </div>
          )}

          {loading && (
             <div className="text-center text-blue-600 animate-pulse">
               <Crosshair className="w-12 h-12 mx-auto mb-4 animate-spin" />
               <p className="font-medium text-lg">TrustLens is intervening...</p>
               <p className="text-sm text-slate-500 mt-2">Checking heuristics, IP, and history patterns...</p>
             </div>
          )}

          {result && !loading && !result.error && (
            <div
              className="w-full max-w-sm rounded-xl p-6 shadow-sm border animate-in fade-in zoom-in duration-300"
              style={{
                backgroundColor: resultTheme.surface,
                borderColor: resultTheme.border,
              }}
            >
              <div className="flex justify-center mb-4">
                {isRiskResult ? (
                  <AlertCircle className="w-16 h-16 text-red-500" />
                ) : (
                  <CheckCircle className="w-16 h-16 text-green-500" />
                )}
              </div>

              <h3 className="text-2xl font-bold text-center mb-2" style={{ color: resultTheme.heading }}>
                {result.status?.toLowerCase() === 'block' || result.status?.toLowerCase() === 'blocked' ? 'Payment Blocked' : result.isFlagged ? 'Payment Flagged' : 'Payment Allowed'}
              </h3>

              <p className="text-center text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Transaction ID:{' '}
                <span
                  className="font-mono text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                  }}
                >
                  {result.transactionId || result._id}
                </span>
              </p>

              <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: resultTheme.panel }}>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    AI Reasoning
                  </div>
                  <div className="text-sm font-medium mt-1" style={{ color: 'var(--color-text)' }}>
                    {result.systemMessage || result.reasoning?.ruleReason || result.reasoning?.fraudReason || (result.explanations && result.explanations[0]?.detail) || 'Transaction looks completely normal based on historical patterns.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {result?.error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p>{result.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}