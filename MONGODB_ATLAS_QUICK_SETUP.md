# ⚡ Configuration Rapide MongoDB Atlas

## 📋 Informations de Votre Cluster

- **Cluster** : `cluster0.whxj5zj.mongodb.net`
- **Utilisateur** : `discord`
- **Chaîne de connexion** : `mongodb+srv://discord:<db_password>@cluster0.whxj5zj.mongodb.net/?appName=Cluster0`

## ✅ Étape 1 : Préparer la Chaîne de Connexion

1. **Récupérer le mot de passe** de l'utilisateur `discord`
2. **Remplacer** `<db_password>` dans la chaîne
3. **Ajouter le nom de la base** : `/codegenesis`

**Chaîne finale :**
```
mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority
```

## ✅ Étape 2 : Configurer dans Firebase

```powershell
# Définir MongoDB URI
npx firebase-tools functions:secrets:set MONGODB_URI
# Entrez votre chaîne de connexion complète

# Définir JWT Secret
npx firebase-tools functions:secrets:set JWT_SECRET
# Générer avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Définir JWT Admin Secret  
npx firebase-tools functions:secrets:set JWT_ADMIN_SECRET
# Générer avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Définir Client Origin
npx firebase-tools functions:secrets:set CLIENT_ORIGIN
# Entrez: https://codegenesis-platform.web.app
```

## ✅ Étape 3 : Vérifier Network Access

Dans MongoDB Atlas :
1. Aller dans **Network Access**
2. Ajouter `0.0.0.0/0` (autoriser toutes les IPs)
3. Cliquer sur **Confirm**

## ✅ Étape 4 : Déployer

```powershell
npx firebase-tools deploy --only functions
```

## ✅ Étape 5 : Tester

```powershell
curl https://us-central1-codegenesis-platform.cloudfunctions.net/api/health
```

Devrait retourner :
```json
{
  "status": "OK",
  "database": "connected"
}
```

---

**C'est tout !** Votre MongoDB est configuré pour Firebase Functions.

