# Correction Erreur Port 5000 Déjà Utilisé

## ❌ Problème

L'erreur `EADDRINUSE: address already in use :::5000` signifie que le port 5000 est déjà utilisé par un autre processus.

## ✅ Solutions

### Solution 1: Arrêter le Processus (Recommandé)

**Windows PowerShell:**
```powershell
# Arrêter tous les processus Node.js
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Ou trouver le processus spécifique utilisant le port 5000
netstat -ano | findstr :5000
# Notez le PID (dernier chiffre)
# Puis arrêtez-le:
Stop-Process -Id <PID> -Force
```

**Linux/Mac:**
```bash
# Trouver le processus utilisant le port 5000
lsof -i :5000
# Notez le PID
# Puis arrêtez-le:
kill -9 <PID>
```

### Solution 2: Changer le Port

1. **Modifier `backend/.env`**
   ```env
   PORT=5001
   ```

2. **Redémarrer le serveur**
   ```bash
   cd backend
   npm run dev
   ```

3. **Mettre à jour les URLs**
   - Frontend: Mettre à jour l'URL API dans `frontend/.env.production`
   - Tests: Mettre à jour `test-server.js` si nécessaire

### Solution 3: Utiliser un Port Disponible Automatiquement

Le code a été amélioré pour afficher un message d'erreur clair si le port est déjà utilisé.

## 🔧 Code Amélioré

Le fichier `backend/src/index.js` a été mis à jour pour:
- ✅ Gérer l'erreur `EADDRINUSE` de manière gracieuse
- ✅ Afficher un message d'erreur clair avec des solutions
- ✅ Suggérer des commandes pour arrêter les processus

## 📋 Checklist

- [ ] Arrêter tous les processus Node.js existants
- [ ] Vérifier que le port 5000 est libre
- [ ] Redémarrer le serveur: `cd backend && npm run dev`
- [ ] Vérifier que le serveur démarre correctement

## 🧪 Test

Après avoir arrêté les processus, testez:

```bash
cd backend
npm run dev
```

Vous devriez voir:
```
🚀 Serveur démarré sur le port 5000
```

Si vous voyez toujours l'erreur `EADDRINUSE`, utilisez la Solution 2 pour changer le port.

