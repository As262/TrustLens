import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Transaction API endpoints
 */
export const transactionAPI = {
  // Submit a new transaction
  submit: (transactionData) => api.post('/transactions', transactionData),

  // Get user transactions
  getTransactions: (userId, limit = 20, offset = 0) =>
    api.get(`/transactions/user/${userId}`, { params: { limit, offset } }),

  // Get fraud log
  getFraudLog: (transactionId) => api.get(`/transactions/fraud-log/${transactionId}`),

  // Get trust score
  getTrustScore: (userId) => api.get(`/transactions/trust-score/${userId}`),
};

/**
 * Health check
 */
export const healthCheck = () => api.get('/health');

export default api;
