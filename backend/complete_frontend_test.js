const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function completeTest() {
    console.log('=== TEST COMPLET FRONTEND - MISE À JOUR DES TÂCHES ===\n');

    let adminToken, studentToken, studentId, templateId, exerciseId;

    try {
        // 1. Login Admin
        console.log('1. Login Admin...');
        const adminRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin2@test.com',
            password: 'password123'
        });
        adminToken = adminRes.data.token;
        console.log('   ✅ Admin connecté');

        // 2. Créer un étudiant de test
        console.log('\n2. Création d\'un étudiant de test...');
        const studentEmail = `test_student_${Date.now()}@test.com`;
        const studentRes = await axios.post(`${API_URL}/auth/register`, {
            email: studentEmail,
            password: 'password123',
            userType: 'student'
        });
        studentToken = studentRes.data.token;
        studentId = studentRes.data.user.id;
        console.log('   ✅ Étudiant créé:', studentId);
        console.log('   Email:', studentEmail);

        // 3. Créer un modèle de tâche
        console.log('\n3. Création d\'un modèle de tâche...');
        const templateRes = await axios.post(`${API_URL}/admin/task-templates`, {
            title: 'Test Tâche Frontend',
            description: 'Tâche de test pour vérifier les mises à jour',
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
        templateId = templateRes.data._id;
        console.log('   ✅ Modèle créé:', templateId);

        // 4. Assigner la tâche à l'étudiant
        console.log('\n4. Assignation de la tâche...');
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        await axios.post(`${API_URL}/assigned-tasks/assign`, {
            templateId,
            childIds: [studentId],
            startDate: now.toISOString(),
            endDate: tomorrow.toISOString()
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   ✅ Tâche assignée');
        console.log('   Période:', now.toISOString(), '→', tomorrow.toISOString());

        // 5. Vérifier les tâches assignées
        console.log('\n5. Vérification des tâches assignées...');
        const tasksRes = await axios.get(`${API_URL}/assigned-tasks/children/${studentId}/tasks`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   ✅ Tâches trouvées:', tasksRes.data.length);
        if (tasksRes.data.length > 0) {
            const task = tasksRes.data[0];
            console.log('   Status:', task.status);
            console.log('   Métriques actuelles:', task.metricsCurrent);
            console.log('   Métriques cibles:', task.metricsTarget);
        }

        // 6. Créer du contenu (Path/Level/Exercise)
        console.log('\n6. Création de contenu pour le test...');

        // Récupérer ou créer une catégorie
        let categoryId;
        const catsRes = await axios.get(`${API_URL}/courses/categories`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (catsRes.data.length > 0) {
            categoryId = catsRes.data[0]._id;
            console.log('   ✅ Catégorie existante utilisée:', categoryId);
        } else {
            const catRes = await axios.post(`${API_URL}/courses/categories`, {
                translations: {
                    fr: { name: 'Test Cat', description: 'Test' },
                    en: { name: 'Test Cat', description: 'Test' },
                    ar: { name: 'Test Cat', description: 'Test' }
                },
                type: 'classic'
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            categoryId = catRes.data._id;
            console.log('   ✅ Catégorie créée:', categoryId);
        }

        // Créer un Path
        const pathRes = await axios.post(`${API_URL}/courses/paths`, {
            translations: {
                fr: { name: 'Test Path', description: 'Test' },
                en: { name: 'Test Path', description: 'Test' },
                ar: { name: 'Test Path', description: 'Test' }
            },
            category: categoryId
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const pathId = pathRes.data._id;
        console.log('   ✅ Path créé:', pathId);

        // Créer un Level
        const levelRes = await axios.post(`${API_URL}/courses/levels`, {
            translations: {
                fr: { title: 'Test Level', content: 'Test' },
                en: { title: 'Test Level', content: 'Test' },
                ar: { title: 'Test Level', content: 'Test' }
            },
            path: pathId,
            order: 1
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const levelId = levelRes.data._id;
        console.log('   ✅ Level créé:', levelId);

        // Créer un Exercise
        const exerciseRes = await axios.post(`${API_URL}/courses/exercises`, {
            translations: {
                fr: { name: 'Test Exercise', question: 'Question de test?' },
                en: { name: 'Test Exercise', question: 'Test question?' },
                ar: { name: 'Test Exercise', question: 'Test question?' }
            },
            type: 'Code',
            points: 10,
            level: levelId,
            testCases: [{ input: '1', expected: '1', public: true }]
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        exerciseId = exerciseRes.data._id;
        console.log('   ✅ Exercise créé:', exerciseId);

        // 7. Soumettre l'exercice en tant qu'étudiant (COMME LE FRONTEND)
        console.log('\n7. Soumission de l\'exercice (comme le frontend)...');
        const submitRes = await axios.post(`${API_URL}/courses/exercises/${exerciseId}/submit`, {
            answer: { passed: true },
            userId: studentId,  // MongoDB ID (comme le frontend devrait faire)
            passed: true
        }, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });

        console.log('   ✅ Exercice soumis');
        console.log('\n   📊 RÉPONSE DE SOUMISSION:');
        console.log(JSON.stringify(submitRes.data, null, 2));

        // 8. Vérifier taskUpdateDebug
        console.log('\n8. Analyse de taskUpdateDebug...');
        const debug = submitRes.data.taskUpdateDebug;
        if (!debug) {
            console.log('   ❌ ERREUR: taskUpdateDebug absent! Le serveur n\'a pas été redémarré.');
            return;
        }

        console.log('   executed:', debug.executed ? '✅' : '❌');
        console.log('   activeTasksFound:', debug.activeTasksFound);
        console.log('   tasksUpdated:', debug.tasksUpdated);
        console.log('   userIdReceived:', debug.userIdReceived);
        console.log('   userObjectIdResolved:', debug.userObjectIdResolved);

        if (debug.errors && debug.errors.length > 0) {
            console.log('   ❌ ERREURS:', debug.errors);
        }

        if (debug.activeTasksFound === 0) {
            console.log('\n   ⚠️ PROBLÈME: Aucune tâche active trouvée!');
            console.log('   Détails de la requête:');
            console.log('   - User ID:', debug.userObjectIdResolved);
            console.log('   - Query Time:', debug.queryTime);
            if (debug.activeTasks) {
                console.log('   - Tâches trouvées:', debug.activeTasks);
            }
        }

        // 9. Attendre un peu pour le traitement asynchrone
        console.log('\n9. Attente du traitement asynchrone (2 secondes)...');
        await new Promise(r => setTimeout(r, 2000));

        // 10. Vérifier les tâches après soumission
        console.log('\n10. Vérification des tâches après soumission...');
        const tasksAfterRes = await axios.get(`${API_URL}/assigned-tasks/children/${studentId}/tasks`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (tasksAfterRes.data.length > 0) {
            const task = tasksAfterRes.data[0];
            console.log('   Status:', task.status);
            console.log('   Métriques:', task.metricsCurrent);

            if (task.metricsCurrent.exercises_submitted >= 1) {
                console.log('\n   ✅ ✅ ✅ SUCCÈS! La tâche a été mise à jour correctement!');
            } else {
                console.log('\n   ❌ ÉCHEC: La tâche n\'a pas été mise à jour (exercises_submitted = 0)');
            }
        } else {
            console.log('   ❌ Aucune tâche trouvée');
        }

        // 11. Résumé final
        console.log('\n' + '='.repeat(60));
        console.log('RÉSUMÉ DU TEST');
        console.log('='.repeat(60));
        console.log('Étudiant ID:', studentId);
        console.log('Exercise ID:', exerciseId);
        console.log('taskUpdateDebug.executed:', debug?.executed);
        console.log('taskUpdateDebug.activeTasksFound:', debug?.activeTasksFound);
        console.log('taskUpdateDebug.tasksUpdated:', debug?.tasksUpdated);
        console.log('Métriques finales:', tasksAfterRes.data[0]?.metricsCurrent);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        console.error('Stack:', error.stack);
    }
}

completeTest();
