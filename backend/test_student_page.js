const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testStudentPage() {
    console.log('=== TEST PAGE ÉTUDIANT ===\n');

    try {
        // L'email de yassin gmati est yassine.gmatii@gmail.com
        const email = 'yassine.gmatii@gmail.com';
        const password = 'password123'; // Mot de passe par défaut

        console.log('1. Tentative de connexion...');
        console.log(`   Email: ${email}`);

        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });

        const token = loginRes.data.token;
        const user = loginRes.data.user;

        console.log('   ✅ Connexion réussie!');
        console.log(`   Utilisateur: ${user.firstName} ${user.lastName}`);
        console.log(`   ID: ${user.id || user._id}\n`);

        // 2. Récupérer les tâches
        console.log('2. Récupération des tâches...');
        const tasksRes = await axios.get(`${API_URL}/assigned-tasks/my-tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`   ✅ ${tasksRes.data.length} tâche(s) trouvée(s)\n`);

        if (tasksRes.data.length > 0) {
            console.log('   📋 Détails des tâches:');
            tasksRes.data.forEach((task, i) => {
                console.log(`\n   ${i + 1}. ${task.templateId?.title || 'Sans titre'}`);
                console.log(`      Status: ${task.status}`);
                console.log(`      Auto-renew: ${task.autoRenew ? '🔄 Oui' : 'Non'}`);
                console.log(`      Période: ${new Date(task.periodStart).toLocaleDateString()} - ${new Date(task.periodEnd).toLocaleDateString()}`);

                if (task.metricsTarget) {
                    console.log(`      Objectif:`);
                    if (task.metricsTarget.exercises_submitted > 0) {
                        console.log(`         - ${task.metricsTarget.exercises_submitted} exercice(s)`);
                    }
                    if (task.metricsTarget.levels_completed > 0) {
                        console.log(`         - ${task.metricsTarget.levels_completed} niveau(x)`);
                    }
                    if (task.metricsTarget.hours_spent > 0) {
                        console.log(`         - ${task.metricsTarget.hours_spent} heure(s)`);
                    }
                }

                if (task.metricsCurrent) {
                    console.log(`      Progression:`);
                    if (task.metricsTarget.exercises_submitted > 0) {
                        console.log(`         - Exercices: ${task.metricsCurrent.exercises_submitted}/${task.metricsTarget.exercises_submitted}`);
                    }
                    if (task.metricsTarget.levels_completed > 0) {
                        console.log(`         - Niveaux: ${task.metricsCurrent.levels_completed}/${task.metricsTarget.levels_completed}`);
                    }
                    if (task.metricsTarget.hours_spent > 0) {
                        console.log(`         - Temps: ${task.metricsCurrent.hours_spent}/${task.metricsTarget.hours_spent} h`);
                    }
                }
            });
        } else {
            console.log('   ℹ️ Aucune tâche assignée pour le moment');
        }

        console.log('\n' + '='.repeat(70));
        console.log('✅ ✅ ✅ TEST RÉUSSI!');
        console.log('='.repeat(70));
        console.log('\n📝 INFORMATIONS DE CONNEXION:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   URL: http://localhost:3000/dashboard/taches-du-jour`);
        console.log('\n💡 La page devrait afficher les tâches correctement!');

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }

        if (error.response?.status === 401) {
            console.log('\n💡 Le mot de passe par défaut ne fonctionne pas.');
            console.log('   Essayez de réinitialiser le mot de passe ou créez un nouvel utilisateur.');
        }
    }
}

testStudentPage();
