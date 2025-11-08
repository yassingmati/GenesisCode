# 📋 Commandes Firebase pour CodeGenesis

## 🔐 Authentification

```powershell
# Se connecter à Firebase
npx firebase-tools login

# OU si firebase fonctionne directement
firebase login

# Se déconnecter
npx firebase-tools logout
```

## 🚀 Initialisation

```powershell
# Initialiser Firebase dans le projet
npx firebase-tools init

# Choisir un projet Firebase
npx firebase-tools use votre-projet-id

# Lister les projets disponibles
npx firebase-tools projects:list
```

## 📦 Déploiement

```powershell
# Déployer tout (hosting + functions)
npx firebase-tools deploy

# Déployer uniquement le frontend (hosting)
npx firebase-tools deploy --only hosting

# Déployer uniquement le backend (functions)
npx firebase-tools deploy --only functions

# Déployer une fonction spécifique
npx firebase-tools deploy --only functions:api
```

## 🔧 Configuration

```powershell
# Définir un secret (recommandé)
npx firebase-tools functions:secrets:set MONGODB_URI
npx firebase-tools functions:secrets:set JWT_SECRET
npx firebase-tools functions:secrets:set JWT_ADMIN_SECRET

# Lister les secrets
npx firebase-tools functions:secrets:access MONGODB_URI

# Supprimer un secret
npx firebase-tools functions:secrets:delete MONGODB_URI

# Définir les configs (alternative)
npx firebase-tools functions:config:set \
  mongodb.uri="mongodb+srv://..." \
  jwt.secret="..." \
  client.origin="https://your-project.web.app"

# Lister les configs
npx firebase-tools functions:config:get
```

## 📊 Logs et Monitoring

```powershell
# Voir les logs des functions
npx firebase-tools functions:log

# Voir les logs d'une fonction spécifique
npx firebase-tools functions:log --only api

# Voir les logs en temps réel
npx firebase-tools functions:log --follow

# Ouvrir Firebase Console dans le navigateur
npx firebase-tools open
```

## 🧪 Tests Locaux

```powershell
# Démarrer l'émulateur Firebase
npx firebase-tools emulators:start

# Démarrer uniquement l'émulateur Functions
npx firebase-tools emulators:start --only functions

# Démarrer uniquement l'émulateur Hosting
npx firebase-tools emulators:start --only hosting
```

## 📝 Scripts NPM (Racine du Projet)

```bash
# Construire le frontend
npm run build

# Déployer tout
npm run deploy:all

# Déployer uniquement le hosting
npm run deploy:hosting

# Déployer uniquement les functions
npm run deploy:functions
```

## 🔍 Vérification

```powershell
# Vérifier la version de Firebase CLI
npx firebase-tools --version

# Vérifier la configuration actuelle
npx firebase-tools projects:list

# Vérifier l'état du déploiement
npx firebase-tools hosting:channel:list
```

## 🐛 Dépannage

```powershell
# Voir les logs d'erreur
npx firebase-tools functions:log --only api | Select-String "error"

# Vérifier les variables d'environnement
npx firebase-tools functions:config:get

# Tester la connexion Firebase
npx firebase-tools login --no-localhost
```

## 📚 Aide

```powershell
# Aide générale
npx firebase-tools --help

# Aide pour une commande spécifique
npx firebase-tools deploy --help
npx firebase-tools functions:log --help
```

---

**Note :** Remplacez `npx firebase-tools` par `firebase` si vous avez résolu le problème PowerShell.

