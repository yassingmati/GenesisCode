const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function findUserAndTest() {
    console.log('=== RECHERCHE UTILISATEUR ET TEST ===\n');

    try {
        // 1. Login admin
        console.log('1. Login admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin2@test.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('   ✅ Admin connecté\n');

        // 2. Chercher l'utilisateur yassin gmati
        console.log('2. Recherche de l\'utilisateur yassin gmati...');
        const userId = '690b905603482021a66e5bc5';

        // Essayer de récupérer les infos via l'API admin
        try {
            const userRes = await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const user = userRes.data.find(u => u._id === userId);
            if (user) {
                console.log('   ✅ Utilisateur trouvé:');
                console.log('      Email:', user.email);
                console.log('      Nom:', user.firstName, user.lastName);
                console.log('      Type:', user.userType);

                // 3. Login en tant qu'utilisateur
                console.log('\n3. Tentative de connexion en tant qu\'utilisateur...');
                try {
                    const userLoginRes = await axios.post(`${API_URL}/auth/login`, {
                        email: user.email,
                        password: 'password123'
                    });

                    const userToken = userLoginRes.data.token;
                    console.log('   ✅ Connexion réussie!\n');

                    // 4. Récupérer les tâches
                    console.log('4. Récupération des tâches...');
                    const tasksRes = await axios.get(`${API_URL}/assigned-tasks/my-tasks`, {
                        headers: { Authorization: `Bearer ${userToken}` }
                    });

                    console.log(`   ✅ ${tasksRes.data.length} tâche(s) trouvée(s)\n`);

                    if (tasksRes.data.length > 0) {
                        console.log('   📋 Détails des tâches:');
                        tasksRes.data.forEach((task, i) => {
                            console.log(`\n   ${i + 1}. ${task.templateId?.title || 'Sans titre'}`);
                            console.log(`      Status: ${task.status}`);
                            console.log(`      Auto-renew: ${task.autoRenew ? 'Oui' : 'Non'}`);
                            console.log(`      Période: ${new Date(task.periodStart).toLocaleDateString()} - ${new Date(task.periodEnd).toLocaleDateString()}`);
                            console.log(`      Objectif: ${task.metricsTarget.exercises_submitted} exercice(s)`);
                            console.log(`      Progression: ${task.metricsCurrent.exercises_submitted}/${task.metricsTarget.exercises_submitted}`);
                        });
                    }

                    console.log('\n✅ ✅ ✅ TEST RÉUSSI!');
                    console.log(`\n📝 Pour se connecter:`);
                    console.log(`   Email: ${user.email}`);
                    console.log(`   Password: password123`);
                    console.log(`   URL: http://localhost:3000/dashboard/taches-du-jour`);

                } catch (loginErr) {
                    console.log('   ❌ Échec de connexion');
                    console.log('   Le mot de passe par défaut ne fonctionne pas');
                    console.log(`   Email testé: ${user.email}`);
                }
            } else {
                console.log('   ❌ Utilisateur non trouvé dans la liste');
            }
        } catch (err) {
            console.log('   ❌ Erreur lors de la récupération des utilisateurs');
        }

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

findUserAndTest();
