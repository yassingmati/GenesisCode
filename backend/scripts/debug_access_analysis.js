const mongoose = require('mongoose');
const User = require('../src/models/User');
const Plan = require('../src/models/Plan');
const Subscription = require('../src/models/Subscription');
const AccessControlService = require('../src/services/accessControlService');
const CategoryAccess = require('../src/models/CategoryAccess');
const Path = require('../src/models/Path');
const Level = require('../src/models/Level');
require('dotenv').config();

async function runDebug() {
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
                { role: 'admin' },
                { userType: 'admin' }
            ]
        });

        if (adminUser) {
            console.log(`Found Admin: ${adminUser.email} (${adminUser._id})`);
            console.log('Roles:', adminUser.roles);
            console.log('Role:', adminUser.role);
        } else {
            console.log('No Admin found.');
        }

        // 2. Find a Student with Subscription
        console.log('\n--- Searching for Student with Active Subscription ---');
        const sub = await Subscription.findOne({ status: 'active' }).populate('user');
        let studentUser;
        if (sub && sub.user) {
            studentUser = sub.user;
            console.log(`Found Student with Sub: ${studentUser.email} (${studentUser._id})`);
            console.log(`Plan: ${sub.plan}`);
        } else {
            console.log('No active subscription found.');
            // Try finding any student
            studentUser = await User.findOne({ userType: 'student' });
            if (studentUser) {
                console.log(`Found Student (no verified sub yet): ${studentUser.email}`);
            }
        }

        // 3. Test Access for Student
        if (studentUser) {
            console.log(`\n--- Testing Access for Student: ${studentUser.email} ---`);
            // Find a path and level
            const level = await Level.findOne().populate('path');
            if (level && level.path) {
                console.log(`Testing Level: ${level._id} (Path: ${level.path._id})`);
                const access = await AccessControlService.checkUserAccess(
                    studentUser._id,
                    level.path._id,
                    level._id
                );
                console.log('Access Result:', JSON.stringify(access, null, 2));
            } else {
                console.log('No levels found to test.');
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

runDebug();
