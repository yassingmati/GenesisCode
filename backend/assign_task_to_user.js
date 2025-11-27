const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function assignTaskToUser() {
    console.log('=== ASSIGNATION DE TÂCHE À L\'UTILISATEUR ===\n');

    const targetUserId = '690b905603482021a66e5bc5'; // L'utilisateur du navigateur

    try {
        // 1. Login admin
        console.log('1. Login admin...');
        const adminRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin2@test.com',
            password: 'password123'
        });

        const adminToken = adminRes.data.token;
        console.log('   ✅ Admin connecté');

        // 2. Vérifier que l'utilisateur existe
        console.log('\n2. Vérification de l\'utilisateur cible...');
        console.log('   User ID:', targetUserId);

        // 3. Créer un modèle de tâche
        console.log('\n3. Création d\'un modèle de tâche...');
        const templateRes = await axios.post(`${API_URL}/admin/task-templates`, {
            title: 'Ma Première Tâche',
            description: 'Complétez un exercice pour commencer!',
            target: {
                exercises_submitted: 1,
                levels_completed: 0,
                hours_spent: 0
            },
            recurrence: {
                type: 'daily'
            }
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const templateId = templateRes.data._id;
        console.log('   ✅ Modèle créé:', templateId);

        // 4. Assigner la tâche
        console.log('\n4. Assignation de la tâche à l\'utilisateur...');
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        await axios.post(`${API_URL}/assigned-tasks/assign`, {
            templateId,
            childIds: [targetUserId],
            startDate: now.toISOString(),
            endDate: tomorrow.toISOString()
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log('   ✅ Tâche assignée!');
        console.log('   Période:', now.toISOString(), '→', tomorrow.toISOString());

        // 5. Vérifier l'assignation
        console.log('\n5. Vérification...');
        const tasksRes = await axios.get(`${API_URL}/assigned-tasks/children/${targetUserId}/tasks`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log('   ✅ Tâches trouvées:', tasksRes.data.length);

        if (tasksRes.data.length > 0) {
            console.log('\n   📋 Tâches assignées:');
            tasksRes.data.forEach((task, i) => {
                console.log(`   ${i + 1}. ${task.templateId?.title || 'Sans titre'}`);
                console.log(`      Status: ${task.status}`);
                console.log(`      Objectif: ${task.metricsTarget.exercises_submitted} exercice(s)`);
                console.log(`      Progression: ${task.metricsCurrent.exercises_submitted}/${task.metricsTarget.exercises_submitted}`);
            });
        }

        console.log('\n✅ ✅ ✅ SUCCÈS COMPLET!');
        console.log('\nMaintenant, rechargez la page /dashboard/taches-du-jour dans le navigateur!');

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        console.error('Stack:', error.stack);
    }
}

assignTaskToUser();
