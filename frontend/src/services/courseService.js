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

export async function getCategories(type) {
  const url = type ? `${base}/categories?type=${encodeURIComponent(type)}` : `${base}/categories`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export async function getPathsByCategory(categoryId) {
  const res = await fetch(`${base}/categories/${categoryId}/paths`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to load paths');
  return res.json();
}

export async function getLevelsByPath(pathId) {
  const res = await fetch(`${base}/paths/${pathId}/levels`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to load levels');
  return res.json();
}


