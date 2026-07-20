import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/EMS/backend/index.php',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Safe interceptor implementation
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('ems_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Token read skipped:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;