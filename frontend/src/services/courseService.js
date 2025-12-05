import API_CONFIG from '../config/api';

const base = `${API_CONFIG.BASE_URL}/api/courses`;

const headers = () => {
  // Try adminToken first, then user token
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('token');
  const token = adminToken || userToken || '';

  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
    throw new Error('Session expirée');
  }
  if (!res.ok) throw new Error('Request failed');
  return res.json();
};

export async function getCategories(type) {
  const url = type ? `${base}/categories?type=${encodeURIComponent(type)}` : `${base}/categories`;
  const res = await fetch(url, { headers: headers() });
  return handleResponse(res);
}

export async function getPathsByCategory(categoryId) {
  const res = await fetch(`${base}/categories/${categoryId}/paths`, { headers: headers() });
  return handleResponse(res);
}

export async function getLevelsByPath(pathId) {
  const res = await fetch(`${base}/paths/${pathId}/levels`, { headers: headers() });
  return handleResponse(res);
}


