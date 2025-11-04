// Utilitaire pour tester le système de déblocage séquentiel côté frontend
import { 
  getCategories, 
  getPathsByCategory, 
  getLevelsByPath, 
  getLevelContent,
  getExercisesByLevel,
  getExercise,
  submitExercise,
  getCategoryUnlockStatus,
  getPathUnlockStatus,
  getUserLevelProgress
} from '../services/courseService';

class FrontendSequentialUnlockTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
    this.testData = {
      categories: [],
      paths: [],
      levels: [],
      exercises: [],
      unlockStatus: null
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`🧪 Exécution du test frontend: ${testName}`);
      await testFunction();
      this.testResults.passed++;
      this.log(`✅ Test frontend réussi: ${testName}`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push({ test: testName, error: error.message });
      this.log(`❌ Test frontend échoué: ${testName} - ${error.message}`, 'error');
    }
  }

  async testServiceConnections() {
    this.log('🔗 Test des connexions aux services...');

    try {
      // Test de récupération des catégories
      const categories = await getCategories();
      if (!Array.isArray(categories)) {
        throw new Error('Les catégories ne sont pas un tableau');
      }
      this.testData.categories = categories;
      this.log(`Catégories récupérées: ${categories.length}`);

      if (categories.length > 0) {
        const firstCategory = categories[0];
        
        // Test de récupération des parcours
        const paths = await getPathsByCategory(firstCategory._id);
        if (!Array.isArray(paths)) {
          throw new Error('Les parcours ne sont pas un tableau');
        }
        this.testData.paths = paths;
        this.log(`Parcours récupérés: ${paths.length}`);

        if (paths.length > 0) {
          const firstPath = paths[0];
          
          // Test de récupération des niveaux
          const levels = await getLevelsByPath(firstPath._id);
          if (!Array.isArray(levels)) {
            throw new Error('Les niveaux ne sont pas un tableau');
          }
          this.testData.levels = levels;
          this.log(`Niveaux récupérés: ${levels.length}`);
        }
      }

    } catch (error) {
      throw new Error(`Erreur de connexion aux services: ${error.message}`);
    }
  }

  async testLevelContentAccess() {
    this.log('📖 Test d\'accès au contenu des niveaux...');

    if (this.testData.levels.length === 0) {
      throw new Error('Aucun niveau disponible pour le test');
    }

    const firstLevel = this.testData.levels[0];
    
    try {
      const levelContent = await getLevelContent(firstLevel._id);
      
      if (!levelContent) {
        throw new Error('Contenu de niveau non récupéré');
      }

      if (!levelContent.unlockStatus) {
        throw new Error('Statut de déblocage manquant dans le contenu du niveau');
      }

      this.log(`Contenu de niveau récupéré: ${levelContent.translations?.fr?.title || 'Sans titre'}`);
      this.log(`Statut de déblocage: ${levelContent.unlockStatus.isUnlocked ? 'Débloqué' : 'Verrouillé'}`);

    } catch (error) {
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        this.log('Accès refusé au niveau (comportement attendu pour niveau verrouillé)', 'warning');
      } else {
        throw new Error(`Erreur d'accès au contenu du niveau: ${error.message}`);
      }
    }
  }

  async testExerciseAccess() {
    this.log('📝 Test d\'accès aux exercices...');

    if (this.testData.levels.length === 0) {
      throw new Error('Aucun niveau disponible pour le test d\'exercices');
    }

    const firstLevel = this.testData.levels[0];
    
    try {
      const exercises = await getExercisesByLevel(firstLevel._id);
      
      if (!Array.isArray(exercises)) {
        throw new Error('Les exercices ne sont pas un tableau');
      }

      this.log(`Exercices récupérés: ${exercises.length}`);

      if (exercises.length > 0) {
        const firstExercise = exercises[0];
        
        const exerciseDetails = await getExercise(firstExercise._id);
        
        if (!exerciseDetails) {
          throw new Error('Détails de l\'exercice non récupérés');
        }

        this.log(`Détails de l'exercice récupérés: ${exerciseDetails.name}`);
      }

    } catch (error) {
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        this.log('Accès refusé aux exercices (comportement attendu pour niveau verrouillé)', 'warning');
      } else {
        throw new Error(`Erreur d'accès aux exercices: ${error.message}`);
      }
    }
  }

  async testUnlockStatusAPI() {
    this.log('📊 Test des API de statut de déblocage...');

    if (this.testData.categories.length === 0) {
      throw new Error('Aucune catégorie disponible pour le test de statut');
    }

    const firstCategory = this.testData.categories[0];
    const userId = localStorage.getItem('userId') || 'test-user-id';
    
    try {
      const categoryStatus = await getCategoryUnlockStatus(userId, firstCategory._id);
      
      if (!categoryStatus) {
        throw new Error('Statut de catégorie non récupéré');
      }

      this.log(`Statut de catégorie récupéré: ${categoryStatus.hasAccess ? 'Accès accordé' : 'Accès refusé'}`);
      
      if (categoryStatus.paths && categoryStatus.paths.length > 0) {
        this.log(`Parcours dans le statut: ${categoryStatus.paths.length}`);
        
        const firstPath = categoryStatus.paths[0];
        if (firstPath.levels && firstPath.levels.length > 0) {
          const unlockedLevels = firstPath.levels.filter(l => l.isUnlocked);
          this.log(`Niveaux débloqués: ${unlockedLevels.length}/${firstPath.levels.length}`);
        }
      }

      this.testData.unlockStatus = categoryStatus;

    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        this.log('Non autorisé à accéder au statut (comportement attendu si non connecté)', 'warning');
      } else {
        throw new Error(`Erreur de récupération du statut: ${error.message}`);
      }
    }
  }

  async testPathUnlockStatus() {
    this.log('🛤️ Test du statut de déblocage de parcours...');

    if (this.testData.paths.length === 0) {
      throw new Error('Aucun parcours disponible pour le test');
    }

    const firstPath = this.testData.paths[0];
    const userId = localStorage.getItem('userId') || 'test-user-id';
    
    try {
      const pathStatus = await getPathUnlockStatus(userId, firstPath._id);
      
      if (!pathStatus) {
        throw new Error('Statut de parcours non récupéré');
      }

      this.log(`Statut de parcours récupéré: ${pathStatus.hasAccess ? 'Accès accordé' : 'Accès refusé'}`);
      
      if (pathStatus.path && pathStatus.path.levels) {
        const unlockedLevels = pathStatus.path.levels.filter(l => l.isUnlocked);
        this.log(`Niveaux débloqués dans le parcours: ${unlockedLevels.length}/${pathStatus.path.levels.length}`);
      }

    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        this.log('Non autorisé à accéder au statut de parcours (comportement attendu si non connecté)', 'warning');
      } else {
        throw new Error(`Erreur de récupération du statut de parcours: ${error.message}`);
      }
    }
  }

  async testExerciseSubmission() {
    this.log('📤 Test de soumission d\'exercice...');

    if (this.testData.levels.length === 0) {
      throw new Error('Aucun niveau disponible pour le test de soumission');
    }

    const firstLevel = this.testData.levels[0];
    const userId = localStorage.getItem('userId') || 'test-user-id';
    
    try {
      const exercises = await getExercisesByLevel(firstLevel._id);
      
      if (exercises.length === 0) {
        this.log('Aucun exercice disponible pour le test de soumission', 'warning');
        return;
      }

      const firstExercise = exercises[0];
      
      // Simuler une soumission d'exercice
      const submissionResult = await submitExercise(
        firstExercise._id,
        'console.log("Test submission");',
        userId,
        { testMode: true }
      );

      if (!submissionResult) {
        throw new Error('Résultat de soumission non récupéré');
      }

      this.log(`Soumission d'exercice testée: ${submissionResult.correct ? 'Correct' : 'Incorrect'}`);
      
      if (submissionResult.nextLevelUnlocked) {
        this.log(`Niveau suivant débloqué: ${submissionResult.nextLevelUnlocked.levelName}`, 'success');
      }

    } catch (error) {
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        this.log('Soumission d\'exercice refusée (comportement attendu pour niveau verrouillé)', 'warning');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        this.log('Non autorisé à soumettre l\'exercice (comportement attendu si non connecté)', 'warning');
      } else {
        throw new Error(`Erreur de soumission d'exercice: ${error.message}`);
      }
    }
  }

  async testErrorHandling() {
    this.log('🚨 Test de la gestion d\'erreurs frontend...');

    try {
      // Test avec un ID invalide
      await getLevelContent('invalid-id');
      throw new Error('Devrait lever une erreur pour ID invalide');
    } catch (error) {
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        this.log('Erreur correctement gérée pour ID invalide', 'success');
      } else {
        throw new Error(`Gestion d'erreur incorrecte pour ID invalide: ${error.message}`);
      }
    }

    try {
      // Test avec un niveau inexistant
      await getLevelContent('507f1f77bcf86cd799439011');
      throw new Error('Devrait lever une erreur pour niveau inexistant');
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        this.log('Erreur correctement gérée pour niveau inexistant', 'success');
      } else {
        throw new Error(`Gestion d'erreur incorrecte pour niveau inexistant: ${error.message}`);
      }
    }
  }

  async testLocalStorageIntegration() {
    this.log('💾 Test de l\'intégration localStorage...');

    const testUserId = 'test-user-' + Date.now();
    localStorage.setItem('userId', testUserId);
    
    const retrievedUserId = localStorage.getItem('userId');
    
    if (retrievedUserId !== testUserId) {
      throw new Error('Problème avec localStorage pour userId');
    }

    this.log('localStorage fonctionne correctement', 'success');
  }

  async runAllFrontendTests() {
    this.log('🚀 Démarrage des tests complets du frontend...');
    
    try {
      // Tests frontend
      await this.runTest('Connexions aux services', () => this.testServiceConnections());
      await this.runTest('Accès au contenu des niveaux', () => this.testLevelContentAccess());
      await this.runTest('Accès aux exercices', () => this.testExerciseAccess());
      await this.runTest('API de statut de déblocage', () => this.testUnlockStatusAPI());
      await this.runTest('Statut de déblocage de parcours', () => this.testPathUnlockStatus());
      await this.runTest('Soumission d\'exercice', () => this.testExerciseSubmission());
      await this.runTest('Gestion d\'erreurs frontend', () => this.testErrorHandling());
      await this.runTest('Intégration localStorage', () => this.testLocalStorageIntegration());

      // Résultats
      this.log('\n📊 RÉSULTATS DES TESTS FRONTEND:', 'info');
      this.log(`✅ Tests frontend réussis: ${this.testResults.passed}`, 'success');
      this.log(`❌ Tests frontend échoués: ${this.testResults.failed}`, this.testResults.failed > 0 ? 'error' : 'info');
      
      if (this.testResults.errors.length > 0) {
        this.log('\n🚨 ERREURS DÉTAILLÉES:', 'error');
        this.testResults.errors.forEach(error => {
          this.log(`  - ${error.test}: ${error.error}`, 'error');
        });
      }

      const successRate = (this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100;
      this.log(`\n📈 Taux de réussite frontend: ${successRate.toFixed(1)}%`, successRate === 100 ? 'success' : 'warning');

      if (successRate === 100) {
        this.log('\n🎉 TOUS LES TESTS FRONTEND SONT PASSÉS ! Le frontend fonctionne correctement.', 'success');
      } else {
        this.log('\n⚠️ Certains tests frontend ont échoué. Vérifiez les erreurs ci-dessus.', 'warning');
      }

      return {
        success: this.testResults.passed,
        failed: this.testResults.failed,
        errors: this.testResults.errors,
        successRate
      };

    } catch (error) {
      this.log(`💥 Erreur critique lors des tests frontend: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Fonction utilitaire pour exécuter les tests depuis la console du navigateur
window.testSequentialUnlockFrontend = async function() {
  const tester = new FrontendSequentialUnlockTester();
  return await tester.runAllFrontendTests();
};

// Fonction utilitaire pour tester un composant spécifique
window.testSequentialLevelAccess = async function(levelId, pathId, categoryId) {
  const tester = new FrontendSequentialUnlockTester();
  
  try {
    const unlockStatus = await getCategoryUnlockStatus('test-user', categoryId);
    console.log('Statut de déblocage:', unlockStatus);
    
    const levelContent = await getLevelContent(levelId);
    console.log('Contenu du niveau:', levelContent);
    
    return { unlockStatus, levelContent };
  } catch (error) {
    console.error('Erreur lors du test:', error);
    return { error: error.message };
  }
};

export default FrontendSequentialUnlockTester;
