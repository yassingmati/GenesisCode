const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/courses';

async function debugFillInTheBlank() {
  try {
    // 1. Récupérer l'exercice FillInTheBlank
    const levelResponse = await axios.get(`${API_BASE}/levels/68c973738b6e19e85d67e35a`);
    const fillInTheBlankExercise = levelResponse.data.exercises.find(ex => ex.type === 'FillInTheBlank');
    
    if (!fillInTheBlankExercise) {
      console.log('❌ Exercice FillInTheBlank non trouvé');
      return;
    }
    
    console.log('🔍 Exercice FillInTheBlank trouvé:');
    console.log('   ID:', fillInTheBlankExercise._id);
    console.log('   Nom:', fillInTheBlankExercise.name);
    console.log('   Solutions:', fillInTheBlankExercise.solutions);
    
    // 2. Tester différentes réponses
    const testAnswers = ['dynamique', 'Dynamique', 'DYNAMIQUE', ' dynamique ', 'dynamique '];
    
    for (const answer of testAnswers) {
      console.log(`\n🧪 Test avec la réponse: "${answer}"`);
      
      try {
        const submitResponse = await axios.post(`${API_BASE}/exercises/${fillInTheBlankExercise._id}/submit`, {
          answer: answer,
          userId: 'debug-user'
        });
        
        console.log('   ✅ Soumission réussie');
        console.log('   📊 Résultat:', submitResponse.data.correct ? 'Correct' : 'Incorrect');
        console.log('   🎯 Points:', `${submitResponse.data.pointsEarned}/${submitResponse.data.pointsMax}`);
        console.log('   📝 Détails:', submitResponse.data.details);
        
        if (submitResponse.data.correct) {
          console.log('   🎉 Cette réponse fonctionne !');
          break;
        }
      } catch (error) {
        console.log('   ❌ Erreur:', error.response?.data?.error || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

debugFillInTheBlank();

