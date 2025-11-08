# ✅ Checklist de Déploiement Firebase

Utilisez cette checklist pour suivre votre progression.

## 📋 Préparation

- [ ] Firebase CLI installé (`npm install -g firebase-tools`)
- [ ] Connecté à Firebase (`firebase login`)
- [ ] Projet Firebase créé sur [Firebase Console](https://console.firebase.google.com/)
- [ ] Firebase initialisé dans le projet (`firebase init`)
  - [ ] Hosting configuré
  - [ ] Functions configurées
  - [ ] Dossier public : `frontend/build`
  - [ ] Single-page app : Oui

## 🗄️ Base de Données

- [ ] Compte MongoDB Atlas créé
- [ ] Cluster MongoDB créé (plan M0 gratuit)
- [ ] Network Access configuré (0.0.0.0/0)
- [ ] Utilisateur de base de données créé
- [ ] Chaîne de connexion MongoDB récupérée

## 🔐 Configuration

- [ ] Variables d'environnement configurées dans Firebase :
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `JWT_ADMIN_SECRET`
  - [ ] `CLIENT_ORIGIN`
  - [ ] `NODE_ENV=production`
- [ ] Fichier `frontend/.env.production` créé avec :
  - [ ] `REACT_APP_API_BASE_URL` pointant vers Firebase Functions

## 📦 Installation

- [ ] Dépendances backend installées (`cd backend && npm install`)
- [ ] Dépendances frontend installées (`cd frontend && npm install`)
- [ ] Dépendances Firebase Functions installées (`cd backend/functions && npm install`)

## 🏗️ Construction

- [ ] Frontend construit (`cd frontend && npm run build`)
- [ ] Dossier `frontend/build` créé et contient les fichiers

## 🚀 Déploiement

- [ ] Déploiement testé en local (optionnel)
- [ ] Frontend déployé (`firebase deploy --only hosting`)
- [ ] Backend déployé (`firebase deploy --only functions`)
- [ ] Ou déploiement complet (`firebase deploy`)

## ✅ Vérification

- [ ] Frontend accessible : `https://votre-projet-id.web.app`
- [ ] API health check fonctionne : 
  ```bash
  curl https://us-central1-votre-projet-id.cloudfunctions.net/api/health
  ```
- [ ] Logs Firebase Functions vérifiés (`firebase functions:log`)
- [ ] Pas d'erreurs CORS
- [ ] Connexion MongoDB fonctionne
- [ ] Authentification fonctionne
- [ ] Routes API fonctionnent

## 🔧 Post-Déploiement

- [ ] CORS configuré correctement
- [ ] Variables d'environnement vérifiées
- [ ] Domaines personnalisés configurés (optionnel)
- [ ] Firebase Storage configuré pour les fichiers (optionnel)
- [ ] Analytics activé (optionnel)

## 📝 Notes

**Date de déploiement :** _______________

**URL Frontend :** https://_______________.web.app

**URL API :** https://us-central1-_______________.cloudfunctions.net/api

**Projet Firebase :** _______________

**MongoDB Cluster :** _______________

---

**Statut :** ⬜ En attente | 🔄 En cours | ✅ Terminé | ❌ Erreur

