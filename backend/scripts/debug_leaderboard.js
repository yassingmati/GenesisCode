const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

// Using the ATLAS URI provided by user
const MONGO_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

async function debugLeaderboard() {
    try {
        console.log('Connecting to Atlas...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        // 1. Check strict count
        const count = await User.countDocuments();
        console.log(`Total Users: ${count}`);

        // 2. Check Daily Stats
        const usersWithDaily = await User.find({ 'xpStats.daily': { $gt: 0 } }).select('email xpStats.daily');
        console.log('Users with Daily XP:', usersWithDaily);

        // 3. Simulate Controller Logic
        const period = 'daily'; // Try daily first
        let sort = { totalXP: -1 };
        if (period === 'daily') sort = { 'xpStats.daily': -1 };
        if (period === 'monthly') sort = { 'xpStats.monthly': -1 };

        console.log(`Querying Leaderboard with sort:`, sort);
        const leaderboard = await User.find()
            .sort(sort)
            .select('firstName lastName email totalXP xpStats badges rank')
            .limit(10)
            .lean();

        console.log(`Leaderboard Results (${period}):`, leaderboard.length);
        if (leaderboard.length > 0) {
            leaderboard.forEach(u => console.log(`${u.email}: ${period === 'daily' ? u.xpStats?.daily : u.totalXP} XP`));
        } else {
            console.log('Leaderboard is EMPTY.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

debugLeaderboard();
