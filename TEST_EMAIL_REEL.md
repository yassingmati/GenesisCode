# Test Email Réel - yassine.gmatii@gmail.com

## Date: 2025-01-XX

## 🧪 Test Effectué

### Email Testé
- **Email**: yassine.gmatii@gmail.com
- **Route**: POST `/api/auth/forgot-password`
- **Status Code**: 200 OK

### Résultat Attendu

Si l'email existe dans la base de données MongoDB:
- ✅ Token de réinitialisation généré
- ✅ Token sauvegardé dans MongoDB (collection `passwordresettokens`)
- ✅ Email envoyé à yassine.gmatii@gmail.com
- ✅ Lien de réinitialisation dans l'email: `http://localhost:3000/reset-password?token=[token]`

Si l'email n'existe pas dans la base de données:
- ✅ Réponse 200 OK (pour la sécurité, on ne révèle pas si l'email existe)
- ✅ Aucun email envoyé
- ✅ Aucun token créé

## 📋 Vérifications à Effectuer

### 1. Vérifier les Logs du Backend

**Logs attendus si l'email existe:**
```
✅ Email de réinitialisation envoyé à: yassine.gmatii@gmail.com
```

**Logs attendus si l'email n'existe pas:**
```
⚠️ Tentative de reset pour email inexistant: yassine.gmatii@gmail.com
```

**Logs d'erreur possibles:**
```
❌ Erreur envoi email de réinitialisation: [erreur]
   Code: [code d'erreur]
   Message: [message d'erreur]
```

### 2. Vérifier la Boîte Email

1. **Ouvrir la boîte email**: yassine.gmatii@gmail.com
2. **Vérifier la boîte de réception**
3. **Vérifier le dossier spam/courrier indésirable**
4. **Rechercher l'email avec le sujet**: "Réinitialisation de votre mot de passe - CodeGenesis"

### 3. Vérifier le Token dans MongoDB

Si l'email existe, un token devrait être créé dans la collection `passwordresettokens`:

```javascript
// Dans MongoDB
db.passwordresettokens.findOne({ 
  userId: ObjectId("..."), // ID de l'utilisateur avec cet email
  used: false,
  expires: { $gt: new Date() }
})
```

### 4. Tester le Lien de Réinitialisation

Si l'email est reçu:
1. Cliquer sur le lien dans l'email
2. Vérifier que la page `/reset-password?token=[token]` s'affiche
3. Tester la réinitialisation du mot de passe

## 🔍 Dépannage

### Problème: Email non reçu

**Vérifications:**
1. ✅ Vérifier les logs du backend pour confirmer l'envoi
2. ✅ Vérifier le dossier spam
3. ✅ Vérifier les filtres email
4. ✅ Vérifier que l'email existe dans MongoDB
5. ✅ Vérifier la configuration email (EMAIL_USER, EMAIL_PASS)

### Problème: Erreur dans les logs

**Erreurs possibles:**
- `Invalid login` → Mot de passe d'application incorrect
- `Authentication failed` → Vérifier EMAIL_USER et EMAIL_PASS
- `Email service not configured` → Ajouter EMAIL_USER et EMAIL_PASS dans backend/.env

**Solution:**
- Vérifier la configuration dans `backend/.env`
- Utiliser un mot de passe d'application Gmail
- Vérifier que la validation en 2 étapes est activée

## ✅ Conclusion

- ✅ Test effectué avec succès (200 OK)
- ✅ Si l'email existe, un email de réinitialisation devrait être envoyé
- ✅ Vérifier la boîte email et les logs du backend pour confirmer

