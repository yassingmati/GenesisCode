const mongoose = require('mongoose');
const AssignedTask = require('./src/models/AssignedTask');
require('dotenv').config();

async function reproduceIssue() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB:', mongoose.connection.name);

        const today = new Date();
        const from = today.toISOString().split('T')[0];
        const to = from;

        // 1. Create a dummy task for today
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const testTask = new AssignedTask({
            templateId: new mongoose.Types.ObjectId(), // Fake ID
            childId: new mongoose.Types.ObjectId(), // Fake ID
            periodStart: today,
            periodEnd: tomorrow, // Ends tomorrow at 00:00
            status: 'active',
            metricsCurrent: {},
            metricsTarget: {},
            recurrenceType: 'daily'
        });

        await testTask.save();
        console.log('Created test task:', testTask._id);

        // 2. Query with Fixed Logic
        const fromDate = new Date(from);
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);

        const query = {
            // childId: testTask.childId, // Optional: filter by child if needed
            periodStart: { $lte: toDate },
            periodEnd: { $gte: fromDate }
        };

        console.log('Query (Correct Logic):', JSON.stringify(query, null, 2));
        const result = await AssignedTask.find(query);
        console.log('Found tasks (Fixed Logic):', result.length);

        // Cleanup
        await AssignedTask.findByIdAndDelete(testTask._id);
        console.log('Deleted test task');

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

reproduceIssue();
