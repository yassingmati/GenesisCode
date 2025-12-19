import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.REACT_APP_API_URL || 'https://codegenesis-backend.onrender.com/api';

const getAuthToken = async () => {
    // Try adminToken first for admin routes
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) return adminToken;

    const localToken = localStorage.getItem('token');
    if (localToken) return localToken;

    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
};

export const getAllUsers = async () => {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    // The backend /users returns [...]
    return response.data;
};
