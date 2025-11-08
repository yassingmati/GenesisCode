# 🔧 Solution Rapide : Réinitialiser Firebase Init

## ❌ Problème

Le fichier `.firebaserc` référence un projet `codegenesis-platform` qui n'existe pas encore.

## ✅ Solution : Supprimer .firebaserc Temporairement

Supprimez le fichier `.firebaserc` pour permettre à Firebase de créer un nouveau projet ou de sélectionner un projet existant.

### Étape 1 : Supprimer .firebaserc

```powershell
Remove-Item .firebaserc
```

### Étape 2 : Réinitialiser Firebase

```powershell
npx firebase-tools init
```

### Étape 3 : Lors de l'Initialisation

1. **Sélectionner les fonctionnalités** :
   - ✅ **Hosting** : Set up deployments for static web apps
   - ✅ **Functions** : Configure a Cloud Functions directory

2. **Créer un nouveau projet** :
   - Sélectionner **"Create a new project"** ou **"Créer un nouveau projet"**
   - Entrer le nom : `codegenesis-platform`
   - Firebase va créer le projet automatiquement

3. **OU utiliser un projet existant** :
   - Sélectionner **"Use an existing project"**
   - Choisir un projet dans la liste

4. **Configuration** :
   - Dossier public : `frontend/build`
   - Single-page app : **Oui**
   - Functions : **Oui**
   - Runtime : **Node.js 18**

## 🔄 Alternative : Créer le Projet d'Abord sur Firebase Console

Si vous préférez créer le projet manuellement :

1. **Aller sur Firebase Console** : https://console.firebase.google.com/
2. **Créer le projet** `codegenesis-platform`
3. **Puis réinitialiser** :
   ```powershell
   Remove-Item .firebaserc
   npx firebase-tools init
   ```
   - Sélectionner **"Use an existing project"**
   - Choisir `codegenesis-platform`

---

**Solution la plus rapide :** Supprimez `.firebaserc` et laissez Firebase créer le projet automatiquement lors de `init`.

