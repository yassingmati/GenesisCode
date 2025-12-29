const mongoose = require('mongoose');
const Subscription = require('./src/models/Subscription');
const Plan = require('./src/models/Plan');
const CategoryPlan = require('./src/models/CategoryPlan'); // Fix: Require CategoryPlan
const User = require('./src/models/User');
require('dotenv').config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
};

const listSubs = async () => {
    await connectDB();
    try {
        const email = 'yassine.gmatii@gmail.com';
        const user = await User.findOne({ email });

        if (!user) { console.log('User not found'); return; }

        const subs = await Subscription.find({ user: user._id }).populate('plan');

        console.log(`Subscriptions for ${email} (${subs.length}):`);
        subs.forEach(s => {
            console.log(`- ID: ${s._id} | Status: ${s.status} | Plan: ${s.planModel === 'CategoryPlan' ? (s.plan?.translations?.fr?.name || s.plan || 'Unresolved CatPlan') : (s.plan?.name || s.plan || 'Unresolved Plan')}`);
            console.log(`  Dates: ${s.currentPeriodStart?.toISOString().split('T')[0]} -> ${s.currentPeriodEnd?.toISOString().split('T')[0]}`);
            if (s.metadata?.migratedFromCategoryAccess) console.log('  [MIGRATED FROM OLD RECORD]');
        });

    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
};

listSubs();
