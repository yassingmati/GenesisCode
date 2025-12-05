// src/services/categoryPaymentService.js
import API_CONFIG from '../config/api';

const BASE = `${API_CONFIG.BASE_URL}/api/category-payments`;

function authHeaders() {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function httpJson(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || data?.error || 'Request failed';
    throw new Error(message);
  }
  return data;
}

// Récupère tous les plans de catégories
async function getCategoryPlans() {
  const url = `${BASE}/plans`;
  return httpJson(url);
}

// Récupère le plan d'une catégorie spécifique
async function getCategoryPlan(categoryId) {
  const url = `${BASE}/plans/${categoryId}`;
  return httpJson(url);
}

// Initialise un paiement pour une catégorie
async function initCategoryPayment(categoryId, returnUrl, cancelUrl) {
  const url = `${BASE}/init-payment`;
  return httpJson(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ categoryId, returnUrl, cancelUrl })
  });
}

// Vérifie si l'utilisateur a accès à une catégorie
async function checkCategoryAccess(categoryId) {
  const url = `${BASE}/access/${categoryId}`;
  return httpJson(url, { headers: authHeaders() });
}

// Récupère l'historique des accès de l'utilisateur
async function getUserAccessHistory() {
  const url = `${BASE}/history`;
  return httpJson(url, { headers: authHeaders() });
}

// Vérifie l'accès à un niveau
async function checkLevelAccess(categoryId, pathId, levelId) {
  const url = `${BASE}/access/${categoryId}/${pathId}/${levelId}`;
  return httpJson(url, { headers: authHeaders() });
}

// Débloque un niveau
async function unlockLevel(categoryId, pathId, levelId) {
  const url = `${BASE}/unlock-level`;
  return httpJson(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ categoryId, pathId, levelId })
  });
}

const CategoryPaymentService = {
  getCategoryPlans,
  getCategoryPlan,
  initCategoryPayment,
  getUserAccessHistory,
  checkLevelAccess,
  checkCategoryAccess,
  unlockLevel
};

export default CategoryPaymentService;


