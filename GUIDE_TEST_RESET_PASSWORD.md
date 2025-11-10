# Guide de Test - Réinitialisation de Mot de Passe

## Date: 2025-01-XX

## 🔗 Lien de Réinitialisation

```
http://localhost:3000/reset-password?token=87853b0af29705bda52244a5d6205cc4680ca1706954503c79c0c129f60254ef
```

## ✅ Étapes de Test

### 1. Démarrer le Frontend

**Si le frontend n'est pas en cours d'exécution:**

```powershell
cd frontend
npm start
```

**Attendre que le frontend démarre complètement** (généralement 10-30 secondes)

### 2. Accéder à la Page de Réinitialisation

**Ouvrir le lien dans le navigateur:**
```
http://localhost:3000/reset-password?token=87853b0af29705bda52244a5d6205cc4680ca1706954503c79c0c129f60254ef
```

### 3. Vérifier l'Affichage de la Page

**La page devrait afficher:**
- ✅ Titre: "Réinitialiser le mot de passe"
- ✅ Champ "Nouveau mot de passe"
- ✅ Champ "Confirmer le mot de passe"
- ✅ Bouton "Réinitialiser le mot de passe"
- ✅ Lien "Retour à la connexion"

**Si le token est invalide ou expiré:**
- ❌ Message: "Token invalide ou expiré"
- ❌ Lien pour demander un nouveau lien
- ❌ Lien "Retour à la connexion"

### 4. Tester la Réinitialisation

**Étapes:**
1. Entrer un nouveau mot de passe (minimum 6 caractères)
2. Confirmer le mot de passe
3. Cliquer sur "Réinitialiser le mot de passe"

**Résultat attendu:**
- ✅ Message de succès: "Mot de passe réinitialisé avec succès!"
- ✅ Redirection vers `/login` après 3 secondes
- ✅ Possibilité de se connecter avec le nouveau mot de passe

### 5. Tester la Validation

**Tests de validation:**
- ❌ Mot de passe vide → Erreur: "Le mot de passe est requis"
- ❌ Mot de passe < 6 caractères → Erreur: "Le mot de passe doit contenir au moins 6 caractères"
- ❌ Mots de passe différents → Erreur: "Les mots de passe ne correspondent pas"
- ✅ Mots de passe identiques et >= 6 caractères → Succès

## 🔍 Vérifications Backend

### 1. Vérifier le Token dans MongoDB

**Le token devrait exister dans la collection `passwordresettokens`:**

```javascript
db.passwordresettokens.findOne({ 
  token: "87853b0af29705bda52244a5d6205cc4680ca1706954503c79c0c129f60254ef",
  used: false,
  expires: { $gt: new Date() }
})
```

### 2. Vérifier les Logs du Backend

**Lors de la réinitialisation, vous devriez voir:**
```
✅ Mot de passe réinitialisé pour: [email]
```

**Si le token est invalide:**
```
❌ Token invalide ou expiré
```

## 🐛 Dépannage

### Problème: Page inaccessible (ERR_CONNECTION_REFUSED)

**Solution:**
1. Vérifier que le frontend est en cours d'exécution
2. Démarrer le frontend: `cd frontend && npm start`
3. Attendre que le frontend démarre complètement
4. Actualiser la page

### Problème: Token invalide ou expiré

**Vérifications:**
1. ✅ Le token existe dans MongoDB
2. ✅ Le token n'a pas été utilisé (`used: false`)
3. ✅ Le token n'a pas expiré (`expires > Date.now()`)
4. ✅ Le token correspond exactement (pas d'espaces, caractères spéciaux)

**Solution:**
- Demander un nouveau lien de réinitialisation
- Vérifier que le token n'a pas été copié avec des espaces

### Problème: Erreur lors de la réinitialisation

**Vérifications:**
1. ✅ Le backend est en cours d'exécution
2. ✅ La route `/api/auth/reset-password` est accessible
3. ✅ Les logs du backend pour voir l'erreur exacte

**Erreurs possibles:**
- `Token and password are required` → Vérifier que le token et le mot de passe sont envoyés
- `Invalid or expired reset token` → Token invalide ou expiré
- `Password must be at least 6 characters long` → Mot de passe trop court
- `Failed to reset password` → Erreur serveur (vérifier les logs)

## ✅ Checklist de Test

- [ ] Frontend démarré et accessible
- [ ] Page `/reset-password` s'affiche correctement
- [ ] Token extrait correctement depuis l'URL
- [ ] Formulaire de réinitialisation fonctionne
- [ ] Validation des champs fonctionne
- [ ] Réinitialisation réussie
- [ ] Redirection vers `/login` après succès
- [ ] Connexion avec le nouveau mot de passe fonctionne
- [ ] Token marqué comme utilisé dans MongoDB
- [ ] Ancien token ne peut plus être utilisé

## 📝 Notes

- Le token expire après **1 heure**
- Le token ne peut être utilisé qu'**une seule fois**
- Après réinitialisation, le token est marqué comme `used: true`
- Les autres tokens non utilisés pour le même utilisateur sont supprimés

