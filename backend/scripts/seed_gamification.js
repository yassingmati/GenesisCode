// scripts/seed_gamification.js
const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

// WARNING: Contains credentials. Do not commit this file to public repos.
const MONGO_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

const BADGES = {
    XP_NOVICE: { id: 'XP_NOVICE', trigger: 100 },
    XP_APPRENTICE: { id: 'XP_APPRENTICE', trigger: 500 },
    XP_MASTER: { id: 'XP_MASTER', trigger: 1000 },
    STREAK_3: { id: 'STREAK_3', random: 0.3 }, // 30% chance
    FIRST_EXERCISE: { id: 'FIRST_EXERCISE', random: 0.8 } // 80% chance
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            // 1. Generate Random XP
            const addedDaily = getRandomInt(0, 300);
            const addedMonthly = getRandomInt(addedDaily, 1500); // Monthly includes daily usually
            const totalXP = getRandomInt(addedMonthly, 5000);

            // We update directly for seeding purposes
            const userUpdate = {
                totalXP: totalXP,
                xpStats: {
                    daily: addedDaily,
                    monthly: addedMonthly,
                    lastDailyReset: new Date(),
                    lastMonthlyReset: new Date()
                },
                badges: []
            };

            // 2. Determine Badges
            // XP Badges
            if (totalXP >= 100) userUpdate.badges.push('XP_NOVICE');
            if (totalXP >= 500) userUpdate.badges.push('XP_APPRENTICE');
            if (totalXP >= 1000) userUpdate.badges.push('XP_MASTER');

            // Random Badges
            if (Math.random() < BADGES.STREAK_3.random) userUpdate.badges.push('STREAK_3');
            if (Math.random() < BADGES.FIRST_EXERCISE.random) userUpdate.badges.push('FIRST_EXERCISE');

            // Preserve existing badges if any ? Actually let's just merge them if we wanted, 
            // but for "give badges to all" replacing or merging is fine.
            // Let's merge to be safe.
            const existingBadges = user.badges || [];
            const finalBadges = [...new Set([...existingBadges, ...userUpdate.badges])];

            userUpdate.badges = finalBadges;

            await User.findByIdAndUpdate(user._id, userUpdate);
            console.log(`Updated user ${user.email}: XP=${totalXP}, Badges=${finalBadges.length}`);
        }

        console.log('Seeding completed successfully!');

    } catch (err) {
        console.error('Seeding Failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

seedData();
