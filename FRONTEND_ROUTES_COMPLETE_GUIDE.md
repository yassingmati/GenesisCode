# 📋 GUIDE COMPLET - Routes Frontend et Authentification

## ✅ **État Actuel des Routes**

### 🔒 **Routes Protégées (Nécessitent Authentification)**

Toutes les routes de cours sont déjà protégées par le composant `AuthGuard` :

```javascript
// ✅ Routes correctement protégées
<Route path="/courses" element={
  <AuthGuard>
    <DebutantMap />
  </AuthGuard>
} />

<Route path="/courses/levels/:levelId" element={
  <AuthGuard>
    <LevelPage />
  </AuthGuard>
} />

<Route path="/courses/levels/:levelId/exercises" element={
  <AuthGuard>
    <ExercisePage />
  </AuthGuard>
} />

<Route path="/courses/levels/:levelId/exercises/:exerciseId" element={
  <AuthGuard>
    <SingleExercisePage />
  </AuthGuard>
} />
```

### 🌐 **Routes Publiques**

```javascript
// Routes accessibles sans authentification
<Route path="/" element={<Home />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/plans" element={<Plans />} />
<Route path="/category-plans" element={<CategoryPlans />} />
```

## 🔧 **Problèmes Identifiés et Solutions**

### ❌ **Problème 1: Token Invalide**

**Symptôme**: Erreur `403 - Abonnement requis` même pour les premiers levels

**Cause**: Le token JWT stocké dans `localStorage` est invalide ou expiré

**Solution**: 
```javascript
// Dans la console du navigateur (F12)
localStorage.setItem('token', 'NOUVEAU_TOKEN_VALIDE');
localStorage.setItem('user', JSON.stringify({
  id: 'USER_ID',
  email: 'USER_EMAIL'
}));
location.reload();
```

### ❌ **Problème 2: Requêtes Sans Token**

**Symptôme**: Erreur `401 Unauthorized` sur les requêtes API

**Cause**: Les requêtes `fetch()` n'incluent pas le token d'autorisation

**Solution Implémentée**:
- ✅ `DebutantMap.jsx` : Toutes les requêtes incluent le token
- ✅ `LevelPage.jsx` : Toutes les requêtes incluent le token
- ✅ Fonction `findLevelInAccessiblePaths` : Inclut le token

### ❌ **Problème 3: Système de Fallback**

**Symptôme**: Erreur "Niveau introuvable" pour des levels accessibles

**Cause**: Le level n'est pas accessible directement mais est accessible via le path

**Solution Implémentée**:
- ✅ Fonction `findLevelInAccessiblePaths()` pour rechercher dans les paths
- ✅ Fonction `findAccessiblePath()` pour trouver un path par défaut
- ✅ Gestion d'erreur améliorée (403 vs 404)

## 🚀 **Comment Utiliser le Système**

### **Pour un Utilisateur Existant**

1. **Se connecter normalement** via `/login`
2. **Le token est automatiquement stocké** dans `localStorage`
3. **Accéder aux cours** via `/courses`

### **Pour un Nouvel Utilisateur**

1. **S'inscrire** via `/register`
2. **Compléter le profil** via `/complete-profile`
3. **Se connecter** via `/login`
4. **Accéder aux cours** via `/courses`

### **Pour un Utilisateur de Test (Debug)**

```javascript
// Script d'injection de token
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
localStorage.setItem('user', JSON.stringify({
  id: '68f255f939d55ec4ff20c936',
  email: 'yassine1.gmatii@gmail.com'
}));
location.reload();
```

## 📊 **Architecture d'Authentification**

### **1. AuthGuard Component**

```javascript
// frontend/src/components/AuthGuard.jsx
export default function AuthGuard({ children, requireAuth = true }) {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      if (requireAuth) {
        // Vérifier Firebase Auth
        const isAuthenticated = currentUser !== null;
        
        // Vérifier Backend Auth (localStorage)
        const backendToken = localStorage.getItem('token');
        const backendUser = localStorage.getItem('user');
        const hasBackendAuth = backendToken && backendUser;

        if (!isAuthenticated && !hasBackendAuth) {
          navigate('/login', { replace: true });
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [currentUser, loading, requireAuth, navigate]);

  if (loading || isChecking) {
    return <LoadingSpinner />;
  }

  return children;
}
```

### **2. CourseAccessGuard Component**

```javascript
// frontend/src/components/CourseAccessGuard.jsx
export default function CourseAccessGuard({ pathId, levelId, children }) {
  const [access, setAccess] = useState({ hasAccess: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `/api/course-access/check/path/${pathId}/level/${levelId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAccess(data.access);
      } else {
        setAccess({ hasAccess: false, reason: 'no_access' });
      }
      
      setLoading(false);
    };

    checkAccess();
  }, [pathId, levelId]);

  if (loading) return <LoadingSpinner />;
  
  if (!access.hasAccess) {
    return <SubscriptionPrompt availablePlans={availablePlans} />;
  }

  return children;
}
```

## 🔑 **Génération de Token JWT**

### **Pour Créer un Token Valide**

```javascript
// backend/create-token-for-user.js
const jwt = require('jsonwebtoken');

const userId = 'USER_ID';
const userEmail = 'USER_EMAIL';
const secret = process.env.JWT_SECRET || 'devsecret';

const payload = {
  id: userId,
  email: userEmail,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 heures
};

const token = jwt.sign(payload, secret);
console.log('Token:', token);
```

## 📝 **Checklist de Vérification**

### **Backend**
- ✅ Routes protégées avec `protect` middleware
- ✅ `CourseAccessMiddleware` appliqué
- ✅ `CategoryAccessMiddleware` appliqué
- ✅ `JWT_SECRET` configuré (ou fallback `devsecret`)
- ✅ Premier level de chaque path débloqué

### **Frontend**
- ✅ Routes protégées avec `AuthGuard`
- ✅ Requêtes incluent le token d'autorisation
- ✅ Système de fallback pour les levels
- ✅ Gestion d'erreur améliorée (403 vs 404)
- ✅ `CourseAccessGuard` pour vérifier l'accès

### **Utilisateur**
- ✅ Token valide stocké dans `localStorage`
- ✅ Données utilisateur stockées dans `localStorage`
- ✅ Accès à la catégorie "Débutant" accordé
- ✅ Premiers levels débloqués

## 🎯 **Prochaines Étapes Recommandées**

1. **Système de Refresh Token**
   - Implémenter un refresh token pour renouveler automatiquement les tokens expirés

2. **Meilleure Gestion des Erreurs**
   - Afficher des messages d'erreur plus clairs
   - Rediriger vers `/login` si le token est expiré

3. **Déblocage Séquentiel**
   - Implémenter le déblocage automatique des levels suivants après complétion

4. **Interface de Paiement**
   - Créer une interface pour acheter des abonnements
   - Intégrer Konnect pour les paiements

5. **Tests Automatisés**
   - Créer des tests pour vérifier le bon fonctionnement de l'authentification
   - Tester les différents scénarios d'accès

## 🔗 **Liens Utiles**

- **Backend API Docs**: `http://localhost:5000/api-docs`
- **Frontend Dev**: `http://localhost:3000`
- **Login Page**: `http://localhost:3000/login`
- **Courses Page**: `http://localhost:3000/courses`
- **Plans Page**: `http://localhost:3000/category-plans`

## 📞 **Support**

Pour toute question ou problème :
1. Vérifier les logs de la console (F12)
2. Vérifier les logs du serveur backend
3. Vérifier que le token est valide et non expiré
4. Vérifier que l'accès à la catégorie est accordé
5. Vérifier que les premiers levels sont débloqués
