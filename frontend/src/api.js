import axios from 'axios';

const api = axios.create({
  // Swapped localhost for 127.0.0.1 to avoid strict browser CORS blocks
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
});

export default api;