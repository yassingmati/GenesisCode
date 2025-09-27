// src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexte d'authentification (assure-toi que ce fichier exporte useAuth + AuthProvider)
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AuthGuard from './components/AuthGuard';

// Pages Client (assure-toi que ces fichiers existent)
import Home from './pages/Home';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import CompleteProfile from './pages/CompleteProfile';
import VerifyEmailReminder from './pages/VerifyEmailReminder';
import VerifiedSuccess from './pages/VerifiedSuccess';
import DashboardClient from './pages/dashboardClient/DashboardPage';

// Pages de cours (3 pages séparées)
import DebutantMap from './pages/course/DebutantMap';
import LevelPage from './pages/course/LevelPage';
import ExercisePage from './pages/course/ExercisePage';

// Subscription / Payment client pages
import Plans from './pages/Plans';
import MySubscriptions from './pages/subscriptions/MySubscriptions';
import PaymentReturn from './pages/PaymentReturn';

// Pages Admin & Layout
import AdminLogin from './admin/pages/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import UserManagement from './admin/pages/UserManagement';
import CourseManagement from './admin/pages/CourseManagement';
import PaymentManagement from './admin/pages/PaymentManagement';
import SubscriptionManagement from './admin/pages/SubscriptionManagement';

// Styles globaux
const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #F7F9FC;
    --primary: #4A90E2;
    --secondary: #50E3C2;
    --accent: #F5A623;
    --cta: #7B61FF;
    --text: #333333;
    --radius: 0.75rem;
    --transition: 0.3s ease;
    --shadow: 0 4px 20px rgba(0,0,0,0.08);
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body, #root {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    overflow-x: hidden;
    min-height: 100vh;
  }

  a { text-decoration: none; color: inherit; }
  button {
    cursor: pointer;
    font-family: inherit;
    border: none;
    background: none;
  }
  input, textarea, select { font-family: inherit; }
  img { max-width: 100%; height: auto; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0); } }
`;

/**
 * PrivateRoute - wrapper simple qui redirige si utilisateur non authentifié
 * role: 'client' | 'admin'
 */
function PrivateRoute({ children, role }) {
  const { currentUser, admin } = useAuth();

  if (role === 'client' && !currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (role === 'admin' && !admin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

/**
 * PageTitleUpdater - met à jour document.title avec prise en charge des routes paramétrées
 */
function PageTitleUpdater() {
  const location = useLocation();

  React.useEffect(() => {
    const p = location.pathname;

    if (p === '/') document.title = 'Accueil';
    else if (p === '/login') document.title = 'Connexion';
    else if (p === '/register') document.title = 'Inscription';
    else if (p === '/complete-profile') document.title = 'Compléter le profil';
    else if (p === '/verify-email-reminder') document.title = 'Vérifier votre email';
    else if (p === '/verified-success') document.title = 'Email vérifié';
    else if (p === '/plans') document.title = 'Offres & Abonnements';
    else if (p === '/subscriptions') document.title = 'Mes abonnements';
    else if (p.startsWith('/payments/konnect-return')) document.title = 'Retour paiement';
    else if (p.startsWith('/admin/login')) document.title = 'Admin – Connexion';
    else if (p.startsWith('/admin')) document.title = 'Admin – Tableau de bord';
    // Course pages
    else if (p === '/cours') document.title = 'Parcours';
    else if (p.startsWith('/cours/level/') && p.includes('/exercises')) document.title = 'Exercices — Niveau';
    else if (p.startsWith('/cours/level/')) document.title = 'Leçon — Niveau';
    else if (p.startsWith('/dashboard')) document.title = 'Tableau de bord';
    else document.title = 'Plateforme';
  }, [location]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <GlobalStyle />
        <Router>
          <ToastContainer position="top-right" newestOnTop autoClose={4000} />
          <PageTitleUpdater />

          <Routes>
          {/* CLIENT PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/verify-email-reminder" element={<VerifyEmailReminder />} />
          <Route path="/cours" element={
            <AuthGuard>
              <DebutantMap />
            </AuthGuard>
          } />
          <Route path="/cours/level/:levelId" element={
            <AuthGuard>
              <LevelPage />
            </AuthGuard>
          } />
          <Route path="/cours/level/:levelId/exercises" element={
            <AuthGuard>
              <ExercisePage />
            </AuthGuard>
          } />
          <Route path="/verified-success" element={<VerifiedSuccess />} />

          {/* Subscription / Payment client pages */}
          <Route path="/plans" element={<Plans />} />
          <Route path="/subscriptions" element={<MySubscriptions />} />
          <Route path="/payments/konnect-return" element={<PaymentReturn />} />

          {/* CLIENT PRIVATE */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute role="client">
                <DashboardClient />
              </PrivateRoute>
            }
          />

          {/* ADMIN PUBLIC */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ADMIN PRIVATE - nested admin routes (AdminLayout doit rendre <Outlet /> ) */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute role="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="Subscription" element={<SubscriptionManagement />} />
          </Route>

          {/* 404 - redirige vers l'accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
