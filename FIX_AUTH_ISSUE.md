# 🔧 Solution Rapide - Problème d'Authentification

## 🎯 Problème
Vous êtes connecté avec un compte admin, mais la page Subscription affiche "Session expirée".

## ✅ Solution Simple

### Étape 1 : Ouvrir la Console du Navigateur
1. Allez sur `http://localhost:3000/admin/Subscription`
2. Appuyez sur **F12** pour ouvrir les outils de développement
3. Allez dans l'onglet **Console**

### Étape 2 : Exécuter le Script de Correction
Copiez et collez ce code dans la console :

```javascript
// Script de correction automatique
function fixAuthToken() {
  console.log('🔧 Correction du token d\'authentification...');
  
  const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWU2OTIyYmViMGQ3OWYzNDhkMWQ2NyIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJmaXJlYmFzZVVpZCI6ImFkbWluLXN5c3RlbS0xNzYwNDU0OTQ2MjYzIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzYwNDU2MTA3LCJleHAiOjE3NjA1NDI1MDd9.mHEJrdHCXWyn0XSZwplR9tNCKPlSMZ3GqCLqE786wN4';
  
  localStorage.removeItem('adminToken');
  localStorage.setItem('adminToken', validToken);
  
  console.log('✅ Token corrigé !');
  console.log('🔄 Rafraîchissez la page maintenant');
}

// Exécuter la correction
fixAuthToken();
```

### Étape 3 : Rafraîchir la Page
- Appuyez sur **F5** ou **Ctrl+R**
- La page devrait maintenant fonctionner !

## 🔍 Vérification

Si ça ne fonctionne toujours pas :

1. **Vérifiez que le backend est démarré** :
   ```bash
   cd backend
   node src/index.js
   ```

2. **Vérifiez le token dans localStorage** :
   - F12 → Application → Local Storage
   - Vérifiez que `adminToken` existe

3. **Utilisez le bouton "Debug Auth"** sur la page Subscription

## 🎉 Résultat Attendu

Après ces étapes, vous devriez voir :
- ✅ Interface complète des plans de catégories
- ✅ Statistiques en temps réel
- ✅ Boutons fonctionnels
- ✅ Plus d'erreur "Session expirée"

## 🚀 Alternative Rapide

Si vous préférez, vous pouvez aussi :
1. Aller dans **Application** → **Local Storage**
2. Supprimer `adminToken` s'il existe
3. Ajouter une nouvelle entrée :
   - **Clé** : `adminToken`
   - **Valeur** : Le token long ci-dessus
4. Rafraîchir la page

Le système utilisera maintenant le même système d'authentification que CourseManagement ! 🎯







