# 🔧 Solution Rapide : Utiliser Firebase avec PowerShell

## ✅ Solution la Plus Simple (Recommandée)

Au lieu de modifier la politique PowerShell, utilisez **npx** pour exécuter Firebase :

```powershell
# Se connecter à Firebase
npx firebase-tools login

# Initialiser Firebase
npx firebase-tools init

# Déployer
npx firebase-tools deploy

# Voir les autres commandes
npx firebase-tools --help
```

Cela fonctionne sans modifier les paramètres PowerShell.

## 🔧 Alternative : Changer la Politique d'Exécution

Si vous préférez utiliser `firebase` directement, ouvrez PowerShell **en tant qu'Administrateur** et exécutez :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Puis fermez et rouvrez PowerShell.

## 📝 Commandes Firebase avec npx

```powershell
# Se connecter
npx firebase-tools login

# Initialiser
npx firebase-tools init

# Déployer tout
npx firebase-tools deploy

# Déployer uniquement le hosting
npx firebase-tools deploy --only hosting

# Déployer uniquement les functions
npx firebase-tools deploy --only functions

# Voir les logs
npx firebase-tools functions:log

# Lister les projets
npx firebase-tools projects:list
```

## 🎯 Étapes Suivantes

1. **Se connecter à Firebase** :
   ```powershell
   npx firebase-tools login
   ```

2. **Initialiser Firebase** :
   ```powershell
   npx firebase-tools init
   ```

3. **Continuer avec le déploiement** selon les guides créés.

---

**Note :** `npx` est inclus avec npm et ne nécessite aucune modification de PowerShell.

