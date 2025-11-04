import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { app } from '../firebaseConfig';

const auth = getAuth(app);

// 1) Création du contexte
const AuthContext = createContext();

// 2) Provider
export function AuthProvider({ children }) {
  // Firebase user (client)
  const [currentUser, setCurrentUser] = useState(null);

  // Admin JWT + données - Charger depuis localStorage au démarrage
  const [admin, setAdmin] = useState(() => {
    try {
      const adminData = localStorage.getItem('adminData');
      return adminData ? JSON.parse(adminData) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('adminToken') || null;
  });

  // Loading initial state
  const [loading, setLoading] = useState(true);

  // Surveille l'état Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Vérifie aussi les utilisateurs connectés via l'API backend
  useEffect(() => {
    const checkBackendAuth = () => {
      try {
        const backendToken = localStorage.getItem('token');
        const backendUser = localStorage.getItem('user');
        
        if (backendToken && backendUser) {
          const userData = JSON.parse(backendUser);
          // Créer un objet utilisateur compatible avec Firebase
          const mockFirebaseUser = {
            uid: userData._id || userData.id,
            email: userData.email,
            displayName: userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}` 
              : userData.email,
            emailVerified: userData.isVerified || false,
            // Ajouter les données personnalisées
            ...userData
          };
          
          if (!currentUser) {
            setCurrentUser(mockFirebaseUser);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification backend:', error);
      }
    };

    // Vérifier immédiatement
    checkBackendAuth();

    // Vérifier périodiquement (toutes les 5 secondes)
    const interval = setInterval(checkBackendAuth, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Persistance du token/admin dans le localStorage
  useEffect(() => {
    if (token)      localStorage.setItem('adminToken', token);
    else            localStorage.removeItem('adminToken');
  }, [token]);

  useEffect(() => {
    if (admin)      localStorage.setItem('adminData', JSON.stringify(admin));
    else            localStorage.removeItem('adminData');
  }, [admin]);

  // Méthodes Firebase (optionnelles)
  const signup       = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
  const loginClient  = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const logoutClient = () => {
    // Déconnexion Firebase
    firebaseSignOut(auth);
    // Déconnexion API backend
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };
  const resetPassword= (email)       => sendPasswordResetEmail(auth, email);

  // Méthodes JWT/admin seront appelées dans vos services API
  // (on ne les définit pas ici, mais on expose setAdmin/setToken)

  const value = {
    // Firebase client
    currentUser,
    signup,
    loginClient,
    logoutClient,
    resetPassword,

    // Admin JWT
    admin,
    setAdmin,
    token,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      { !loading && children }
    </AuthContext.Provider>
  );
}

// 3) Hook pour consommer
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
