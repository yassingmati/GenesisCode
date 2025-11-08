# Correction - Render utilise npm run dev au lieu de npm start

## Le Problème

Render essaie d'exécuter `npm run dev` qui utilise `nodemon` (dans devDependencies), mais les devDependencies ne sont pas installées en production.

## Solution

### Dans Render Settings, modifier:

**Root Directory:**
```
(VIDE)
```

**Build Command:**
```
echo "Build step"
```

**Start Command:**
```
cd backend && npm ci --production=false && npm start
```

**IMPORTANT:** Assurez-vous que le Start Command utilise `npm start` et NON `npm run dev`.

## Vérification

Après modification, les logs devraient montrer:
- ✅ `npm ci --production=false` (installe toutes les dépendances)
- ✅ `npm start` (pas `npm run dev`)
- ✅ Le serveur démarre avec `node src/index.js`

## Si Render continue à utiliser npm run dev

Vérifier dans Render Settings:
1. Le champ "Start Command" doit être exactement: `cd backend && npm ci --production=false && npm start`
2. Ne pas utiliser "npm run dev" ou "nodemon"
3. Sauvegarder les changements

## Alternative: Modifier package.json

Si Render continue à utiliser `npm run dev`, on peut modifier temporairement le script dev dans package.json, mais c'est mieux de corriger la configuration Render.

---

**Modifiez le Start Command dans Render pour utiliser `npm start`!** 🚀

