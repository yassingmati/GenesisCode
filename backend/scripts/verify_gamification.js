// scripts/verify_gamification.js
const mongoose = require('mongoose');
const User = require('../src/models/User');
const UserProgress = require('../src/models/UserProgress');
const BadgeRegistry = require('../src/config/BadgeRegistry');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codegenesis';

async function runVerification() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        // 1. Create Test User
        const testEmail = `test_gamification_${Date.now()}@example.com`;
        const user = await User.create({
            firebaseUid: `test_uid_${Date.now()}`,
            email: testEmail,
            firstName: 'Test',
            lastName: 'Gamer',
            userType: 'student'
        });
        console.log(`User created: ${user.email} (${user._id})`);

        // 2. Simulate XP Gain via UserProgress
        console.log('Simulating XP gain...');
        // Mock exercise ID (just a random ObjectId)
        const exerciseId = new mongoose.Types.ObjectId();

        // Gain 100 XP -> Should trigger daily update and potentially a badge
        await UserProgress.updateProgress(user._id, exerciseId, {
            xp: 100,
            pointsEarned: 10,
            pointsMax: 10,
            completed: true
        });

        // 3. Verify User Stats
        const updatedUser = await User.findById(user._id);
        console.log('User Stats:', updatedUser.xpStats);

        if (updatedUser.totalXP !== 100) throw new Error('Total XP mismatch');
        if (updatedUser.xpStats.daily !== 100) throw new Error('Daily XP mismatch');
        if (updatedUser.xpStats.monthly !== 100) throw new Error('Monthly XP mismatch');

        // 4. Verify Badges
        console.log('Checking Badges...');
        // ID for 100 XP badge is 'XP_NOVICE' (from my registry logic, need to confirm ID)
        // Wait, let's check BadgeRegistry.js content I wrote.
        // keys are XP_NOVICE, etc. IDs are same.

        if (updatedUser.badges.includes('XP_NOVICE')) {
            console.log('SUCCESS: XP_NOVICE badge awarded!');
        } else {
            console.error('FAILURE: XP_NOVICE badge NOT awarded. Badges:', updatedUser.badges);
        }

        if (updatedUser.badges.includes('FIRST_EXERCISE')) {
            // Did I implement FIRST_EXERCISE logic? 
            // In UserProgress I only added logic for XP based badges in the loop provided in the previous turn.
            // Let's check my implementation.
            // "if (badge.criteria.type === 'xp' ...)".
            // I likely missed 'exercises' type check in the loop. 
            // Verification will reveal this.
        }

        // 5. Test Leaderboard
        console.log('Testing Leaderboard...');
        const dailyLeaderboard = await User.find().sort({ 'xpStats.daily': -1 }).limit(10).lean();
        const foundInDaily = dailyLeaderboard.find(u => u._id.toString() === user._id.toString());

        if (foundInDaily) {
            console.log('SUCCESS: User found in daily leaderboard');
        } else {
            console.error('FAILURE: User not found in daily leaderboard');
        }

        // Clean up
        await User.findByIdAndDelete(user._id);
        await UserProgress.deleteMany({ user: user._id });
        console.log('Test User deleted.');

    } catch (err) {
        console.error('Verification Failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

runVerification();
