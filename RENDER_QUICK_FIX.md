# Correction Rapide - Render Configuration

## Problème
`Cannot find module 'cookie-parser'` - Les dépendances ne sont pas trouvées.

## Solution Immédiate

### Dans le Dashboard Render:

1. **Aller dans Settings** de votre service

2. **Modifier ces champs:**

   **Root Directory:**
   ```
   (LAISSER VIDE - supprimer "backend")
   ```

   **Build Command:**
   ```
   cd backend && npm install
   ```

   **Start Command:**
   ```
   cd backend && npm start
   ```

3. **Sauvegarder** - Render redéploiera automatiquement

## Pourquoi ça fonctionne

- Avec Root Directory vide, Render part de la racine du repo
- `cd backend && npm install` installe les dépendances dans `backend/node_modules`
- `cd backend && npm start` démarre depuis le bon répertoire où se trouvent les modules

## Vérification

Après le redéploiement, les logs devraient montrer:
- ✅ Installation des dépendances dans `backend/`
- ✅ Démarrage réussi du serveur
- ✅ Pas d'erreur "Cannot find module"

---

**Faites cette modification dans Render maintenant et le déploiement devrait fonctionner!** 🚀

