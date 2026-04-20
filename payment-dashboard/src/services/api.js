import axios from 'axios';

const BACKEND_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const processPayment = async (paymentData) => {
    try {
        const response = await api.post('/pay', paymentData);
        return response.data; 
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getTransactions = async () => {
    try {
        const response = await api.get('/transactions');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getUserProfile = async (userId) => {
    try {
        const response = await api.get('/users/' + userId);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export default api;
