# Correction Configuration Render - Instructions Détaillées

## Problème Actuel

L'erreur `Cannot find module 'cookie-parser'` indique que Render ne trouve pas les modules Node.js installés.

## Solution Immédiate

### Dans le Dashboard Render:

1. **Aller dans Settings** de votre service `codegenesis-backend`

2. **Modifier la configuration suivante:**

   **Root Directory:**
   ```
   (laisser vide - pas de valeur)
   ```

   **Build Command:**
   ```
   cd backend && npm install
   ```

   **Start Command:**
   ```
   cd backend && npm start
   ```

3. **Sauvegarder** les changements

4. Render redéploiera automatiquement

## Explication

Le problème vient du fait que:
- Render clone le repository dans `/opt/render/project/src/`
- Si Root Directory est `backend`, Render cherche dans `/opt/render/project/src/backend`
- Mais les dépendances doivent être installées dans ce répertoire
- En utilisant `cd backend && npm install`, on s'assure que les dépendances sont installées au bon endroit

## Vérification

Après le redéploiement, vérifier les logs:
- Vous devriez voir "Installing dependencies..." dans le répertoire backend
- Les modules devraient être trouvés correctement

## Si le Problème Persiste

### Option Alternative: Créer un package.json à la racine

Si la solution ci-dessus ne fonctionne pas, on peut créer un `package.json` à la racine qui gère le build.

Mais d'abord, essayez la solution ci-dessus - elle devrait fonctionner.

