import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response error logging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export const authService = {
  signup: (name, email, password) =>
    api.post('/auth/signup', { name, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  logout: () =>
    api.post('/auth/logout'),
  getProfile: () =>
    api.get('/auth/profile'),
};

export const transactionService = {
  uploadCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/transactions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getTransactions: (filters) =>
    api.get('/transactions/transactions', { params: filters }),
  getDashboard: () =>
    api.get('/transactions/dashboard'),
  exportCSV: () =>
    api.get('/transactions/export/csv', { responseType: 'blob' }),
  exportPDF: () =>
    api.get('/transactions/export/pdf', { responseType: 'blob' }),
};

export default api;
