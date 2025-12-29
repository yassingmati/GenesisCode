const mongoose = require('mongoose');
const Subscription = require('./src/models/Subscription');
const Plan = require('./src/models/Plan');
const CategoryPlan = require('./src/models/CategoryPlan');
const User = require('./src/models/User');
require('dotenv').config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const subs = await Subscription.find().limit(5).sort({ createdAt: -1 });

    console.log(`Found ${subs.length} recent subscriptions.`);

    for (const sub of subs) {
        console.log('------------------------------------------------');
        console.log(`Sub ID: ${sub._id}`);
        console.log(`Raw User ID: ${sub.user} (Type: ${typeof sub.user})`);
        console.log(`Raw Plan ID: ${sub.plan} (Type: ${typeof sub.plan})`);
        console.log(`Plan Model: ${sub.planModel}`);

        // Test explicit populate
        await sub.populate('user');
        await sub.populate('plan');

        console.log(`> Populated User:`, sub.user ? `${sub.user.firstName} (${sub.user.email})` : 'NULL');
        console.log(`> Populated Plan:`, sub.plan ? `${sub.plan.name} (Type: ${sub.plan.constructor.modelName})` : 'NULL');

        // If null, check if the document exists manually
        if (!sub.user) {
            const userCheck = await User.findById(sub.user);
            console.log(`  -> Manual User Lookup: ${userCheck ? 'FOUND' : 'NOT FOUND'}`);
        }
        if (!sub.plan) {
            let planCheck = null;
            if (sub.planModel === 'CategoryPlan') {
                planCheck = await CategoryPlan.findById(sub.plan);
            } else {
                planCheck = await Plan.findById(sub.plan);
            }
            console.log(`  -> Manual Plan Lookup (${sub.planModel}): ${planCheck ? 'FOUND' : 'NOT FOUND'}`);
        }

        // Test Normalization Logic
        const subObj = sub.toObject();
        let planName = 'Plan Inconnu';

        if (sub.plan) {
            if (sub.planModel === 'CategoryPlan') {
                // Mimic controller logic
                planName = sub.plan.translations?.fr?.name || sub.plan.translations?.en?.name || 'Plan Catégorie';
            } else {
                planName = sub.plan.name;
            }
        }
        console.log(`> Normalized Plan Name: "${planName}"`);
        console.log('------------------------------------------------');
    }

    process.exit();
};

run();
