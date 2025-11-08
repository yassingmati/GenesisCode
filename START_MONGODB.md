# Démarrer MongoDB Local - CodeGenesis

## 🔧 MongoDB Local est Installé mais Arrêté

Le service MongoDB est installé mais arrêté. Voici comment le démarrer:

### Windows

1. **Démarrer le service MongoDB**
   ```powershell
   Start-Service MongoDB
   ```

2. **Vérifier que le service est démarré**
   ```powershell
   Get-Service MongoDB
   ```
   Vous devriez voir: `Status: Running`

3. **Vérifier que MongoDB fonctionne**
   ```powershell
   # Test de connexion
   mongo --version
   ```

### Alternative: MongoDB Atlas (Recommandé)

Si vous préférez utiliser MongoDB Atlas (cloud, gratuit):
1. Suivez le guide `QUICK_MONGODB_SETUP.md`
2. Mettez à jour `backend/.env` avec l'URI MongoDB Atlas
3. Redémarrez le serveur

## ✅ Après Démarrage de MongoDB

Une fois MongoDB démarré:
1. Redémarrez le serveur backend
2. Testez avec `node test-server.js`
3. Vérifiez que le health check montre `"database": "connected"`

