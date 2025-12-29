const mongoose = require('mongoose');
const AssignedTask = require('../src/models/AssignedTask');
const User = require('../src/models/User');
const TaskTemplate = require('../src/models/TaskTemplate');
const path = require('path');
const { renewDailyTasks } = require('../src/jobs/taskRenewalCron');

// Load env from backend root
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

const checkTasks = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is missing from .env');
        }
        // Extract username between // and :
        const username = uri.match(/\/\/(.*?):/)?.[1] || 'Unknown';
        console.log(`Connecting to MongoDB with User: ${username}`);
        console.log(`Connecting to URI: ${uri.split('@')[1] || 'Unknown'}`);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        console.log('\n--- Listing All Users to find match ---');
        const allUsers = await User.find({});
        allUsers.forEach(u => console.log(`- ${u.firstName} ${u.lastName} (${u.email}) [${u._id}]`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

checkTasks();
