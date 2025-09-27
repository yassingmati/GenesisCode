// src/utils/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

const baseURL = process.env.REACT_APP_API_BASE_URL || ''; // ex: http://localhost:5000

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Add Authorization header if token exists in localStorage
api.interceptors.request.use(cfg => {
  try {
    const token = localStorage.getItem('token'); // adapte si tu utilises AuthContext
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  } catch (e) { /* ignore */ }
  return cfg;
}, err => Promise.reject(err));

// Simple global response interceptor to show errors
api.interceptors.response.use(r => r, err => {
  const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Erreur réseau';
  // Avoid spamming on each request; show toast for unhandled errors
  toast.error(msg, { autoClose: 4000 });
  return Promise.reject(err);
});

export default api;
