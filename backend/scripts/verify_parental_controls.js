const mongoose = require('mongoose');
const User = require('../src/models/User');
const ParentChild = require('../src/models/ParentChild');
const UserActivity = require('../src/models/UserActivity');
const accessControlService = require('../src/services/accessControlService'); // Just for context, controls are middleware
// We need to simulate the implementation of parental middleware logic,
// as we can't easily spin up a full express app in a script without more work.
// Instead, we will replicate the middleware logic against database data.

require('dotenv').config();

async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Find or create a Parent and Child
        console.log('Setting up Parent/Child...');
        let parent = await User.findOne({ email: 'parent_test@example.com' });
        if (!parent) {
            parent = await User.create({
                email: 'parent_test@example.com',
                userType: 'parent',
                firebaseUid: 'test_parent_uid', // fake
                username: 'ParentTest'
            });
        }

        let child = await User.findOne({ email: 'child_test@example.com' });
        if (!child) {
            child = await User.create({
                email: 'child_test@example.com',
                userType: 'student', // 'child' invalid, 'student' correct per schema
                firebaseUid: 'test_child_uid', // fake
                username: 'ChildTest'
            });
        }

        // 2. Set strict controls
        await ParentChild.deleteMany({ child: child._id });
        const relation = await ParentChild.create({
            parent: parent._id,
            child: child._id,
            status: 'active',
            parentalControls: {
                dailyTimeLimit: 1, // 1 minute limit
                allowedTimeSlots: [], // No specific slots, so default usually allowed unless empty means ??? logic check
                // Logic: if (allowedTimeSlots.length > 0 && !allowedSlot) -> block. If length 0, pass.
                // Let's test daily limit first.
                contentRestrictions: {
                    allowChat: false
                }
            }
        });

        console.log(`Relation created: ${relation._id}`);

        // 3. Simulate Activity to exceed limit
        // Create activity session
        const today = new Date();
        await UserActivity.deleteMany({ user: child._id });

        await UserActivity.create({
            user: child._id,
            loginTime: new Date(today.getTime() - 1000 * 60 * 10), // 10 mins ago
            logoutTime: new Date(today.getTime() - 1000 * 60 * 5), // 5 mins ago
            duration: 5, // 5 mins used
            sessionId: 'test_session_1'
        });

        // 4. Test logic (replicate middleware)
        console.log('Testing Daily Limit Enforcement...');
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const activities = await UserActivity.find({
            user: child._id,
            loginTime: { $gte: startOfDay }
        });

        const usedTime = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
        const limit = relation.parentalControls.dailyTimeLimit;

        console.log(`Used: ${usedTime}m, Limit: ${limit}m`);

        if (usedTime >= limit) {
            console.log('✅ SUCCESS: Time limit correctly identified as exceeded.');
        } else {
            console.error('❌ FAILURE: Time limit logic failed.');
        }

        // 5. Test Content Restriction (Chat)
        console.log('Testing Content Restriction (Chat)...');
        const restrictions = relation.parentalControls.contentRestrictions;
        if (restrictions.allowChat === false) {
            console.log('✅ SUCCESS: Chat restriction found.');
        } else {
            console.error('❌ FAILURE: Chat restriction missing.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
