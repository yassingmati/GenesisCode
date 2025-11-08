# Solution Fonctionnelle - Render cookie-parser

## Le Problème

Render installe les packages mais Node.js ne les trouve pas. Cela peut arriver si les node_modules ne sont pas au bon endroit ou si npm install ne fonctionne pas correctement.

## Solution qui Fonctionne

### Configuration Render

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
cd backend && npm install && npm install cookie-parser --save --force && node -e "require('cookie-parser'); console.log('✅ cookie-parser OK')" && npm start
```

Cette commande:
1. Installe toutes les dépendances
2. Installe cookie-parser explicitement avec --force
3. Vérifie que cookie-parser peut être chargé
4. Démarre le serveur seulement si cookie-parser fonctionne

## Solution Alternative (Plus Simple)

**Start Command:**
```
cd backend && npm install cookie-parser express mongoose cors dotenv bcryptjs jsonwebtoken helmet morgan compression multer nodemailer winston joi axios express-rate-limit firebase-admin --save && npm start
```

Cette commande installe tous les packages essentiels explicitement avant de démarrer.

## Solution avec npm ci (Recommandée)

**Start Command:**
```
cd backend && rm -rf node_modules && npm ci --production=false && npm start
```

`npm ci` est plus fiable que `npm install` car il installe exactement ce qui est dans package-lock.json.

## Solution de Debug (Pour Comprendre le Problème)

**Start Command:**
```
cd backend && pwd && ls -la && npm install 2>&1 | tail -20 && ls -la node_modules/cookie-parser 2>&1 && npm start
```

Cela affichera:
- Le répertoire de travail
- Les fichiers présents
- Les dernières lignes de npm install
- Si cookie-parser existe
- Puis démarrera le serveur

## Solution Définitive (À Essayer en Premier)

**Start Command:**
```
cd /opt/render/project/src/backend && npm install --production=false && NODE_PATH=/opt/render/project/src/backend/node_modules node src/index.js
```

Cette commande:
1. Va directement au bon répertoire
2. Installe les dépendances
3. Définit NODE_PATH pour que Node.js trouve les modules
4. Démarre le serveur

---

**Essayez la solution "npm ci" en premier, c'est la plus fiable!** 🚀

