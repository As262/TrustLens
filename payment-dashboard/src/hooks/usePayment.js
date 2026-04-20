import { useState, useCallback } from 'react';
import { processPayment } from '../services/api';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const submitPayment = useCallback(async (paymentData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Mock device telemetry for demonstration
      const augmentedData = {
        ...paymentData,
        deviceId: 'device_' + navigator.userAgent.substring(0, 15).replace(/\s/g, ''),
        location: '192.168.1.1 (US, CA)'
      };
      const apiResponse = await processPayment(augmentedData);
      
      // The Node API returns { success: true, transactionId, status, aiScore: { score, riskLevel, decision, reasons } }
      // We need to unwrap it for the React components to consume correctly.
      const data = {
        transactionId: apiResponse.transactionId,
        score: apiResponse.aiScore.score,
        riskLevel: apiResponse.aiScore.riskLevel,
        decision: apiResponse.aiScore.decision,
        reasons: apiResponse.aiScore.reasons,
        amount: augmentedData.amount,
        timestamp: new Date().toISOString(),
        status: apiResponse.status
      };

      setResult(data);
      return data;
    } catch (err) {
      setError(err.message || err.error || 'An error occurred during submission.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submitPayment, loading, error, result, setResult };
};
