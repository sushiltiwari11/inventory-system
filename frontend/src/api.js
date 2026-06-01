import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// This interceptor automatically attaches the JWT token to every request!
api.interceptors.request.use(
  (config) => {
    // 1. Look in the browser's storage for the token
    const token = localStorage.getItem('token');
    
    // 2. If the token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;