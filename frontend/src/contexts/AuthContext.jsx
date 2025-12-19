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

  // Vérifier immédiatement le backend auth au démarrage (avant Firebase)
  useEffect(() => {
    const checkBackendAuthOnInit = () => {
      try {
        const backendToken = localStorage.getItem('token');
        const backendUser = localStorage.getItem('user');

        if (backendToken && backendUser) {
          try {
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

            console.log('✅ Utilisateur backend trouvé dans localStorage:', mockFirebaseUser.email);
            setCurrentUser(mockFirebaseUser);
          } catch (parseError) {
            console.error('❌ Erreur lors du parsing des données utilisateur:', parseError);
            // Nettoyer les données corrompues
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification de l\'authentification backend:', error);
      }
    };

    // Vérifier immédiatement au chargement
    checkBackendAuthOnInit();
  }, []); // Exécuter une seule fois au montage

  // Surveille l'état Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      // Si un utilisateur Firebase est connecté, l'utiliser
      if (user) {
        setCurrentUser(user);
      } else {
        // Si pas d'utilisateur Firebase, vérifier le backend auth
        const backendToken = localStorage.getItem('token');
        const backendUser = localStorage.getItem('user');
        if (backendToken && backendUser && !currentUser) {
          try {
            const userData = JSON.parse(backendUser);
            const mockFirebaseUser = {
              uid: userData._id || userData.id,
              email: userData.email,
              displayName: userData.firstName && userData.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : userData.email,
              emailVerified: userData.isVerified || false,
              ...userData
            };
            setCurrentUser(mockFirebaseUser);
          } catch (e) {
            console.error('Erreur parsing user:', e);
          }
        }
      }
      // Marquer le chargement comme terminé (avec un petit délai pour laisser le temps au backend auth)
      setTimeout(() => setLoading(false), 100);
    });
    return unsubscribe;
  }, []);

  // Vérifie aussi les utilisateurs connectés via l'API backend (vérification périodique)
  useEffect(() => {
    const checkBackendAuth = () => {
      try {
        const backendToken = localStorage.getItem('token');
        const backendUser = localStorage.getItem('user');

        if (backendToken && backendUser && !currentUser) {
          try {
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

            setCurrentUser(mockFirebaseUser);
          } catch (parseError) {
            console.error('❌ Erreur lors du parsing des données utilisateur:', parseError);
          }
        } else if (!backendToken && !backendUser && currentUser && !currentUser.uid?.startsWith('firebase:')) {
          // Si le token backend a été supprimé mais qu'on a un utilisateur backend, le retirer
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification de l\'authentification backend:', error);
      }
    };

    // Vérifier périodiquement (toutes les 10 secondes)
    const interval = setInterval(checkBackendAuth, 10000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Persistance du token/admin dans le localStorage
  useEffect(() => {
    if (token) localStorage.setItem('adminToken', token);
    else localStorage.removeItem('adminToken');
  }, [token]);

  useEffect(() => {
    if (admin) localStorage.setItem('adminData', JSON.stringify(admin));
    else localStorage.removeItem('adminData');
  }, [admin]);

  // Vérifier périodiquement si le token admin est toujours valide
  useEffect(() => {
    const checkAdminToken = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');

      if (adminToken && adminData && !admin) {
        try {
          const parsedAdmin = JSON.parse(adminData);
          console.log('✅ Admin trouvé dans localStorage:', parsedAdmin.email);
          setAdmin(parsedAdmin);
          setToken(adminToken);
        } catch (e) {
          console.error('❌ Erreur parsing adminData:', e);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        }
      } else if (!adminToken && admin) {
        // Token supprimé, nettoyer l'état
        setAdmin(null);
        setToken(null);
      }
    };

    // Vérifier immédiatement
    checkAdminToken();

    // Vérifier toutes les 5 secondes
    const interval = setInterval(checkAdminToken, 5000);
    return () => clearInterval(interval);
  }, [admin]);

  // Méthodes Firebase (optionnelles)
  const signup = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
  const loginClient = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const logoutClient = () => {
    // Déconnexion Firebase
    firebaseSignOut(auth);
    // Déconnexion API backend
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
    setToken(null);
    setCurrentUser(null);
  };
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

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

    // Loading state
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3) Hook pour consommer
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
