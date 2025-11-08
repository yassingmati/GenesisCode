# Vérification Variables d'Environnement Render

## ⚠️ Important

Le backend utilise `CLIENT_ORIGIN` pour la configuration CORS. Si cette variable n'est pas définie correctement dans Render, le backend utilisera `http://localhost:3000` par défaut.

## ✅ Vérifier dans Render Dashboard

1. Aller sur https://dashboard.render.com
2. Sélectionner votre service `codegenesis-backend`
3. Aller dans l'onglet **"Environment"** ou **"Environment Variables"**
4. Vérifier que ces variables existent:

### Variables Requises

```
CLIENT_ORIGIN = https://codegenesis-platform.web.app
NODE_ENV = production
MONGODB_URI = mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET = b1c3a42a9367c4b83fe7633960c483a260c267a7bb2a3654541c0e2802c66d31
JWT_ADMIN_SECRET = e5ed7a6e618a35a514ebe6bbbe8788f21b9f024aa3493bbbb4d40d1a37e5b7c8
PORT = 10000
```

## 🔧 Si CLIENT_ORIGIN n'existe pas ou est incorrect

1. Cliquer sur **"Add Environment Variable"**
2. Key: `CLIENT_ORIGIN`
3. Value: `https://codegenesis-platform.web.app`
4. Sauvegarder
5. Render redéploiera automatiquement

## 📋 Après Modification

Une fois `CLIENT_ORIGIN` corrigé:
1. Render redéploiera automatiquement
2. Vérifier les logs pour confirmer que `CLIENT_ORIGIN` est correct
3. Tester l'authentification depuis le frontend

## 🧪 Vérification dans les Logs

Après le redéploiement, les logs devraient montrer:
```
🌐 CORS - CLIENT_ORIGIN: https://codegenesis-platform.web.app
🌐 CORS - Origines autorisées: [array avec les bonnes origines]
```

Si vous voyez `http://localhost:3000`, cela signifie que `CLIENT_ORIGIN` n'est pas défini correctement dans Render.

---

**Vérifiez et corrigez CLIENT_ORIGIN dans Render maintenant!** 🚀

