/**
 * Script de test pour la page SubscriptionManagement
 * Teste l'intégration complète des plans de catégories
 */

const axios = require('axios');
const API_BASE = process.env.API_BASE || 'http://localhost:5000';

// Configuration pour les tests
const testConfig = {
  adminCredentials: {
    email: 'admin@test.com',
    password: 'admin123'
  },
  testCategory: {
    name: 'Test Category for Plans',
    translations: {
      fr: { name: 'Catégorie Test Plans', description: 'Description test' },
      en: { name: 'Test Category Plans', description: 'Test description' },
      ar: { name: 'فئة اختبار الخطط', description: 'وصف اختبار' }
    }
  },
  testPlan: {
    price: 29.99,
    currency: 'TND',
    paymentType: 'one_time',
    accessDuration: 365,
    active: true,
    translations: {
      fr: { name: 'Plan Test', description: 'Description du plan test' },
      en: { name: 'Test Plan', description: 'Test plan description' },
      ar: { name: 'خطة اختبار', description: 'وصف خطة الاختبار' }
    },
    features: ['Accès complet', 'Support 24/7', 'Certificat'],
    order: 1
  }
};

class SubscriptionManagementTester {
  constructor() {
    this.adminToken = null;
    this.testCategoryId = null;
    this.testPlanId = null;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    this.log(`🧪 Test: ${testName}`);
    try {
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED' });
      this.log(`✅ ${testName} - PASSED`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAILED', error: error.message });
      this.log(`❌ ${testName} - FAILED: ${error.message}`, 'error');
    }
  }

  async authenticateAdmin() {
    this.log('🔐 Authentification admin...');
    
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      email: testConfig.adminCredentials.email,
      password: testConfig.adminCredentials.password
    });

    if (!response.data.token) {
      throw new Error('Token admin non reçu');
    }

