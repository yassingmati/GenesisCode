# Configuration Correcte Render - À Utiliser MAINTENANT

## Configuration Exacte pour Render

### Dans Render Dashboard → Settings:

**Root Directory:**
```
(LAISSER VIDE - rien du tout)
```

**Build Command:**
```
cd backend && npm ci --production=false
```

**Start Command:**
```
cd backend && npm start
```

## Pourquoi Cette Configuration

1. **Build Command:** Installe toutes les dépendances (y compris devDependencies) avec `npm ci`
2. **Start Command:** Utilise `npm start` qui exécute `node src/index.js` (pas nodemon)
3. **Root Directory vide:** Render part de la racine du repo

## Vérification

Après avoir sauvegardé, Render redéploiera automatiquement. Les logs devraient montrer:

```
==> Running build command 'cd backend && npm ci --production=false'...
(installation des dépendances)
==> Build successful 🎉
==> Running 'cd backend && npm start'
> genesis-backend@1.0.0 start
> node src/index.js
(serveur démarre)
```

## Si Ça Ne Fonctionne Pas

Vérifier que:
1. ✅ Root Directory est VIDE (pas "backend")
2. ✅ Build Command est: `cd backend && npm ci --production=false`
3. ✅ Start Command est: `cd backend && npm start` (pas `npm run dev`)
4. ✅ Les variables d'environnement sont configurées

---

**Utilisez cette configuration exacte dans Render maintenant!** 🚀

