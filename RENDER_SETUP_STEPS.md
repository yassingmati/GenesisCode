# Guide Étape par Étape - Configuration Render

## Étape 1: Créer un Web Service

Sur la page "Create a new Service", cliquez sur:
**"New Web Service →"** (la carte avec l'icône globe et réseau)

## Étape 2: Connecter le Repository

1. **Connect GitHub account** (si pas déjà connecté)
2. Sélectionner le repository: **CodeGenesis**
3. Cliquer sur **"Connect"**

## Étape 3: Configurer le Service

Remplir les champs suivants:

### Informations de base
- **Name:** `codegenesis-backend`
- **Region:** Choisir la région la plus proche (ex: `Oregon (US West)`)
- **Branch:** `main` (ou votre branche principale)
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Plan
- **Plan:** `Free` (pour commencer)

## Étape 4: Configurer les Variables d'Environnement

Dans la section "Environment Variables", ajouter les variables suivantes:

Cliquer sur **"Add Environment Variable"** pour chaque variable:

1. **MONGODB_URI**
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0`

2. **JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: `b1c3a42a9367c4b83fe7633960c483a260c267a7bb2a3654541c0e2802c66d31`

3. **JWT_ADMIN_SECRET**
   - Key: `JWT_ADMIN_SECRET`
   - Value: `e5ed7a6e618a35a514ebe6bbbe8788f21b9f024aa3493bbbb4d40d1a37e5b7c8`

4. **CLIENT_ORIGIN**
   - Key: `CLIENT_ORIGIN`
   - Value: `https://codegenesis-platform.web.app`

5. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

6. **PORT**
   - Key: `PORT`
   - Value: `10000`

## Étape 5: Créer le Service

1. Vérifier que toutes les informations sont correctes
2. Cliquer sur **"Create Web Service"**
3. Attendre le déploiement (5-10 minutes)

## Étape 6: Obtenir l'URL du Backend

Une fois le déploiement terminé:
1. L'URL du service sera affichée en haut de la page
2. Format: `https://codegenesis-backend.onrender.com`
3. **Copier cette URL** - vous en aurez besoin pour configurer le frontend

## Étape 7: Tester le Backend

Une fois le déploiement terminé, tester le backend:

```bash
node test-backend-deployed.js https://codegenesis-backend.onrender.com
```

Ou tester manuellement dans le navigateur:
```
https://codegenesis-backend.onrender.com/api/health
```

Vous devriez voir une réponse JSON avec le statut du backend.

## Étape 8: Configurer le Frontend

Une fois le backend testé et fonctionnel:

```bash
node configure-frontend-backend-url.js
```

Entrer l'URL du backend Render (ex: `https://codegenesis-backend.onrender.com`)

## Étape 9: Rebuild et Redéployer le Frontend

```bash
# Windows PowerShell
.\deploy-frontend.ps1

# Ou manuellement
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

## Étape 10: Tester l'Authentification

1. Ouvrir https://codegenesis-platform.web.app
2. Essayer de se connecter
3. Vérifier la console du navigateur (F12) - il ne devrait plus y avoir d'erreurs CORS

## Notes Importantes

### Service en Veille (Plan Gratuit)
- Render met les services gratuits en veille après 15 minutes d'inactivité
- La première requête après la mise en veille peut prendre 30-60 secondes
- C'est normal pour le plan gratuit

### Logs
- Pour voir les logs du service, aller dans l'onglet "Logs" sur Render
- Les logs sont utiles pour déboguer les problèmes

### Redéploiement
- Chaque push sur la branche `main` déclenchera un redéploiement automatique
- Vous pouvez aussi redéployer manuellement depuis le dashboard Render

## Dépannage

### Le service ne démarre pas
- Vérifier les logs dans l'onglet "Logs"
- Vérifier que toutes les variables d'environnement sont configurées
- Vérifier que MongoDB Atlas Network Access est configuré (0.0.0.0/0)

### Erreurs de build
- Vérifier que le Root Directory est `backend`
- Vérifier que le Build Command est `npm install`
- Vérifier que le Start Command est `npm start`

### Erreurs CORS
- Vérifier que `CLIENT_ORIGIN` est `https://codegenesis-platform.web.app`
- Vérifier que le frontend utilise la bonne URL du backend

## Prochaines Étapes

Une fois le backend déployé et testé:
1. ✅ Configurer le frontend avec l'URL du backend
2. ✅ Rebuild et redéployer le frontend
3. ✅ Tester l'authentification complète

---

**Suivez ces étapes et votre backend sera déployé sur Render en quelques minutes!** 🚀

