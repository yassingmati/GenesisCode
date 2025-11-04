# Guide de Migration vers le Système de Paiement par Catégorie

## 🎯 Objectif

Ce guide vous accompagne dans la migration de votre système de paiement actuel vers un nouveau système basé sur les catégories, où :

- Chaque catégorie a son propre plan de paiement
- Le paiement débloque tous les parcours de la catégorie
- Les niveaux se débloquent progressivement (ordre 1, puis 2, etc.)
- Nettoyage complet de l'ancien système

## 📋 Prérequis

1. **Sauvegarde de la base de données** (OBLIGATOIRE)
2. **Arrêt des services** en production
3. **Vérification des dépendances** Node.js et MongoDB

## 🚀 Étapes de Migration

### 1. Préparation

```bash
# Sauvegarder la base de données
mongodump --db genesis --out ./backup-$(date +%Y%m%d)

# Vérifier la connexion
cd backend
npm install
```

### 2. Exécution de la Migration

```bash
# Option 1: Migration complète (recommandée)
node src/scripts/fullMigration.js

# Option 2: Migration étape par étape
node src/scripts/runMigration.js
node src/scripts/cleanupOldSystem.js
```

### 3. Vérification Post-Migration

```bash
# Vérifier les plans créés
curl http://localhost:5000/api/category-payments/plans

# Tester un paiement
curl -X POST http://localhost:5000/api/category-payments/init-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"categoryId": "CATEGORY_ID"}'
```

## 🏗️ Architecture du Nouveau Système

### Modèles de Base de Données

1. **CategoryPlan** - Plans de paiement par catégorie
2. **CategoryAccess** - Accès des utilisateurs aux catégories
3. **Nettoyage** - Suppression des anciens modèles

### API Endpoints

```
GET    /api/category-payments/plans              # Liste des plans
GET    /api/category-payments/plans/:categoryId   # Plan d'une catégorie
POST   /api/category-payments/init-payment       # Initialiser un paiement
GET    /api/category-payments/access/:categoryId/:pathId/:levelId  # Vérifier l'accès
POST   /api/category-payments/unlock-level       # Débloquer un niveau
GET    /api/category-payments/history            # Historique des accès
POST   /api/category-payments/webhook/konnect    # Webhook Konnect
```

### Interface Frontend

1. **CategoryPlans** - Page des plans par catégorie
2. **CategoryPaymentCard** - Carte de paiement pour une catégorie
3. **LevelAccessGate** - Porte d'accès pour les niveaux

## 🔧 Configuration Post-Migration

### 1. Définir les Prix des Catégories

```javascript
// Exemple de configuration des prix
const priceUpdates = {
  'CATEGORY_ID_1': 0,      // Gratuit
  'CATEGORY_ID_2': 5000,   // 50 TND
  'CATEGORY_ID_3': 10000   // 100 TND
};

await CategoryPlanSeeder.updateCategoryPrices(priceUpdates);
```

### 2. Tester le Système

```bash
# Démarrer le serveur
npm start

# Tester l'interface
http://localhost:3000/category-plans
```

### 3. Configuration Konnect

Vérifiez que votre configuration Konnect est correcte :

```env
KONNECT_API_KEY=your_api_key
KONNECT_SECRET_KEY=your_secret_key
KONNECT_BASE_URL=https://api.konnect.network
```

## 📊 Monitoring et Maintenance

### Vérifications Régulières

1. **Accès expirés** - Nettoyage automatique
2. **Paiements échoués** - Monitoring des webhooks
3. **Performance** - Indexation des requêtes

### Commandes Utiles

```bash
# Nettoyer les accès expirés
curl -X POST http://localhost:5000/api/category-payments/cleanup

# Vérifier l'historique d'un utilisateur
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/category-payments/history
```

## 🚨 Dépannage

### Problèmes Courants

1. **Migration échouée**
   - Vérifier la connexion MongoDB
   - Vérifier les permissions de la base de données

2. **Paiements non traités**
   - Vérifier les webhooks Konnect
   - Vérifier la configuration des URLs de retour

3. **Accès non accordés**
   - Vérifier les middlewares d'authentification
   - Vérifier la logique de déblocage des niveaux

### Logs et Debugging

```bash
# Activer les logs détaillés
NODE_ENV=development npm start

# Vérifier les logs de migration
tail -f logs/migration.log
```

## 📈 Améliorations Futures

1. **Système de remises** - Codes promo par catégorie
2. **Abonnements récurrents** - Paiements mensuels/annuels
3. **Analytics** - Suivi des conversions par catégorie
4. **Notifications** - Alertes d'expiration d'accès

## 🆘 Support

En cas de problème :

1. Vérifiez les logs de migration
2. Consultez la documentation des API
3. Testez avec des données de test
4. Contactez l'équipe de développement

---

**⚠️ Important :** Cette migration est irréversible. Assurez-vous d'avoir une sauvegarde complète avant de commencer.







