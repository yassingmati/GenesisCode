import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiConfig';

const API_URL = getApiBaseUrl() + '/api/auth';

export const register = async (email, password, userType) => {
    const response = await axios.post(`${API_URL}/register`, {
        email,
        password,
        userType
    });
    return response.data;
};

export const login = async (email, password, userType) => {
    const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
        userType
    });
    return response.data;
};

export const loginWithGoogle = async (idToken) => {
    const response = await axios.post(`${API_URL}/login/google`, {
        idToken
    }, {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 20000 // 20s timeout
    });
    return response.data;
};
