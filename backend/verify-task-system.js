const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TaskTemplate = require('./src/models/TaskTemplate');
const AssignedTask = require('./src/models/AssignedTask');
const User = require('./src/models/User');

const runTest = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Create a Template
        console.log('Creating Template...');
        const template = await TaskTemplate.create({
            title: 'Test Daily Task',
            recurrence: { type: 'daily' },
            metrics: ['exercises_submitted'],
            target: { exercises_submitted: 5 },
            active: true
        });
        console.log('Template created:', template._id);

        // 2. Find a student
        const student = await User.findOne({ userType: 'student' });
        if (!student) {
            console.log('No student found, skipping assignment test');
        } else {
            // 3. Assign Task
            console.log('Assigning Task...');
            const now = new Date();
            const periodStart = new Date(now.setHours(0, 0, 0, 0));
            const periodEnd = new Date(now.setHours(23, 59, 59, 999));

            const assigned = await AssignedTask.create({
                templateId: template._id,
                childId: student._id,
                periodStart,
                periodEnd,
                recurrenceType: 'daily',
                metricsTarget: template.target
            });
            console.log('Task Assigned:', assigned._id);

            // 4. Verify Assignment
            const found = await AssignedTask.findById(assigned._id);
            if (found && found.childId.toString() === student._id.toString()) {
                console.log('✅ Assignment Verified');
            } else {
                console.error('❌ Assignment Failed');
            }

            // Cleanup assigned task
            await AssignedTask.findByIdAndDelete(assigned._id);
        }

        // Cleanup template
        await TaskTemplate.findByIdAndDelete(template._id);
        console.log('Cleanup done');

        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
};

runTest();
