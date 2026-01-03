
const mongoose = require('mongoose');
const AssignedTask = require('../src/models/AssignedTask');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const tasks = await AssignedTask.find({});
        console.log(`Total Assigned Tasks: ${tasks.length}`);

        const duplicates = {};

        tasks.forEach(task => {
            // Create a key based on child, template, and the start date (ignoring time if possible, or just the day)
            const dateStr = task.periodStart ? new Date(task.periodStart).toISOString().split('T')[0] : 'no-date';
            const key = `${task.childId}-${task.templateId}-${dateStr}`;

            if (!duplicates[key]) {
                duplicates[key] = [];
            }
            duplicates[key].push(task._id);
        });

        let duplicateCount = 0;
        let totalDuplicates = 0;

        for (const [key, ids] of Object.entries(duplicates)) {
            if (ids.length > 1) {
                console.log(`Duplicate found for ${key}: ${ids.length} copies`);
                duplicateCount++;
                totalDuplicates += (ids.length - 1);
            }
        }

        console.log(`Found ${duplicateCount} sets of duplicates.`);
        console.log(`Total extra tasks to potentially delete: ${totalDuplicates}`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
