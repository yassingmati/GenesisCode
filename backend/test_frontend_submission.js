const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testFrontendSubmission() {
    console.log('=== Test de Soumission Frontend ===\n');

    // 1. Login avec un utilisateur réel
    console.log('1. Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin2@test.com',  // Changez avec votre email
        password: 'password123'
    });

    const token = loginRes.data.token;
    const userId = loginRes.data.user.id;  // MongoDB ID
    console.log('   Token:', token.substring(0, 20) + '...');
    console.log('   User ID:', userId);
    console.log('   User:', loginRes.data.user);

    // 2. Récupérer les tâches assignées
    console.log('\n2. Récupération des tâches assignées...');
    try {
        const tasksRes = await axios.get(`${API_URL}/assigned-tasks/children/${userId}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Tâches trouvées:', tasksRes.data.length);
        if (tasksRes.data.length > 0) {
            console.log('   Première tâche:', JSON.stringify(tasksRes.data[0], null, 2));
        }
    } catch (e) {
        console.log('   Erreur:', e.response?.data || e.message);
    }

    // 3. Trouver un exercice à soumettre
    console.log('\n3. Recherche d\'un exercice...');
    const pathsRes = await axios.get(`${API_URL}/courses/paths`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (pathsRes.data.length === 0) {
        console.log('   Aucun parcours trouvé!');
        return;
    }

    const pathId = pathsRes.data[0]._id;
    console.log('   Path ID:', pathId);

    const levelsRes = await axios.get(`${API_URL}/courses/levels/path/${pathId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (levelsRes.data.length === 0) {
        console.log('   Aucun niveau trouvé!');
        return;
    }

    const levelId = levelsRes.data[0]._id;
    console.log('   Level ID:', levelId);

    const levelContentRes = await axios.get(`${API_URL}/courses/levels/${levelId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const exercises = levelContentRes.data.exercises || [];
    if (exercises.length === 0) {
        console.log('   Aucun exercice trouvé!');
        return;
    }

    const exerciseId = exercises[0]._id;
    console.log('   Exercise ID:', exerciseId);
    console.log('   Exercise Type:', exercises[0].type);

    // 4. Soumettre l'exercice (comme le frontend)
    console.log('\n4. Soumission de l\'exercice...');
    const submitRes = await axios.post(`${API_URL}/courses/exercises/${exerciseId}/submit`, {
        answer: { passed: true },
        userId: userId,  // Utiliser le MongoDB ID (comme le frontend devrait faire)
        passed: true
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });

    console.log('   Réponse:', JSON.stringify(submitRes.data, null, 2));

    // 5. Vérifier les tâches après soumission
    console.log('\n5. Vérification des tâches après soumission...');
    await new Promise(r => setTimeout(r, 1000));

    try {
        const tasksAfterRes = await axios.get(`${API_URL}/assigned-tasks/children/${userId}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Tâches après soumission:', tasksAfterRes.data.length);
        if (tasksAfterRes.data.length > 0) {
            console.log('   Première tâche:', JSON.stringify(tasksAfterRes.data[0], null, 2));
        }
    } catch (e) {
        console.log('   Erreur:', e.response?.data || e.message);
    }
}

testFrontendSubmission().catch(console.error);
