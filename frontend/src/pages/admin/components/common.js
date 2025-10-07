// src/pages/CourseManagement/components/common.js
import axios from 'axios';

// API client
export const api = axios.create({
  baseURL: 'http://localhost:5000/api/courses',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper functions
export const pickTitle = (obj) => {
  if (!obj) return '';
  if (obj.translations) {
    return obj.translations.fr?.name || obj.translations.fr?.title || 
           obj.translations.en?.name || obj.translations.en?.title || 
           obj.translations.ar?.name || obj.translations.ar?.title || '';
  }
  return obj.name || obj.title || obj.question || '';
};

// Styles helpers
export const inputStyle = () => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eef2ff',
  background: '#fff',
  width: '100%'
});

export const selectStyle = () => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eef2ff',
  background: '#fff',
  minWidth: '140px'
});

export const textareaStyle = () => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eef2ff',
  background: '#fff',
  minHeight: '100px',
  width: '100%'
});