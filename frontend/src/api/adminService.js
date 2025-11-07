import axios from 'axios';

import { getApiUrl } from '../utils/apiConfig';
const API_URL = process.env.REACT_APP_API_URL || getApiUrl('/api/admin');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const loginAdmin = async (credentials) => {
  try {
    const { data } = await api.post('/login', credentials);
    // data = { token, admin }
    return data;
  } catch (err) {
    if (err.response?.data?.message) throw new Error(err.response.data.message);
    throw err;
  }
};

export const registerAdmin = async (payload) => {
  try {
    const { data } = await api.post('/register', payload);
    return data;
  } catch (err) {
    if (err.response?.data?.message) throw new Error(err.response.data.message);
    throw err;
  }
};
