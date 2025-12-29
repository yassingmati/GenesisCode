const mongoose = require('mongoose');
const User = require('../src/models/User');
const AccessControlService = require('../src/services/accessControlService');
const Path = require('../src/models/Path');
const Level = require('../src/models/Level');
const Subscription = require('../src/models/Subscription');
const Plan = require('../src/models/Plan');

require('dotenv').config();

async function run() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI missing');
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Test Admin (Regression)
        const admin = await User.findOne({ roles: 'admin' });
        if (admin) {
            const path = await Path.findOne();
            if (path) {
                console.log(`\n--- Admin Test (${admin.email}) ---`);
                const acc = await AccessControlService.checkUserAccess(admin._id, path._id);
                console.log('Admin Access:', acc.hasAccess, acc.source);
            }
        }

        // 2. Test Student with Active Sub
        // Find active sub
        const activeSub = await Subscription.findOne({ status: 'active' }).populate('user');
        if (activeSub && activeSub.user) {
            console.log(`\n--- Student Sub Test (${activeSub.user.email}) ---`);
            const path = await Path.findOne(); // Assume global plan for simplicity or check plan
            const acc = await AccessControlService.checkUserAccess(activeSub.user._id, path._id);
            console.log('Student Sub Access:', acc.hasAccess, acc.source);
        }

        // 3. Test Student WITHOUT Access (Free First Lesson)
        // Create a temp user if needed, or find one without sub
        const freeUser = await User.findOne({
            roles: { $ne: 'admin' },
            'subscription.status': { $ne: 'active' } // Rough check
        });

        if (freeUser) {
            console.log(`\n--- Student Free Test (${freeUser.email}) ---`);
            const path = await Path.findOne();
            if (path) {
                const levels = await Level.find({ path: path._id }).sort({ order: 1 });
                if (levels.length > 0) {
                    // First level
                    const acc1 = await AccessControlService.checkUserAccess(freeUser._id, path._id, levels[0]._id);
                    console.log(`Level 1 (Free): ${acc1.hasAccess} (${acc1.source})`);

                    if (levels.length > 1) {
                        // Second level (Should be locked unless sequential unlocked)
                        const acc2 = await AccessControlService.checkUserAccess(freeUser._id, path._id, levels[1]._id);
                        console.log(`Level 2 (Locked?): ${acc2.hasAccess} (${acc2.reason})`);
                    }
                }
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
