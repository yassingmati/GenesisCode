# 🔧 Résoudre le Problème PowerShell avec Firebase

## ❌ Problème

PowerShell bloque l'exécution de scripts Firebase avec cette erreur :
```
Impossible de charger le fichier C:\Users\yassi\AppData\Roaming\npm\firebase.ps1,
car l'exécution de scripts est désactivée sur ce système.
```

## ✅ Solution 1 : Changer la Politique d'Exécution (Recommandé)

### Option A : Pour la Session Actuelle (Temporaire)

Ouvrez PowerShell en tant qu'**Administrateur** et exécutez :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

Cette commande active l'exécution de scripts uniquement pour la session PowerShell actuelle.

### Option B : Pour l'Utilisateur Actuel (Permanent)

Ouvrez PowerShell en tant qu'**Administrateur** et exécutez :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Cette commande active l'exécution de scripts pour votre utilisateur de façon permanente.

### Option C : Pour Tous les Utilisateurs (Moins Recommandé)

Ouvrez PowerShell en tant qu'**Administrateur** et exécutez :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

**Note :** Cette option modifie la politique pour tous les utilisateurs.

## ✅ Solution 2 : Utiliser npx (Alternative Sans Modifier PowerShell)

Au lieu d'utiliser `firebase` directement, utilisez `npx` :

```powershell
npx firebase-tools login
npx firebase-tools init
npx firebase-tools deploy
```

## ✅ Solution 3 : Utiliser cmd (Invite de Commande)

Au lieu de PowerShell, utilisez l'**Invite de commande** (cmd) :

1. Ouvrez **cmd** (pas PowerShell)
2. Exécutez les commandes Firebase normalement :

```cmd
firebase login
firebase init
firebase deploy
```

## 📝 Instructions Détaillées

### Comment Ouvrir PowerShell en tant qu'Administrateur

1. Cliquez sur le menu **Démarrer**
2. Tapez **"PowerShell"**
3. Clic droit sur **"Windows PowerShell"**
4. Sélectionnez **"Exécuter en tant qu'administrateur"**
5. Cliquez sur **"Oui"** dans la fenêtre UAC

### Vérifier la Politique Actuelle

Pour vérifier la politique d'exécution actuelle :

```powershell
Get-ExecutionPolicy -List
```

Vous verrez quelque chose comme :
```
Scope ExecutionPolicy
----- ---------------
MachinePolicy       Undefined
UserPolicy          Undefined
Process             Undefined
CurrentUser         Restricted
LocalMachine        Restricted
```

### Comprendre les Politiques d'Exécution

- **Restricted** : Aucun script ne peut être exécuté (par défaut)
- **RemoteSigned** : Scripts locaux peuvent s'exécuter, scripts téléchargés doivent être signés (recommandé)
- **Unrestricted** : Tous les scripts peuvent s'exécuter (moins sécurisé)

## 🚀 Après Avoir Résolu le Problème

Une fois la politique d'exécution changée, vous pouvez utiliser Firebase normalement :

```powershell
# Se connecter à Firebase
firebase login

# Initialiser Firebase
firebase init

# Déployer
firebase deploy
```

## ⚠️ Sécurité

La politique **RemoteSigned** est recommandée car elle :
- Permet l'exécution de scripts locaux (comme `firebase.ps1`)
- Exige que les scripts téléchargés soient signés
- Équilibre sécurité et fonctionnalité

## 🔄 Revenir à la Politique Restreinte (Si Nécessaire)

Si vous voulez revenir à la politique restrictive :

```powershell
Set-ExecutionPolicy -ExecutionPolicy Restricted -Scope CurrentUser
```

## 📚 Ressources

- [Documentation Microsoft sur les Politiques d'Exécution](https://docs.microsoft.com/powershell/module/microsoft.powershell.core/about/about_execution_policies)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)

---

**Solution Rapide :** Utilisez `npx firebase-tools` au lieu de `firebase` pour éviter de modifier PowerShell.

