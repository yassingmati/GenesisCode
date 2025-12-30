
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
const Plan = require('./src/models/Plan');
const CategoryPlan = require('./src/models/CategoryPlan');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const childEmail = 'yassine.gmatii@gmail.com';
        const child = await User.findOne({ email: childEmail });

        if (!child) {
            console.log('Child not found:', childEmail);
            return;
        }

        console.log('Child User:', {
            _id: child._id,
            email: child.email,
            parentAccount: child.parentAccount
        });

        const subs = await Subscription.find({ user: child._id }).populate('plan');
        console.log(`Found ${subs.length} subscriptions for child.`);

        subs.forEach((s, i) => {
            console.log(`Sub ${i + 1}:`);
            console.log('  ID:', s._id);
            console.log('  Status:', s.status);
            console.log('  PlanModel:', s.planModel);
            console.log('  Plan ID:', s.plan ? s.plan._id : 'N/A');
            console.log('  Plan Name:', s.plan ? (s.plan.name || s.plan.translations?.fr?.name) : 'N/A');
            console.log('  CurrentPeriodEnd:', s.currentPeriodEnd);
            console.log('  Is Active (Logic):', (s.status === 'active' || s.status === 'trialing'));
            console.log('  Is Future (Logic):', (new Date(s.currentPeriodEnd) > new Date()));
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
