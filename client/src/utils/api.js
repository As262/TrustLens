import axios from 'axios';

export const DEMO_USER_ID =
  import.meta.env.VITE_DEMO_USER_ID || '69dccbb4cf6b05ddf9b96846';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustlens_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const hasAccessToken = Boolean(localStorage.getItem('trustlens_token'));
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      hasAccessToken &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await api.post('/auth/refresh');
        const newAccessToken = refreshResponse?.accessToken;

        if (newAccessToken) {
          localStorage.setItem('trustlens_token', newAccessToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('trustlens_token');
        if (refreshError.response?.status === 403) {
          localStorage.removeItem('trustlens_token');
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const transactionAPI = {
  submit: (data) => api.post('/transactions', data),
  getTransactions: ({ userId, page = 1, limit = 10 } = {}) => {
    if (userId) {
      const offset = (page - 1) * limit;
      return api.get(`/transactions/user/${userId}`, { params: { limit, offset } });
    }
    return api.get('/transactions', { params: { page, limit } });
  },
  getStats: ({ userId } = {}) => {
    if (userId) {
      return api.get(`/data/stats/${userId}`);
    }
    return api.get('/transactions/stats');
  },
  getFraudLog: (transactionId) => api.get(`/transactions/fraud-log/${transactionId}`),
};

export const trustAPI = {
  getScore: () => api.get('/trust/score'),
  getHistory: () => api.get('/trust/history'),
  getFactors: () => api.get('/trust/factors'),
};

export const alertsAPI = {
  getAlerts: ({ page = 1, limit = 20, read } = {}) =>
    api.get('/alerts', { params: { page, limit, read } }),
  getUnreadCount: () => api.get('/alerts/unread/count'),
  markAsRead: (alertId) => api.put(`/alerts/${alertId}/read`),
  markAllAsRead: () => api.put('/alerts/mark-all-read'),
  deleteAlert: (alertId) => api.delete(`/alerts/${alertId}`),
  clearRead: () => api.delete('/alerts/clear-read'),
};

export const auditAPI = {
  getLogs: ({ userId, limit = 20, offset = 0, decision, riskLevel, startDate, endDate } = {}) =>
    api.get('/audit-logs', {
      params: { userId, limit, offset, decision, riskLevel, startDate, endDate },
    }),
  getStats: (userId) => api.get(`/audit-logs/stats/${userId}`),
};

export const dataAPI = {
  generateData: (payload) => api.post('/data/generate', payload),
  getStats: (userId) => api.get(`/data/stats/${userId}`),
};

export const demoAPI = {
  simulate: (payload) => api.post('/simulate', payload),
  getScenarios: () => api.get('/demo/scenarios'),
  getScenario: (scenarioId) => api.get(`/demo/scenarios/${scenarioId}`),
  getMetrics: () => api.get('/demo/metrics'),
};

export const authAPI = {
  register: (email, password, name) => api.post('/auth/register', { email, password, name }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

export const healthCheck = () => api.get('/health');

export default api;
