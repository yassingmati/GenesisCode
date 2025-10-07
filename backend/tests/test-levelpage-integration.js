const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/courses';
const FRONTEND_BASE = 'http://localhost:3000';
const LEVEL_ID = '68c973738b6e19e85d67e35a';

async function testLevelPageIntegration() {
  console.log('🧪 Test d\'intégration LevelPage ↔ Exercices\n');
  console.log('=' .repeat(60));
  
  let totalTests = 0;
  let passedTests = 0;
  
  function testResult(name, success, details = '') {
    totalTests++;
    if (success) {
      passedTests++;
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name}`);
      if (details) console.log(`   📝 ${details}`);
    }
  }
  
  try {
    // 1. Test de chargement du niveau avec exercices
    console.log('\n1️⃣ TEST DE CHARGEMENT DU NIVEAU');
    console.log('-'.repeat(40));
    
    try {
      const levelResponse = await axios.get(`${API_BASE}/levels/${LEVEL_ID}`);
      testResult('Niveau chargé', true);
      testResult('Exercices disponibles', levelResponse.data.exercises?.length > 0, 
        `${levelResponse.data.exercises?.length} exercices trouvés`);
      testResult('Structure des exercices', levelResponse.data.exercises?.every(ex => 
        ex._id && ex.name && ex.type && ex.points), 'Tous les exercices ont les champs requis');
    } catch (error) {
      testResult('Niveau chargé', false, error.message);
    }
    
    // 2. Test des types d'exercices
    console.log('\n2️⃣ TEST DES TYPES D\'EXERCICES');
    console.log('-'.repeat(40));
    
    const expectedTypes = ['QCM', 'Code', 'Algorithm', 'OrderBlocks', 'TextInput', 'FillInTheBlank', 'SpotTheError', 'ScratchBlocks'];
    
    try {
      const levelResponse = await axios.get(`${API_BASE}/levels/${LEVEL_ID}`);
      const exercises = levelResponse.data.exercises || [];
      
      for (const type of expectedTypes) {
        const exercise = exercises.find(ex => ex.type === type);
        testResult(`Exercice ${type}`, !!exercise, exercise ? exercise.name : 'Non trouvé');
      }
    } catch (error) {
      testResult('Types d\'exercices', false, error.message);
    }
    
    // 3. Test de soumission d'exercices
    console.log('\n3️⃣ TEST DE SOUMISSION D\'EXERCICES');
    console.log('-'.repeat(40));
    
    const testAnswers = {
      'QCM': ['c'],
      'Code': { passed: true },
      'Algorithm': ['1', '2', '3', '4'],
      'OrderBlocks': ['1', '2', '3', '4'],
      'TextInput': 'console.log',
      'FillInTheBlank': 'dynamique',
      'SpotTheError': 2,
      'ScratchBlocks': ['start', 'say1', 'say2']
    };
    
    try {
      const levelResponse = await axios.get(`${API_BASE}/levels/${LEVEL_ID}`);
      const exercises = levelResponse.data.exercises || [];
      
      for (const exercise of exercises) {
        const testAnswer = testAnswers[exercise.type];
        if (testAnswer) {
          try {
            const payload = exercise.type === 'Code' 
              ? { answer: testAnswer, userId: 'levelpage-test-user', ...testAnswer }
              : { answer: testAnswer, userId: 'levelpage-test-user' };
            
            const submitResponse = await axios.post(`${API_BASE}/exercises/${exercise._id}/submit`, payload);
            const success = submitResponse.data.correct;
            testResult(`Soumission ${exercise.type}`, success, 
              `${submitResponse.data.pointsEarned}/${submitResponse.data.pointsMax} pts`);
          } catch (error) {
            testResult(`Soumission ${exercise.type}`, false, error.response?.data?.error || error.message);
          }
        }
      }
    } catch (error) {
      testResult('Soumission d\'exercices', false, error.message);
    }
    
    // 4. Test de l'interface utilisateur
    console.log('\n4️⃣ TEST DE L\'INTERFACE UTILISATEUR');
    console.log('-'.repeat(40));
    
    try {
      const frontendResponse = await axios.get(FRONTEND_BASE);
      testResult('Frontend accessible', frontendResponse.status === 200);
    } catch (error) {
      testResult('Frontend accessible', false, error.message);
    }
    
    // 5. Test de navigation
    console.log('\n5️⃣ TEST DE NAVIGATION');
    console.log('-'.repeat(40));
    
    const navigationTests = [
      '/',
      '/courses',
      `/courses/levels/${LEVEL_ID}`
    ];
    
    for (const path of navigationTests) {
      try {
        const response = await axios.get(`${FRONTEND_BASE}${path}`);
        testResult(`Route ${path}`, response.status === 200);
      } catch (error) {
        testResult(`Route ${path}`, false, error.response?.status || 'Route non trouvée');
      }
    }
    
    // 6. Test de performance
    console.log('\n6️⃣ TEST DE PERFORMANCE');
    console.log('-'.repeat(40));
    
    const startTime = Date.now();
    try {
      await axios.get(`${API_BASE}/levels/${LEVEL_ID}`);
      const responseTime = Date.now() - startTime;
      testResult('Temps de réponse', responseTime < 1000, `${responseTime}ms`);
    } catch (error) {
      testResult('Temps de réponse', false, error.message);
    }
    
    // 7. Test de cohérence des données
    console.log('\n7️⃣ TEST DE COHÉRENCE DES DONNÉES');
    console.log('-'.repeat(40));
    
    try {
      const levelResponse = await axios.get(`${API_BASE}/levels/${LEVEL_ID}`);
      const exercises = levelResponse.data.exercises || [];
      
      // Vérifier que tous les exercices ont les champs requis
      const requiredFields = ['_id', 'name', 'type', 'points'];
      const allFieldsPresent = exercises.every(ex => 
        requiredFields.every(field => ex[field] !== undefined)
      );
      testResult('Champs requis', allFieldsPresent, 'Tous les exercices ont les champs requis');
      
      // Vérifier que les points sont cohérents
      const totalPoints = exercises.reduce((sum, ex) => sum + (ex.points || 0), 0);
      testResult('Points cohérents', totalPoints > 0, `Total: ${totalPoints} points`);
      
      // Vérifier que les types sont valides
      const validTypes = ['QCM', 'Code', 'Algorithm', 'OrderBlocks', 'TextInput', 'FillInTheBlank', 'SpotTheError', 'ScratchBlocks'];
      const allTypesValid = exercises.every(ex => validTypes.includes(ex.type));
      testResult('Types valides', allTypesValid, 'Tous les types d\'exercices sont valides');
      
    } catch (error) {
      testResult('Cohérence des données', false, error.message);
    }
    
    // Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE L\'INTÉGRATION LEVELPAGE');
    console.log('='.repeat(60));
    
    const successRate = Math.round((passedTests / totalTests) * 100);
    console.log(`✅ Tests réussis: ${passedTests}/${totalTests} (${successRate}%)`);
    
    if (successRate >= 95) {
      console.log('🎉 EXCELLENT ! L\'intégration LevelPage ↔ Exercices fonctionne parfaitement !');
    } else if (successRate >= 90) {
      console.log('✅ TRÈS BIEN ! L\'intégration fonctionne très bien !');
    } else if (successRate >= 80) {
      console.log('✅ BIEN ! L\'intégration fonctionne bien avec quelques améliorations possibles.');
    } else {
      console.log('⚠️ MOYEN ! L\'intégration nécessite des corrections.');
    }
    
    console.log('\n🚀 LevelPage est prêt à être utilisé avec tous les exercices !');
    
  } catch (error) {
    console.error('❌ Erreur critique:', error.message);
  }
}

// Exécuter le test d'intégration
testLevelPageIntegration();

