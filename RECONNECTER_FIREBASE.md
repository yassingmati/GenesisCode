# 🔐 Reconnexion à Firebase - Solution Rapide

## ❌ Problème Identifié

Les tokens d'authentification Firebase ont expiré (erreur 401). Il faut se reconnecter.

## ✅ Solution : Se Reconnecter

### Étape 1 : Se Déconnecter

```powershell
npx firebase-tools logout
```

### Étape 2 : Se Reconnecter

```powershell
npx firebase-tools login
```

Cela ouvrira votre navigateur pour vous authentifier à nouveau.

### Étape 3 : Vérifier la Connexion

```powershell
npx firebase-tools projects:list
```

Vous devriez voir la liste de vos projets Firebase.

## 🚀 Solution Alternative : Créer le Projet Manuellement

Si la reconnexion ne fonctionne pas, créez le projet manuellement :

### Étape 1 : Créer le Projet sur Firebase Console

1. **Aller sur Firebase Console** : https://console.firebase.google.com/
2. **Créer le projet** `codegenesis-platform`
3. **Attendre la création complète**

### Étape 2 : Configurer .firebaserc Manuellement

Créez le fichier `.firebaserc` avec votre ID de projet :

```json
{
  "projects": {
    "default": "codegenesis-platform"
  }
}
```

**Note :** Si l'ID du projet est différent (ex: `codegenesis-platform-xxxxx`), utilisez l'ID exact.

### Étape 3 : Réinitialiser Firebase

```powershell
npx firebase-tools init
```

**Cette fois, choisissez :**
- **"Create a new project"** au lieu de "Use an existing project"
- Entrez le nom : `codegenesis-platform`
- Firebase va créer le projet automatiquement

**OU si le projet existe déjà :**

1. Dans `init`, choisissez **"Use an existing project"**
2. Tapez manuellement l'ID du projet si la liste ne s'affiche pas

## 📝 Instructions Détaillées

### Option A : Reconnexion (Recommandé)

```powershell
# 1. Se déconnecter
npx firebase-tools logout

# 2. Se reconnecter (ouvrira le navigateur)
npx firebase-tools login

# 3. Vérifier
npx firebase-tools projects:list

# 4. Réinitialiser
npx firebase-tools init
```

### Option B : Création Manuelle

1. **Créer le projet sur Firebase Console**
2. **Créer `.firebaserc`** avec l'ID du projet
3. **Réinitialiser** avec `npx firebase-tools init`
4. **Choisir "Create a new project"** ou utiliser l'ID existant

## 🔍 Trouver l'ID du Projet

Sur Firebase Console :
- L'ID du projet est affiché en haut de la page
- Format : `codegenesis-platform` ou `codegenesis-platform-xxxxx`
- Cliquez sur l'icône de paramètres pour voir l'ID complet

## ⚠️ Notes Importantes

1. **Tokens Expirés** : Les tokens Firebase expirent après un certain temps
2. **Reconnexion** : Il faut se reconnecter périodiquement
3. **ID du Projet** : Utilisez l'ID exact, pas seulement le nom

## 🎯 Prochaines Étapes

Une fois reconnecté :

1. **Créer le projet** (si pas déjà fait)
2. **Initialiser Firebase** : `npx firebase-tools init`
3. **Configurer MongoDB Atlas**
4. **Configurer les variables d'environnement**
5. **Déployer**

---

**Solution Rapide :** Exécutez `npx firebase-tools logout` puis `npx firebase-tools login` pour vous reconnecter.

