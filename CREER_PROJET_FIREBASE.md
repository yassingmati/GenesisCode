# 🚀 Créer un Projet Firebase - Guide Rapide

## ⚡ Étapes Rapides

### Option 1 : Via Firebase Console (Recommandé)

1. **Aller sur Firebase Console**
   - Ouvrir : https://console.firebase.google.com/
   - Se connecter avec votre compte Google

2. **Créer le Projet**
   - Cliquer sur **"Ajouter un projet"** ou **"Add project"**
   - Nom du projet : `codegenesis-platform`
   - Cliquer sur **"Continuer"**
   - Configurer Google Analytics (optionnel)
   - Cliquer sur **"Créer le projet"**
   - Attendre quelques secondes
   - Cliquer sur **"Continuer"**

3. **Réinitialiser Firebase**
   ```powershell
   npx firebase-tools init
   ```
   - Sélectionner le projet `codegenesis-platform`
   - Choisir Hosting et Functions
   - Dossier public : `frontend/build`
   - Single-page app : **Oui**
   - Functions : **Oui**
   - Runtime : **Node.js 18**

### Option 2 : Via CLI (Si Permissions)

```powershell
# Créer le projet
npx firebase-tools projects:create codegenesis-platform

# Puis initialiser
npx firebase-tools init
```

## 📋 Checklist

- [ ] Compte Firebase créé
- [ ] Projet `codegenesis-platform` créé sur Firebase Console
- [ ] `npx firebase-tools init` exécuté avec succès
- [ ] Projet sélectionné dans l'initialisation
- [ ] Hosting et Functions configurés

## 🔍 Vérification

```powershell
# Vérifier le projet actuel
npx firebase-tools use

# Voir tous les projets
npx firebase-tools projects:list
```

## ⚠️ Si le Projet Existe Déjà

Si vous avez déjà un projet Firebase, mettez à jour `.firebaserc` :

```json
{
  "projects": {
    "default": "votre-projet-id-existant"
  }
}
```

Puis réinitialisez :
```powershell
npx firebase-tools init
```

---

**Important :** Créez d'abord le projet sur Firebase Console, puis réexécutez `npx firebase-tools init`.

