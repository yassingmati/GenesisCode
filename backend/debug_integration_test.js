
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log('Starting Pure API Integration Test...');

        // 1. Login as Admin
        console.log('1. Logging in as Admin...');
        let adminToken;
        let adminId;
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email: 'admin2@test.com',
                password: 'password123'
            });
            adminToken = res.data.token;
            adminId = res.data.user.id;
            console.log('   Admin logged in.');
        } catch (e) {
            console.error('   Failed to login as admin:', e.response?.data || e.message);
            return;
        }

        // 2. Register a new Student
        const studentEmail = `debug_student_${Date.now()}@test.com`;
        console.log(`2. Registering Student (${studentEmail})...`);
        let studentToken;
        let studentId;
        try {
            const res = await axios.post(`${API_URL}/auth/register`, {
                email: studentEmail,
                password: 'password123',
                userType: 'student'
            });
            studentToken = res.data.token;
            studentId = res.data.user.id;
            console.log('   Student registered:', studentId);
        } catch (e) {
            console.error('   Failed to register student:', e.response?.data || e.message);
            return;
        }

        // 3. Create Task Template
        console.log('3. Creating Task Template...');
        let templateId;
        try {
            const res = await axios.post(`${API_URL}/admin/task-templates`, {
                title: 'Debug Task',
                description: 'Debug Description',
                target: { exercises_submitted: 1, levels_completed: 0, hours_spent: 0 },
                recurrence: { type: 'daily' }
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            templateId = res.data._id;
            console.log('   Template created:', templateId);
        } catch (e) {
            console.error('   Failed to create template:', e.response?.data || e.message);
            return;
        }

        // 4. Assign Task
        console.log('4. Assigning Task...');
        try {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);

            await axios.post(`${API_URL}/assigned-tasks/assign`, {
                templateId,
                childIds: [studentId],
                startDate: now.toISOString(),
                endDate: tomorrow.toISOString()
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('   Task assigned.');
        } catch (e) {
            console.error('   Failed to assign task:', e.response?.data || e.message);
            return;
        }

        // 5. Create Content via API
        console.log('5. Creating Content via API...');
        let exerciseId;
        try {
            // Create Category (if needed)
            let categoryId;
            try {
                const cats = await axios.get(`${API_URL}/courses/categories`, { headers: { Authorization: `Bearer ${adminToken}` } });
                if (cats.data.length > 0) categoryId = cats.data[0]._id;
                else {
                    const catRes = await axios.post(`${API_URL}/courses/categories`, {
                        translations: { fr: { name: 'Debug Cat', description: 'Debug' }, en: { name: 'Debug Cat', description: 'Debug' }, ar: { name: 'Debug Cat', description: 'Debug' } },
                        type: 'classic'
                    }, { headers: { Authorization: `Bearer ${adminToken}` } });
                    categoryId = catRes.data._id;
                }
            } catch (e) {
                console.log('   Failed to fetch/create category, trying without...');
            }

            // Create Path
            const pathPayload = {
                translations: { fr: { name: 'Debug Path', description: 'Debug' }, en: { name: 'Debug Path', description: 'Debug' }, ar: { name: 'Debug Path', description: 'Debug' } }
            };
            if (categoryId) pathPayload.category = categoryId;

            const pathRes = await axios.post(`${API_URL}/courses/paths`, pathPayload, { headers: { Authorization: `Bearer ${adminToken}` } });
            const pathId = pathRes.data._id;
            console.log('   Path created:', pathId);

            // Create Level
            const levelRes = await axios.post(`${API_URL}/courses/levels`, {
                translations: { fr: { title: 'Debug Level', content: 'Debug' }, en: { title: 'Debug Level', content: 'Debug' }, ar: { title: 'Debug Level', content: 'Debug' } },
                path: pathId,
                order: 1
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            const levelId = levelRes.data._id;
            console.log('   Level created:', levelId);

            // Create Exercise
            const exerciseRes = await axios.post(`${API_URL}/courses/exercises`, {
                translations: { fr: { name: 'Debug Ex', question: '?' }, en: { name: 'Debug Ex', question: '?' }, ar: { name: 'Debug Ex', question: '?' } },
                type: 'Code',
                points: 10,
                level: levelId,
                testCases: [{ input: '1', expected: '1', public: true }]
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            exerciseId = exerciseRes.data._id;
            console.log('   Exercise created:', exerciseId);

        } catch (e) {
            console.error('   Failed to create content:', e.response?.data || e.message);
            return;
        }

        // 6. Submit Exercise as Student
        console.log('6. Submitting Exercise...');
        try {
            const res = await axios.post(`${API_URL}/courses/exercises/${exerciseId}/submit`, {
                answer: { passed: true },
                userId: studentId,
                passed: true
            }, { headers: { Authorization: `Bearer ${studentToken}` } });
            console.log('   Submission response:', JSON.stringify(res.data, null, 2));
        } catch (e) {
            console.error('   Failed to submit exercise:', e.response?.data || e.message);
            return;
        }

        // 7. Verify AssignedTask Update via API
        console.log('7. Verifying AssignedTask status via API...');
        // Wait a moment for async processing
        await new Promise(r => setTimeout(r, 2000));

        try {
            // Use Admin/Parent endpoint to check tasks
            const tasksRes = await axios.get(`${API_URL}/assigned-tasks/children/${studentId}/tasks`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });

            const tasks = tasksRes.data;
            if (tasks.length > 0) {
                const task = tasks[0];
                console.log('   Task Status:', task.status);
                console.log('   Task Metrics:', task.metricsCurrent);

                if (task.metricsCurrent.exercises_submitted >= 1) {
                    console.log('SUCCESS: Task updated correctly!');
                } else {
                    console.error('FAILURE: Task did not update (exercises_submitted is 0).');
                }
            } else {
                console.error('FAILURE: No tasks found for student.');
            }
        } catch (e) {
            console.error('   Failed to fetch tasks:', e.response?.data || e.message);
        }

    } catch (err) {
        console.error('Test Error:', err);
    }
}

runTest();
