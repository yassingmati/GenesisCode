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

// Contexte d'authentification
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AuthGuard from './components/AuthGuard';

// Pages Client
import Home from './pages/Home';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import CompleteProfile from './pages/CompleteProfile';
import VerifyEmailReminder from './pages/VerifyEmailReminder';
import VerifiedSuccess from './pages/VerifiedSuccess';
import DashboardClient from './pages/dashboard/DashboardPage';

// Pages de cours - NOUVEAU ROUTAGE
import DebutantMap from './pages/course/DebutantMap';
import LevelPage from './pages/course/LevelPage';
import ExercisePage from './pages/course/ExercisePage';
import SingleExercisePage from './pages/course/SingleExercisePage';
import TestExerciseInterface from './components/TestExerciseInterface';

// Subscription / Payment client pages
import Plans from './pages/Plans';
import MySubscriptions from './pages/subscriptions/MySubscriptions';
import PaymentReturn from './pages/PaymentReturn';

// Pages Admin & Layout
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import SubscriptionManagement from './pages/admin/SubscriptionManagement';

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
    
    // NOUVEAU ROUTAGE - Pages de cours
    else if (p === '/courses') document.title = 'Parcours';
    else if (p.startsWith('/courses/levels/') && p.includes('/exercises/')) document.title = 'Exercice — Pratique';
    else if (p.startsWith('/courses/levels/') && p.includes('/exercises')) document.title = 'Exercices — Niveau';
    else if (p.startsWith('/courses/levels/')) document.title = 'Leçon — Niveau';
    else if (p.startsWith('/dashboard')) document.title = 'Tableau de bord';
    else document.title = 'Plateforme';
  }, [location]);

  return null;
}

export default function AppRouter() {
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
            <Route path="/verified-success" element={<VerifiedSuccess />} />

            {/* NOUVEAU ROUTAGE - Pages de cours */}
            <Route path="/courses" element={
              <AuthGuard>
                <DebutantMap />
              </AuthGuard>
            } />
            
            {/* Niveau - Page principale avec contenu et exercices */}
            <Route path="/courses/levels/:levelId" element={
              <AuthGuard>
                <LevelPage />
              </AuthGuard>
            } />
            
            {/* Liste des exercices du niveau */}
            <Route path="/courses/levels/:levelId/exercises" element={
              <AuthGuard>
                <ExercisePage />
              </AuthGuard>
            } />
            
            {/* Exercice individuel */}
            <Route path="/courses/levels/:levelId/exercises/:exerciseId" element={
              <AuthGuard>
                <SingleExercisePage />
              </AuthGuard>
            } />

            {/* Test d'exercice (pour développement) */}
            <Route path="/test-exercise" element={<TestExerciseInterface />} />

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

            {/* ADMIN PRIVATE - nested admin routes */}
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

