# Analyse de la Page de Login

## Date: 2025-01-XX

## 📋 Structure Actuelle

### Composant Principal
- **Fichier**: `frontend/src/pages/auth/auth.jsx`
- **Composant**: `Auth` avec prop `type` ('login' ou 'register')
- **Export**: `LoginPage` et `RegisterPage`

### Fonctionnalités Existantes

#### 1. **Formulaire de Connexion**
- ✅ Champ email avec validation
- ✅ Champ mot de passe avec toggle visibilité
- ✅ Checkbox "Se souvenir de moi"
- ✅ Lien "Mot de passe oublié ?" (ligne 395) - **Pointe vers `/forgot-password` mais la page n'existe pas encore**
- ✅ Bouton de connexion avec état de chargement

#### 2. **Formulaire d'Inscription**
- ✅ Champ email avec validation
- ✅ Champ mot de passe avec toggle visibilité
- ✅ Champ confirmation mot de passe
- ✅ Sélection du type d'utilisateur (Étudiant/Parent)
- ✅ Bouton d'inscription avec état de chargement

#### 3. **Authentification Google**
- ✅ Bouton "Se connecter avec Google"
- ✅ Gestion des erreurs Firebase Auth
- ✅ Redirection après connexion

#### 4. **Gestion d'Erreurs**
- ✅ Affichage des erreurs de validation
- ✅ Affichage des erreurs API
- ✅ Messages de succès

### Points d'Amélioration Identifiés

1. **❌ Fonctionnalité "Mot de passe oublié" manquante**
   - Le lien existe (ligne 395) mais pointe vers une route inexistante
   - Pas de page `ForgotPassword.jsx`
   - Pas de page `ResetPassword.jsx`
   - Pas de routes backend pour gérer le reset

2. **❌ Backend ne gère pas le reset de mot de passe**
   - Pas de route `/api/auth/forgot-password`
   - Pas de route `/api/auth/reset-password`
   - Pas de service email pour envoyer les liens de reset

3. **⚠️ Gestion du mot de passe**
   - Le modèle User n'a pas de champ `password`
   - L'authentification utilise Firebase Auth ou accepte n'importe quel mot de passe (mode simple)
   - Besoin de clarifier la stratégie de stockage des mots de passe

## 🎯 Plan d'Implémentation

### Backend

1. **Créer un modèle PasswordResetToken**
   - Stocker les tokens de réinitialisation
   - Lier à un utilisateur
   - Date d'expiration (1 heure)

2. **Ajouter les routes**
   - `POST /api/auth/forgot-password` - Demander un reset
   - `POST /api/auth/reset-password` - Réinitialiser avec token

3. **Créer les fonctions dans authController**
   - `forgotPassword` - Générer token et envoyer email
   - `resetPassword` - Vérifier token et mettre à jour le mot de passe

4. **Améliorer le service email**
   - Fonction pour envoyer les emails de reset
   - Template HTML pour l'email

### Frontend

1. **Créer ForgotPassword.jsx**
   - Formulaire avec champ email
   - Validation
   - Envoi de la demande
   - Message de confirmation

2. **Créer ResetPassword.jsx**
   - Formulaire avec nouveau mot de passe et confirmation
   - Validation du token depuis l'URL
   - Soumission du nouveau mot de passe
   - Redirection après succès

3. **Ajouter les routes dans AppRouter.jsx**
   - `/forgot-password` → `ForgotPassword`
   - `/reset-password/:token` → `ResetPassword`

4. **Améliorer la page de login**
   - Vérifier que le lien fonctionne correctement
   - Ajouter un message de confirmation si nécessaire

## 📝 Notes Techniques

### Gestion du Mot de Passe

**Option 1: Utiliser Firebase Auth**
- Avantage: Sécurité intégrée, pas de stockage local
- Inconvénient: Dépendance à Firebase

**Option 2: Stocker le hash dans MongoDB**
- Avantage: Indépendant de Firebase
- Inconvénient: Nécessite d'ajouter un champ `password` au modèle User

**Option 3: Solution hybride**
- Si Firebase disponible → utiliser Firebase Auth
- Sinon → stocker le hash dans MongoDB

**Recommandation**: Option 3 (hybride) pour compatibilité maximale.

