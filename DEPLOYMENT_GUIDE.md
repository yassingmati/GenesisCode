# Guide de Déploiement et Test Complet

## 🚀 Déploiement du Système

### 1. Préparation de l'Environnement

```bash
# 1. Sauvegarder la base de données existante
mongodump --db genesis --out ./backup-$(date +%Y%m%d)

# 2. Vérifier les dépendances
cd backend && npm install
cd ../frontend && npm install

# 3. Vérifier les variables d'environnement
cat .env
```

### 2. Migration des Données

```bash
# Option 1: Migration complète avec déblocage
cd backend
npm run migrate:unlock

# Option 2: Migration étape par étape
npm run migrate:step
npm run cleanup
npm run seed:categories
```

### 3. Test du Système

```bash
# Test complet de tous les composants
cd backend
npm run test:all

# Tests individuels
npm run test:complete    # Test du système complet
npm run test:api         # Test des endpoints API
npm run test:unlock      # Test du déblocage des niveaux
```

## 🧪 Tests de Validation

### 1. Tests Backend

#### Test Complet du Système
```bash
npm run test:complete
```
**Vérifie :**
- ✅ Connexion à la base de données
- ✅ Création des données de test
- ✅ Service de paiement par catégorie
- ✅ Accès gratuit au premier niveau
- ✅ Déblocage progressif des niveaux
- ✅ Vérification d'accès aux niveaux
- ✅ Gestion des accès utilisateur

#### Test des Endpoints API
```bash
npm run test:api
```
**Vérifie :**
- ✅ Santé du serveur
- ✅ Récupération des plans
- ✅ Initialisation des paiements
- ✅ Vérification d'accès aux niveaux
- ✅ Déblocage des niveaux
- ✅ Historique utilisateur
- ✅ Webhooks Konnect
- ✅ Nettoyage des données

### 2. Tests Frontend

#### Test des Services
```javascript
// Dans la console du navigateur
import CategoryPaymentTester from './utils/testCategoryPayment';

// Test complet
CategoryPaymentTester.runAllTests();
```

#### Test des Composants
```bash
# Démarrer le serveur de développement
cd frontend
npm start

# Tester l'interface
# Aller sur http://localhost:3000/category-plans
```

### 3. Tests d'Intégration

#### Test du Flux Complet
1. **Accès à la page des plans** : `/category-plans`
2. **Sélection d'une catégorie** : Clic sur une carte de plan
3. **Paiement** : Processus de paiement Konnect
4. **Déblocage** : Accès aux premiers niveaux
5. **Progression** : Déblocage des niveaux suivants

#### Test des Fonctionnalités
- ✅ **Paiement par catégorie** : Un paiement débloque toute la catégorie
- ✅ **Accès gratuit** : Premier niveau de chaque parcours gratuit
- ✅ **Déblocage progressif** : Niveau suivant débloqué après complétion
- ✅ **Vérification d'accès** : Contrôle strict des niveaux verrouillés
- ✅ **Interface utilisateur** : Composants fonctionnels et intuitifs

## 🔧 Configuration Post-Déploiement

### 1. Configuration des Prix

```javascript
// Exemple de configuration des prix
const priceUpdates = {
  'CATEGORY_ID_1': 0,      // Gratuit
  'CATEGORY_ID_2': 5000,   // 50 TND
  'CATEGORY_ID_3': 10000   // 100 TND
};

// Mettre à jour les prix
await CategoryPlanSeeder.updateCategoryPrices(priceUpdates);
```

### 2. Configuration Konnect

```env
# Variables d'environnement Konnect
KONNECT_API_KEY=your_api_key
KONNECT_SECRET_KEY=your_secret_key
KONNECT_BASE_URL=https://api.konnect.network
```

### 3. Configuration des URLs

```env
# URLs de retour pour les paiements
CLIENT_ORIGIN=http://localhost:3000
RETURN_URL=http://localhost:3000/payment/success
CANCEL_URL=http://localhost:3000/payment/cancel
```

## 📊 Monitoring et Maintenance

### 1. Vérifications Régulières

```bash
# Vérifier la santé du système
curl http://localhost:5000/api/health

# Vérifier les plans disponibles
curl http://localhost:5000/api/category-payments/plans

# Nettoyer les accès expirés
curl -X POST http://localhost:5000/api/category-payments/cleanup
```

### 2. Logs et Debugging

```bash
# Surveiller les logs
tail -f logs/app.log

# Logs de déblocage des niveaux
tail -f logs/level-unlock.log

# Logs des paiements
tail -f logs/payment.log
```

### 3. Métriques de Performance

- **Temps de réponse API** : < 200ms
- **Temps de chargement frontend** : < 2s
- **Mémoire utilisée** : < 100MB
- **Taux de réussite des paiements** : > 95%

## 🚨 Dépannage

### Problèmes Courants

#### 1. Migration Échouée
```bash
# Vérifier la connexion MongoDB
mongo --eval "db.adminCommand('ismaster')"

# Vérifier les permissions
ls -la /var/lib/mongodb/

# Relancer la migration
npm run migrate:unlock
```

#### 2. Paiements Non Traités
```bash
# Vérifier les webhooks Konnect
curl -X POST http://localhost:5000/api/category-payments/webhook/konnect?payment_ref=test

# Vérifier la configuration Konnect
echo $KONNECT_API_KEY
```

#### 3. Accès Non Accordés
```bash
# Vérifier les accès utilisateur
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/category-payments/history

# Vérifier les niveaux débloqués
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/category-payments/access/CATEGORY_ID/PATH_ID/LEVEL_ID
```

### Solutions

#### 1. Redémarrage Complet
```bash
# Arrêter les services
pkill -f node
pkill -f mongod

# Redémarrer MongoDB
mongod --fork --logpath /var/log/mongodb/mongod.log

# Redémarrer l'application
cd backend && npm start
cd frontend && npm start
```

#### 2. Nettoyage et Réinitialisation
```bash
# Nettoyer la base de données
mongo genesis --eval "db.dropDatabase()"

# Relancer la migration
npm run migrate:unlock

# Tester le système
npm run test:all
```

## 📈 Améliorations Futures

### 1. Fonctionnalités Avancées
- **Codes promo** : Réductions par catégorie
- **Abonnements récurrents** : Paiements mensuels/annuels
- **Analytics** : Suivi des conversions
- **Notifications** : Alertes de nouveaux niveaux

### 2. Optimisations
- **Cache Redis** : Amélioration des performances
- **CDN** : Distribution des contenus
- **Monitoring** : Surveillance en temps réel
- **Backup** : Sauvegarde automatique

### 3. Sécurité
- **Rate limiting** : Protection contre les abus
- **Validation** : Validation renforcée des données
- **Audit** : Logs d'audit complets
- **Chiffrement** : Chiffrement des données sensibles

---

**🎉 Le système de paiement par catégorie est maintenant déployé et testé !**

Utilisez `npm run test:all` pour vérifier que tout fonctionne parfaitement.






