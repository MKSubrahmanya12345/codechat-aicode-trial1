// ??$$$ Axios HTTP client setup with auth interceptors
// ??$$$ VITE_API_URL from env: localhost in dev, Render URL in production
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach JWT token to every request
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lg_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default http;
