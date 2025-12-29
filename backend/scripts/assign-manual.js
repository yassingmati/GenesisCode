const mongoose = require('mongoose');
const AssignedTask = require('../src/models/AssignedTask');
const TaskTemplate = require('../src/models/TaskTemplate'); // Ensure this model exists or use generic
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

const assignTasks = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI missing');
        console.log(`Connecting to: ${uri.split('@')[1]}`);
        await mongoose.connect(uri);
        console.log('Connected.');

        const childId = '6946e406164e7e166b4b9422'; // yassin gmati
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // 1. Find or Create Templates
        let templates = await TaskTemplate.find({});
        if (templates.length === 0) {
            console.log('No templates found. Creating defaults...');
            const defaults = [
                { title: 'Compléter 5 Exercices', description: 'Faire 5 exercices de code', target: { exercises_submitted: 5 }, xpReward: 50 },
                { title: 'Apprendre pendant 1 heure', description: 'Rester actif sur la plateforme', target: { hours_spent: 1 }, xpReward: 30 },
                { title: 'Compléter 2 Niveaux', description: 'Finir 2 niveaux de cours', target: { levels_completed: 2 }, xpReward: 100 }
            ];
            templates = await TaskTemplate.insertMany(defaults);
        }

        console.log(`Found ${templates.length} templates.`);

        // 2. Assign to Child
        const tasksToCreate = templates.map(t => ({
            templateId: t._id,
            childId: childId,
            periodStart: today,
            periodEnd: todayEnd,
            recurrenceType: 'daily',
            metricsTarget: t.target || { exercises_submitted: 5 }, // fallback
            metricsCurrent: { exercises_submitted: 0, levels_completed: 0, hours_spent: 0 },
            status: 'pending',
            autoRenew: true,
            xpReward: t.xpReward || 50,
            title: t.title, // Some backends might duplicate title here
            description: t.description
        }));

        // Check if already assigned
        const existing = await AssignedTask.find({ childId, periodStart: { $gte: today } });
        if (existing.length > 0) {
            console.log(`User already has ${existing.length} tasks for today.`);
        } else {
            const result = await AssignedTask.insertMany(tasksToCreate);
            console.log(`✅ Assigned ${result.length} tasks to child ${childId}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

assignTasks();
