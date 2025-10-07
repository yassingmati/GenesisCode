const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/courses';
const LEVEL_ID = '68c973738b6e19e85d67e35a';

async function testAPI() {
  console.log('🧪 Test complet de l\'API avec les nouveaux exercices\n');
  
  try {
    // 1. Test de chargement du niveau
    console.log('1️⃣ Test de chargement du niveau...');
    const levelResponse = await axios.get(`${API_BASE}/levels/${LEVEL_ID}`);
    console.log('✅ Niveau chargé avec succès');
    console.log(`   📝 Titre: ${levelResponse.data.translations?.fr?.title || 'Sans titre'}`);
    console.log(`   📊 Nombre d'exercices: ${levelResponse.data.exercises?.length || 0}`);
    
    if (levelResponse.data.exercises && levelResponse.data.exercises.length > 0) {
      console.log('\n📋 Liste des exercices:');
      levelResponse.data.exercises.forEach((ex, i) => {
        console.log(`   ${i+1}. ${ex.name || 'Sans nom'} (${ex.type}) - ${ex.points} pts`);
      });
    }
    
    // 2. Test de soumission pour chaque type d'exercice
    console.log('\n2️⃣ Test de soumission des exercices...');
    
    const testAnswers = {
      'QCM': ['c'],
      'Code': { passed: true }, // Format correct pour l'exercice Code
      'Algorithm': ['1', '2', '3', '4'],
      'OrderBlocks': ['1', '2', '3', '4'],
      'TextInput': 'console.log',
      'FillInTheBlank': 'dynamique',
      'SpotTheError': 2, // Juste le numéro, pas un array
      'ScratchBlocks': ['start', 'say1', 'say2']
    };
    
    let successCount = 0;
    let totalTests = 0;
    
    for (const exercise of levelResponse.data.exercises) {
      totalTests++;
      console.log(`\n   🧪 Test de l'exercice: ${exercise.name} (${exercise.type})`);
      
      try {
        const testAnswer = testAnswers[exercise.type];
        if (!testAnswer) {
          console.log(`   ⚠️ Pas de réponse de test pour ${exercise.type}`);
          continue;
        }
        
        // Pour l'exercice Code, nous devons envoyer les données dans le body, pas dans answer
        const payload = exercise.type === 'Code' 
          ? { answer: testAnswer, userId: 'test-user-fixed', ...testAnswer }
          : { answer: testAnswer, userId: 'test-user-fixed' };
        
        const submitResponse = await axios.post(`${API_BASE}/exercises/${exercise._id}/submit`, payload);
        
        if (submitResponse.data) {
          console.log(`   ✅ Soumission réussie`);
          console.log(`   📊 Résultat: ${submitResponse.data.correct ? 'Correct' : 'Incorrect'}`);
          console.log(`   🎯 Points: ${submitResponse.data.pointsEarned}/${submitResponse.data.pointsMax}`);
          console.log(`   ⭐ XP: ${submitResponse.data.xpEarned}`);
          successCount++;
        }
      } catch (error) {
        console.log(`   ❌ Erreur de soumission: ${error.response?.data?.error || error.message}`);
      }
    }
    
    // 3. Test des statistiques utilisateur
    console.log('\n3️⃣ Test des statistiques utilisateur...');
    try {
      const statsResponse = await axios.get(`${API_BASE}/users/test-user-123/stats`);
      console.log('✅ Statistiques utilisateur récupérées');
      console.log(`   📊 Données: ${JSON.stringify(statsResponse.data, null, 2)}`);
    } catch (error) {
      console.log(`   ⚠️ Statistiques non disponibles: ${error.response?.data?.error || error.message}`);
    }
    
    // 4. Test du progrès du niveau
    console.log('\n4️⃣ Test du progrès du niveau...');
    try {
      const progressResponse = await axios.get(`${API_BASE}/levels/${LEVEL_ID}/users/test-user-123/progress`);
      console.log('✅ Progrès du niveau récupéré');
      console.log(`   📊 Données: ${JSON.stringify(progressResponse.data, null, 2)}`);
    } catch (error) {
      console.log(`   ⚠️ Progrès non disponible: ${error.response?.data?.error || error.message}`);
    }
    
    // Résumé des tests
    console.log('\n📊 Résumé des tests:');
    console.log(`   ✅ Tests réussis: ${successCount}/${totalTests}`);
    console.log(`   📝 Exercices testés: ${levelResponse.data.exercises?.length || 0}`);
    console.log(`   🎯 Taux de réussite: ${Math.round((successCount / totalTests) * 100)}%`);
    
    if (successCount === totalTests) {
      console.log('\n🎉 Tous les tests sont passés avec succès !');
    } else {
      console.log('\n⚠️ Certains tests ont échoué, vérifiez les erreurs ci-dessus.');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response) {
      console.error('   📊 Détails:', error.response.data);
    }
  }
}

// Exécuter les tests
testAPI();
