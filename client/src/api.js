import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5005/api', // Point to Node.js backend
});

// Interceptor to add JWT token from localStorage to headers automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
