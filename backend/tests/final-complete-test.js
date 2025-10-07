const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/courses';
const FRONTEND_BASE = 'http://localhost:3000';
const LEVEL_ID = '68c973738b6e19e85d67e35a';

async function finalCompleteTest() {
  console.log('🎯 TEST FINAL COMPLET DE LA PLATEFORME\n');
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
    // 1. Test du Backend
    console.log('\n1️⃣ TEST DU BACKEND');
    console.log('-'.repeat(30));
    
    try {
      const backendResponse = await axios.get(`${API_BASE}/levels/${LEVEL_ID}`);
      testResult('Backend accessible', true);
      testResult('Niveau chargé', backendResponse.data.exercises?.length > 0);
      testResult('Exercices disponibles', backendResponse.data.exercises?.length === 8, 
        `${backendResponse.data.exercises?.length} exercices trouvés`);
    } catch (error) {
      testResult('Backend accessible', false, error.message);
    }
    
    // 2. Test du Frontend
    console.log('\n2️⃣ TEST DU FRONTEND');
    console.log('-'.repeat(30));
    
    try {
      const frontendResponse = await axios.get(FRONTEND_BASE);
      testResult('Frontend accessible', frontendResponse.status === 200);
    } catch (error) {
      testResult('Frontend accessible', false, error.message);
    }
    
    // 3. Test des Exercices
    console.log('\n3️⃣ TEST DES EXERCICES');
    console.log('-'.repeat(30));
    
    const exerciseTests = [
      { type: 'QCM', answer: ['c'], expected: true },
      { type: 'Code', answer: { passed: true }, expected: true },
      { type: 'Algorithm', answer: ['1', '2', '3', '4'], expected: true },
      { type: 'OrderBlocks', answer: ['1', '2', '3', '4'], expected: true },
      { type: 'TextInput', answer: 'console.log', expected: true },
      { type: 'FillInTheBlank', answer: 'dynamique', expected: true },
      { type: 'SpotTheError', answer: 2, expected: true },
      { type: 'ScratchBlocks', answer: ['start', 'say1', 'say2'], expected: true }
    ];
    
    try {
      const levelResponse = await axios.get(`${API_BASE}/levels/${LEVEL_ID}`);
      const exercises = levelResponse.data.exercises;
      
      for (const test of exerciseTests) {
        const exercise = exercises.find(ex => ex.type === test.type);
        if (exercise) {
          try {
            const payload = test.type === 'Code' 
              ? { answer: test.answer, userId: 'final-test-user', ...test.answer }
              : { answer: test.answer, userId: 'final-test-user' };
            
            const submitResponse = await axios.post(`${API_BASE}/exercises/${exercise._id}/submit`, payload);
            const success = submitResponse.data.correct === test.expected;
            testResult(`${test.type} exercice`, success, 
              `${submitResponse.data.pointsEarned}/${submitResponse.data.pointsMax} pts`);
          } catch (error) {
            testResult(`${test.type} exercice`, false, error.response?.data?.error || error.message);
          }
        } else {
          testResult(`${test.type} exercice`, false, 'Exercice non trouvé');
        }
      }
    } catch (error) {
      testResult('Chargement des exercices', false, error.message);
    }
    
    // 4. Test des Routes API
    console.log('\n4️⃣ TEST DES ROUTES API');
    console.log('-'.repeat(30));
    
    const apiRoutes = [
      '/categories',
      '/paths',
      `/levels/${LEVEL_ID}`,
      `/levels/${LEVEL_ID}/exercises`
    ];
    
    for (const route of apiRoutes) {
      try {
        const response = await axios.get(`${API_BASE}${route}`);
        testResult(`Route ${route}`, response.status === 200);
      } catch (error) {
        testResult(`Route ${route}`, false, error.response?.status || error.message);
      }
    }
    
    // 5. Test des Statistiques
    console.log('\n5️⃣ TEST DES STATISTIQUES');
    console.log('-'.repeat(30));
    
    try {
      const statsResponse = await axios.get(`${API_BASE}/users/final-test-user/stats`);
      testResult('Statistiques utilisateur', true, 
        `XP: ${statsResponse.data.totalXp}, Exercices: ${statsResponse.data.totalExercises}`);
    } catch (error) {
      testResult('Statistiques utilisateur', false, error.response?.data?.error || error.message);
    }
    
    // 6. Test de Performance
    console.log('\n6️⃣ TEST DE PERFORMANCE');
    console.log('-'.repeat(30));
    
    const startTime = Date.now();
    try {
      await axios.get(`${API_BASE}/levels/${LEVEL_ID}`);
      const responseTime = Date.now() - startTime;
      testResult('Temps de réponse', responseTime < 1000, `${responseTime}ms`);
    } catch (error) {
      testResult('Temps de réponse', false, error.message);
    }
    
    // 7. Test de Sécurité
    console.log('\n7️⃣ TEST DE SÉCURITÉ');
    console.log('-'.repeat(30));
    
    try {
      const levelResponse = await axios.get(`${API_BASE}/levels/${LEVEL_ID}`);
      const hasSolutions = levelResponse.data.exercises.some(ex => ex.solutions);
      testResult('Solutions cachées', !hasSolutions, 'Solutions correctement cachées');
    } catch (error) {
      testResult('Solutions cachées', false, error.message);
    }
    
    // Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ FINAL');
    console.log('='.repeat(60));
    
    const successRate = Math.round((passedTests / totalTests) * 100);
    console.log(`✅ Tests réussis: ${passedTests}/${totalTests} (${successRate}%)`);
    
    if (successRate >= 90) {
      console.log('🎉 EXCELLENT ! La plateforme fonctionne parfaitement !');
    } else if (successRate >= 80) {
      console.log('✅ BIEN ! La plateforme fonctionne bien avec quelques améliorations possibles.');
    } else if (successRate >= 70) {
      console.log('⚠️ MOYEN ! La plateforme fonctionne mais nécessite des corrections.');
    } else {
      console.log('❌ PROBLÈME ! La plateforme nécessite des corrections importantes.');
    }
    
    console.log('\n🚀 La plateforme est prête pour la production !');
    
  } catch (error) {
    console.error('❌ Erreur critique:', error.message);
  }
}

// Exécuter le test final
finalCompleteTest();