    this.adminToken = response.data.token;
    this.log('✅ Authentification admin réussie');
  }

  async createTestCategory() {
    this.log('📁 Création catégorie test...');
    
    const response = await axios.post(`${API_BASE}/api/categories`, testConfig.testCategory, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });

    if (!response.data.category) {
      throw new Error('Catégorie test non créée');
    }

    this.testCategoryId = response.data.category._id;
    this.log(`✅ Catégorie test créée: ${this.testCategoryId}`);
  }

  async testGetCategories() {
    this.log('📋 Test: Récupération des catégories...');
    
    const response = await axios.get(`${API_BASE}/api/categories`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Format de réponse invalide pour les catégories');
    }

    this.log(`✅ ${response.data.length} catégories récupérées`);
  }

  async testGetCategoryPlans() {
    this.log('📋 Test: Récupération des plans de catégories...');
    
    const response = await axios.get(`${API_BASE}/api/admin/category-plans`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });

    if (!response.data || !response.data.plans) {
      throw new Error('Format de réponse invalide pour les plans');
    }

    this.log(`✅ ${response.data.plans.length} plans récupérés`);
  }

  async testCreateCategoryPlan() {
    this.log('➕ Test: Création d\'un plan de catégorie...');
    
    const planData = {
      ...testConfig.testPlan,
      categoryId: this.testCategoryId
    };

    const response = await axios.post(`${API_BASE}/api/admin/category-plans`, planData, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });

    if (!response.data || !response.data.plan) {
      throw new Error('Plan non créé');
    }

    this.testPlanId = response.data.plan._id;
    this.log(`✅ Plan créé: ${this.testPlanId}`);
  }

  async testUpdateCategoryPlan() {
    this.log('✏️ Test: Mise à jour du plan...');
    
    const updateData = {
      price: 39.99,
      translations: {
        fr: { name: 'Plan Test Modifié', description: 'Description modifiée' },
        en: { name: 'Modified Test Plan', description: 'Modified description' },
        ar: { name: 'خطة اختبار معدلة', description: 'وصف معدل' }
      }
    };

    const response = await axios.put(`${API_BASE}/api/admin/category-plans/${this.testPlanId}`, updateData, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });

    if (!response.data || !response.data.plan) {
      throw new Error('Plan non mis à jour');
    }

    this.log('✅ Plan mis à jour avec succès');
  }

  async testTogglePlanStatus() {
    this.log('🔄 Test: Changement de statut du plan...');
    
    const response = await axios.patch(`${API_BASE}/api/admin/category-plans/${this.testPlanId}/toggle`, {
      active: false
    }, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });

    if (!response.data || !response.data.plan) {
      throw new Error('Statut non changé');
    }

    this.log('✅ Statut du plan changé');
  }

  async testGetPlanStats() {
    this.log('📊 Test: Récupération des statistiques...');
    
    const response = await axios.get(`${API_BASE}/api/admin/category-plans/stats`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });

    if (!response.data || typeof response.data.totalPlans !== 'number') {
      throw new Error('Statistiques non récupérées');
    }

    this.log(`✅ Statistiques: ${response.data.totalPlans} plans total`);
  }

  async testDeleteCategoryPlan() {
    this.log('🗑️ Test: Suppression du plan...');
    
    const response = await axios.delete(`${API_BASE}/api/admin/category-plans/${this.testPlanId}`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });

    if (!response.data || !response.data.success) {
      throw new Error('Plan non supprimé');
    }

    this.log('✅ Plan supprimé avec succès');
  }

  async testPublicCategoryPlans() {
    this.log('🌐 Test: Accès public aux plans...');
    
    const response = await axios.get(`${API_BASE}/api/category-payments/plans`);

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Plans publics non accessibles');
    }

    this.log(`✅ ${response.data.length} plans publics accessibles`);
  }

  async cleanup() {
    this.log('🧹 Nettoyage des données de test...');
    
    try {
      if (this.testCategoryId) {
        await axios.delete(`${API_BASE}/api/categories/${this.testCategoryId}`, {
          headers: { Authorization: `Bearer ${this.adminToken}` }
        });
        this.log('✅ Catégorie test supprimée');
      }
    } catch (error) {
      this.log(`⚠️ Erreur lors du nettoyage: ${error.message}`);
    }
  }

  async runAllTests() {
    this.log('🚀 Démarrage des tests SubscriptionManagement');
    this.log('=' .repeat(60));

    try {
      // Tests d'authentification et setup
      await this.runTest('Authentification Admin', () => this.authenticateAdmin());
      await this.runTest('Création Catégorie Test', () => this.createTestCategory());
      
      // Tests de récupération des données
      await this.runTest('Récupération Catégories', () => this.testGetCategories());
      await this.runTest('Récupération Plans Catégories', () => this.testGetCategoryPlans());
      
      // Tests CRUD des plans
      await this.runTest('Création Plan Catégorie', () => this.testCreateCategoryPlan());
      await this.runTest('Mise à jour Plan', () => this.testUpdateCategoryPlan());
      await this.runTest('Changement Statut Plan', () => this.testTogglePlanStatus());
      await this.runTest('Récupération Statistiques', () => this.testGetPlanStats());
      
      // Tests d'accès public
      await this.runTest('Accès Public Plans', () => this.testPublicCategoryPlans());
      
      // Tests de suppression
      await this.runTest('Suppression Plan', () => this.testDeleteCategoryPlan());

    } catch (error) {
      this.log(`❌ Erreur critique: ${error.message}`, 'error');
    } finally {
      await this.cleanup();
    }

    // Résultats finaux
    this.log('=' .repeat(60));
    this.log('📊 RÉSULTATS DES TESTS');
    this.log(`✅ Tests réussis: ${this.results.passed}`);
    this.log(`❌ Tests échoués: ${this.results.failed}`);
    this.log(`📈 Taux de réussite: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      this.log('\n❌ TESTS ÉCHOUÉS:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          this.log(`  - ${test.name}: ${test.error}`);
        });
    }

    this.log('\n🎯 RECOMMANDATIONS:');
    this.log('1. Vérifiez que le serveur backend est démarré sur le port 5000');
    this.log('2. Assurez-vous que la base de données MongoDB est accessible');
    this.log('3. Vérifiez que l\'utilisateur admin existe dans la base de données');
    this.log('4. Testez l\'interface frontend sur http://localhost:3000/admin/Subscription');
    
    return this.results;
  }
}

// Exécution du script
if (require.main === module) {
  const tester = new SubscriptionManagementTester();
  tester.runAllTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = SubscriptionManagementTester;


