const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testTaskAuthorization() {
    console.log('=== TEST AUTORISATION DES TÂCHES ===\n');

    try {
        // 1. Login en tant qu'étudiant
        console.log('1. Login étudiant...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin2@test.com', // Utilisez votre email étudiant
            password: 'password123'
        });

        const token = loginRes.data.token;
        const userId = loginRes.data.user.id || loginRes.data.user._id;

        console.log('   ✅ Connecté');
        console.log('   User ID:', userId);
        console.log('   Token:', token.substring(0, 20) + '...');

        // 2. Tester l'accès aux propres tâches
        console.log('\n2. Test accès aux propres tâches...');
        console.log(`   URL: ${API_URL}/assigned-tasks/children/${userId}/tasks`);

        try {
            const tasksRes = await axios.get(`${API_URL}/assigned-tasks/children/${userId}/tasks`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('   ✅ SUCCÈS! Tâches récupérées:', tasksRes.data.length);

            if (tasksRes.data.length > 0) {
                console.log('\n   📋 Première tâche:');
                const task = tasksRes.data[0];
                console.log('   - ID:', task._id);
                console.log('   - Titre:', task.templateId?.title || 'N/A');
                console.log('   - Status:', task.status);
                console.log('   - Métriques:', task.metricsCurrent);
            } else {
                console.log('\n   ⚠️ Aucune tâche assignée à cet utilisateur');
                console.log('   Pour tester complètement, assignez une tâche via l\'admin');
            }

        } catch (error) {
            if (error.response) {
                console.log('   ❌ ÉCHEC!');
                console.log('   Status:', error.response.status);
                console.log('   Message:', error.response.data.message);

                if (error.response.status === 403) {
                    console.log('\n   🔴 PROBLÈME: Le serveur backend n\'a pas été redémarré!');
                    console.log('   Solution: Redémarrez le serveur backend avec "npm start"');
                }
            } else {
                throw error;
            }
        }

        // 3. Créer une tâche de test (si admin)
        console.log('\n3. Vérification des permissions admin...');
        const user = loginRes.data.user;
        const isAdmin = user.roles && user.roles.includes('admin');

        if (isAdmin) {
            console.log('   ✅ Utilisateur est admin');

            // Créer un modèle de tâche
            console.log('\n4. Création d\'un modèle de tâche...');
            try {
                const templateRes = await axios.post(`${API_URL}/admin/task-templates`, {
                    title: 'Tâche de Test Autorisation',
                    description: 'Test pour vérifier les autorisations',
                    target: {
                        exercises_submitted: 1,
                        levels_completed: 0,
                        hours_spent: 0
                    },
                    recurrence: {
                        type: 'daily'
                    }
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const templateId = templateRes.data._id;
                console.log('   ✅ Modèle créé:', templateId);

                // Assigner la tâche à soi-même
                console.log('\n5. Assignation de la tâche...');
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);

                await axios.post(`${API_URL}/assigned-tasks/assign`, {
                    templateId,
                    childIds: [userId],
                    startDate: now.toISOString(),
                    endDate: tomorrow.toISOString()
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('   ✅ Tâche assignée');

                // Vérifier à nouveau
                console.log('\n6. Vérification finale...');
                const finalRes = await axios.get(`${API_URL}/assigned-tasks/children/${userId}/tasks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('   ✅ Tâches trouvées:', finalRes.data.length);
                console.log('\n   ✅ ✅ ✅ TEST COMPLET RÉUSSI!');

            } catch (adminError) {
                console.log('   ⚠️ Erreur lors de la création de tâche:', adminError.response?.data?.message || adminError.message);
            }
        } else {
            console.log('   ℹ️ Utilisateur n\'est pas admin (normal pour un étudiant)');
        }

        console.log('\n' + '='.repeat(60));
        console.log('RÉSUMÉ');
        console.log('='.repeat(60));
        console.log('User ID:', userId);
        console.log('Endpoint testé:', `/assigned-tasks/children/${userId}/tasks`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testTaskAuthorization();
