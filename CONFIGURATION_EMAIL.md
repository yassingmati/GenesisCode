# Configuration du Service Email

## Date: 2025-01-XX

## 🔍 Problème

L'API retourne 200 OK mais aucun email n'est reçu. Cela signifie que le service email n'est pas configuré.

## ✅ Solution

### 1. Configurer les Variables d'Environnement

**Fichier**: `backend/.env`

Ajoutez ou modifiez ces variables:

```env
# Configuration Email (Gmail)
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app

# Client Origin (pour les liens dans les emails)
CLIENT_ORIGIN=http://localhost:3000
```

### 2. Créer un Mot de Passe d'Application Gmail

**Pour Gmail:**

1. **Aller sur votre compte Google**: https://myaccount.google.com/
2. **Sécurité** → **Validation en 2 étapes** (doit être activée)
3. **Mots de passe des applications** → **Sélectionner l'application** → **Autre (nom personnalisé)**
4. **Entrer un nom** (ex: "CodeGenesis Backend")
5. **Générer** → **Copier le mot de passe** (16 caractères)
6. **Utiliser ce mot de passe dans `EMAIL_PASS`** (sans espaces)

**Important:**
- Ne pas utiliser votre mot de passe Gmail normal
- Utiliser uniquement un mot de passe d'application
- Le mot de passe d'application est différent du mot de passe de connexion

### 3. Redémarrer le Backend

Après avoir configuré les variables d'environnement:

```powershell
# Arrêter le backend actuel
taskkill /F /PID <PID>

# Redémarrer le backend
cd backend
npm start
```

### 4. Vérifier la Configuration

**Vérifier les logs du backend au démarrage:**

Vous devriez voir:
```
✅ Email service configuré
   EMAIL_USER: DÉFINI
   EMAIL_PASS: DÉFINI
```

Si vous voyez:
```
❌ Email non configuré - EMAIL_USER et EMAIL_PASS requis
   EMAIL_USER: NON DÉFINI
   EMAIL_PASS: NON DÉFINI
```

Cela signifie que les variables d'environnement ne sont pas chargées.

## 🧪 Test

### Test Direct

```powershell
# Tester l'envoi d'email
$body = @{email='votre-email@example.com'} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/forgot-password" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Vérifier les logs du backend:**
```
✅ Email de réinitialisation envoyé à: votre-email@example.com
```

### Vérifier la Boîte Email

1. **Vérifier la boîte de réception**
2. **Vérifier le dossier spam/courrier indésirable**
3. **Vérifier les filtres email**

## 🔧 Dépannage

### Problème: Email non reçu

**Vérifications:**
1. ✅ Variables d'environnement configurées dans `backend/.env`
2. ✅ Backend redémarré après modification
3. ✅ Mot de passe d'application Gmail correct
4. ✅ Validation en 2 étapes activée sur Gmail
5. ✅ Vérifier les logs du backend pour les erreurs

### Problème: Erreur d'authentification Gmail

**Erreurs possibles:**
- `Invalid login` → Mot de passe d'application incorrect
- `Less secure app access` → Utiliser un mot de passe d'application
- `Authentication failed` → Vérifier EMAIL_USER et EMAIL_PASS

**Solution:**
- Utiliser un mot de passe d'application (pas le mot de passe de connexion)
- Vérifier que la validation en 2 étapes est activée

### Problème: Variables d'environnement non chargées

**Vérifier:**
1. Le fichier `.env` est dans `backend/.env` (pas à la racine)
2. Le format est correct (pas d'espaces autour du `=`)
3. Pas de guillemets autour des valeurs (sauf si nécessaire)

**Exemple correct:**
```env
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

**Exemple incorrect:**
```env
EMAIL_USER = "votre-email@gmail.com"  # Espaces et guillemets
EMAIL_PASS='abcd efgh ijkl mnop'       # Guillemets
```

## 📝 Notes

- Le service email utilise **nodemailer** avec **Gmail**
- Pour d'autres services email (Outlook, Yahoo, etc.), modifier la configuration dans `backend/src/utils/emailService.js`
- En production, utiliser un service email dédié (SendGrid, Mailgun, etc.) pour de meilleures performances

## 🔒 Sécurité

- **Ne jamais commiter** le fichier `.env` dans Git
- **Utiliser des mots de passe d'application** (pas les mots de passe de connexion)
- **Limiter l'accès** au fichier `.env` (permissions système)

