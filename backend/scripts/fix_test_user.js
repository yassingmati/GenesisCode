require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const admin = require('../src/utils/firebaseAdmin');
const User = require('../src/models/User');

const MONGODB_URI = process.env.MONGODB_URI;

const fixUser = async (email, password, xp) => {
    try {
        console.log(`\n--- Fixing user ${email} ---`);

        // 1. SKIP Firebase (Assuming it's handled remotely or ignored locally)
        console.log('Skipping Firebase check (Local Mode)');

        // 2. Update MongoDB User
        const user = await User.findOne({ email });
        if (user) {
            console.log(`Found MongoDB user: ${user._id}`);

            // user.firebaseUid = ...; // Don't touch UID, let login sync it
            user.totalXP = xp;
            user.xpStats = {
                daily: 150,
                monthly: xp,
                lastDailyReset: new Date(),
                lastMonthlyReset: new Date()
            };

            // Add a badge if applicable
            if (xp >= 100 && !user.badges.includes('XP_NOVICE')) {
                user.badges.push('XP_NOVICE');
            }

            // Ensure isVerified
            user.isVerified = true;
            user.isProfileComplete = true;

            await user.save();
            console.log('MongoDB user updated (XP + Badges).');
        } else {
            console.warn('MongoDB user not found! (Should have been created by setup script)');
        }

    } catch (error) {
        console.error(`Error fixing ${email}:`, error);
    }
};

async function main() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await fixUser('parent_test@codegenesis.com', 'Password123!', 150);
        await fixUser('enfant_test@codegenesis.com', 'Password123!', 350);

        console.log('\nFix complete.');
    } catch (error) {
        console.error('Script error:', error);
    } finally {
        await mongoose.disconnect();
        // admin.app().delete(); // Cleanup firebase connection if needed, though typically process exit handles it
        process.exit(0);
    }
}

main();
