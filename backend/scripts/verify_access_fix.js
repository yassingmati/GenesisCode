const mongoose = require('mongoose');
const User = require('../src/models/User');
const AccessControlService = require('../src/services/accessControlService');
const Path = require('../src/models/Path');
require('dotenv').config();

async function verifyFix() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI missing');
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Find an Admin User
        console.log('\n--- Searching for Admin User ---');
        const adminUser = await User.findOne({
            $or: [
                { roles: 'admin' },
                { role: 'admin' }
            ]
        });

        if (!adminUser) {
            console.log('No Admin found to test.');
            return;
        }
        console.log(`Testing with Admin: ${adminUser.email}`);

        // 2. Find any Path
        const path = await Path.findOne();
        if (!path) {
            console.log('No path found.');
            return;
        }

        // 3. Check Access
        console.log(`Checking access for Path: ${path._id}`);
        const access = await AccessControlService.checkUserAccess(adminUser._id, path._id);

        console.log('Access Result:', JSON.stringify(access, null, 2));

        if (access.hasAccess && access.source === 'admin_bypass') {
            console.log('SUCCESS: Admin bypass works!');
        } else {
            console.error('FAILURE: Admin bypass failed.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

verifyFix();
