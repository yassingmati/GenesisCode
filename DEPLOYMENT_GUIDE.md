# Guide de Déploiement - Corrections Upload Vidéo/PDF

## 📋 Résumé des corrections

Les corrections suivantes ont été appliquées :
- ✅ Support des formats ancien (`pdf`/`video`) et nouveau (`pdfs`/`videos`)
- ✅ Normalisation des chemins Windows (backslashes → slashes)
- ✅ Utilisation des endpoints API avec authentification
- ✅ Ajout du token dans l'URL pour les éléments `<video>` et `<iframe>`
- ✅ Logs de debug pour le diagnostic

## 🚀 Déploiement Firebase Hosting (Frontend)

### Option 1 : Script automatique (PowerShell)
```powershell
.\deploy.ps1
```

### Option 2 : Commandes manuelles
```powershell
# 1. Build du frontend
cd frontend
npm run build
cd ..

# 2. Déployer sur Firebase Hosting
firebase deploy --only hosting
```

### Option 3 : Script npm
```powershell
npm run deploy:hosting
```

## 🔧 Déploiement Render (Backend)

### Méthode 1 : Déploiement automatique via Git (Recommandé)

1. **Commit et push des changements :**
```powershell
git add .
git commit -m "Fix: Upload et récupération de vidéos/PDFs - Support formats ancien/nouveau, normalisation chemins Windows, endpoints API avec auth"
git push origin main
```

2. **Render détectera automatiquement les changements** et redéploiera le backend

### Méthode 2 : Déploiement manuel

1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service backend
3. Cliquez sur "Manual Deploy" → "Deploy latest commit"

## 📝 Fichiers modifiés à déployer

### Frontend
- `frontend/src/pages/course/LevelPage.jsx` - Support formats ancien/nouveau, endpoints API

### Backend
- `backend/src/controllers/CourseController.js` - Support formats ancien/nouveau, normalisation chemins, logs debug
- `backend/src/middlewares/flexibleAuthMiddleware.js` - Support token dans query params (déjà présent)

## ✅ Vérification après déploiement

1. **Frontend (Firebase Hosting)**
   - Vérifiez que la page se charge : https://codegenesis-platform.web.app
   - Testez l'upload de vidéo/PDF via l'interface admin
   - Vérifiez l'affichage des vidéos/PDFs dans LevelPage

2. **Backend (Render)**
   - Vérifiez les logs : https://dashboard.render.com
   - Testez les endpoints API :
     - `GET /api/courses/levels/:levelId/video?lang=fr&token=...`
     - `GET /api/courses/levels/:levelId/pdf?lang=fr&token=...`

## 🔍 En cas de problème

1. **Vérifiez les logs Render** pour les erreurs backend
2. **Vérifiez la console du navigateur** pour les erreurs frontend
3. **Vérifiez que les variables d'environnement** sont correctement configurées sur Render
4. **Vérifiez que les fichiers uploadés** existent dans `backend/src/uploads/`

## 📞 Support

Si vous rencontrez des problèmes :
- Vérifiez les logs dans la console du navigateur (F12)
- Vérifiez les logs Render dans le dashboard
- Les logs de debug dans le backend indiqueront les chemins recherchés
