# Correction du Problème Render - Module Not Found

## Problème

L'erreur `Cannot find module 'cookie-parser'` indique que les dépendances ne sont pas installées au bon endroit.

## Solution

Le problème vient de la configuration du Root Directory. Render installe les dépendances mais elles ne sont pas trouvées au moment de l'exécution.

### Option 1: Corriger la Configuration Render (Recommandé)

Dans le dashboard Render, modifier la configuration:

1. **Root Directory:** Laisser vide ou mettre `.` (point)
2. **Build Command:** `cd backend && npm install`
3. **Start Command:** `cd backend && npm start`

### Option 2: Utiliser un script de build

Créer un script qui s'assure que tout est au bon endroit.

## Étapes de Correction

### Dans le Dashboard Render:

1. Aller dans les **Settings** du service
2. Modifier les champs suivants:

   **Root Directory:**
   - Laisser vide (pas de valeur)
   - OU mettre: `.` (point)

   **Build Command:**
   ```
   cd backend && npm install
   ```

   **Start Command:**
   ```
   cd backend && npm start
   ```

3. Sauvegarder les changements
4. Render redéploiera automatiquement

### Alternative: Créer un script de build

Si la solution ci-dessus ne fonctionne pas, créer un script de build à la racine du projet.

