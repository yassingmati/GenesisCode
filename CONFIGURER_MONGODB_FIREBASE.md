# 🔧 Configurer MongoDB Atlas avec Firebase Functions

## 📋 Informations de Votre Cluster MongoDB

D'après l'image MongoDB Atlas que vous avez partagée :

- **Driver** : Node.js (version 6.7 ou plus tard)
- **Cluster** : `cluster0.whxj5zj.mongodb.net`
- **Utilisateur** : `discord`
- **Chaîne de connexion** : `mongodb+srv://discord:<db_password>@cluster0.whxj5zj.mongodb.net/?appName=Cluster0`

## ✅ Étape 1 : Préparer la Chaîne de Connexion

### Remplacer le Mot de Passe

1. **Récupérer votre mot de passe** de l'utilisateur `discord` dans MongoDB Atlas
2. **Remplacer** `<db_password>` dans la chaîne de connexion
3. **Ajouter le nom de la base de données** (optionnel mais recommandé)

**Exemple de chaîne complète :**
```
mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority
```

**Ou si vous voulez une base de données spécifique :**
```
mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
```

### Format Recommandé

```bash
mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority
```

**Remplacez :**
- `VOTRE_MOT_DE_PASSE` : Le mot de passe de l'utilisateur `discord`
- `codegenesis` : Le nom de votre base de données (ou laissez vide pour la base par défaut)

## ✅ Étape 2 : Configurer dans Firebase Functions

### Option A : Via Firebase Secrets (Recommandé)

```powershell
# Définir la chaîne de connexion MongoDB
npx firebase-tools functions:secrets:set MONGODB_URI

# Lorsque demandé, entrez votre chaîne de connexion complète :
# mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority
```

### Option B : Via Firebase Console

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner votre projet : `codegenesis-platform`
3. Aller dans **Functions** → **Configuration** → **Secrets**
4. Cliquer sur **"Add secret"**
5. Nom : `MONGODB_URI`
6. Valeur : Votre chaîne de connexion complète
7. Cliquer sur **"Save"**

## ✅ Étape 3 : Configurer les Autres Secrets

### Définir JWT_SECRET

```powershell
npx firebase-tools functions:secrets:set JWT_SECRET
```

**Générer un secret JWT :**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Définir JWT_ADMIN_SECRET

```powershell
npx firebase-tools functions:secrets:set JWT_ADMIN_SECRET
```

**Générer un secret JWT admin :**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Définir CLIENT_ORIGIN

```powershell
npx firebase-tools functions:secrets:set CLIENT_ORIGIN
```

**Valeur :**
```
https://codegenesis-platform.web.app
```

## ✅ Étape 4 : Vérifier la Configuration

### Lister les Secrets

```powershell
npx firebase-tools functions:secrets:access MONGODB_URI
```

### Vérifier dans le Code

Le fichier `backend/src/index-firebase.js` utilise déjà `process.env.MONGODB_URI` ou `process.env.MONGO_URI`, donc cela devrait fonctionner automatiquement.

## 🔧 Configuration Complète des Secrets

```powershell
# 1. MongoDB URI
npx firebase-tools functions:secrets:set MONGODB_URI
# Entrez: mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority

# 2. JWT Secret
npx firebase-tools functions:secrets:set JWT_SECRET
# Entrez un secret fort (généré avec node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 3. JWT Admin Secret
npx firebase-tools functions:secrets:set JWT_ADMIN_SECRET
# Entrez un secret fort différent

# 4. Client Origin
npx firebase-tools functions:secrets:set CLIENT_ORIGIN
# Entrez: https://codegenesis-platform.web.app

# 5. Node Environment
npx firebase-tools functions:secrets:set NODE_ENV
# Entrez: production
```

## ⚠️ Vérifications Importantes

### 1. Network Access dans MongoDB Atlas

Assurez-vous que MongoDB Atlas autorise les connexions depuis Firebase :

1. Aller dans **Network Access** dans MongoDB Atlas
2. Vérifier que `0.0.0.0/0` est autorisé (ou ajoutez-le)
3. Cliquer sur **"Confirm"**

### 2. Mot de Passe dans la Chaîne de Connexion

- Le mot de passe doit être **encodé en URL** si il contient des caractères spéciaux
- Utilisez `encodeURIComponent()` en JavaScript si nécessaire

### 3. Nom de la Base de Données

- Ajoutez `/codegenesis` (ou votre nom de base) avant le `?` dans la chaîne de connexion
- Exemple : `mongodb+srv://...@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority`

## 🚀 Après Configuration

Une fois les secrets configurés :

1. **Déployer les Functions** :
   ```powershell
   npx firebase-tools deploy --only functions
   ```

2. **Vérifier les Logs** :
   ```powershell
   npx firebase-tools functions:log
   ```

3. **Tester la Connexion** :
   ```powershell
   curl https://us-central1-codegenesis-platform.cloudfunctions.net/api/health
   ```

Vous devriez voir :
```json
{
  "status": "OK",
  "database": "connected",
  "timestamp": "..."
}
```

## 📝 Checklist

- [ ] Chaîne de connexion MongoDB préparée avec mot de passe
- [ ] Network Access configuré dans MongoDB Atlas (0.0.0.0/0)
- [ ] Secret `MONGODB_URI` configuré dans Firebase
- [ ] Secret `JWT_SECRET` configuré
- [ ] Secret `JWT_ADMIN_SECRET` configuré
- [ ] Secret `CLIENT_ORIGIN` configuré
- [ ] Functions déployées
- [ ] Connexion MongoDB testée

## 🐛 Dépannage

### Problème : Connexion MongoDB échoue

1. Vérifier que Network Access autorise `0.0.0.0/0`
2. Vérifier que le mot de passe est correct dans la chaîne de connexion
3. Vérifier les logs : `npx firebase-tools functions:log`
4. Vérifier que le secret est bien configuré : `npx firebase-tools functions:secrets:access MONGODB_URI`

### Problème : Mot de Passe avec Caractères Spéciaux

Si votre mot de passe contient des caractères spéciaux, encodez-le :

```javascript
const password = encodeURIComponent('VotreMotDePasseAvec#@!');
const uri = `mongodb+srv://discord:${password}@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority`;
```

---

**Prochaine étape :** Configurez tous les secrets, puis déployez les Functions !

