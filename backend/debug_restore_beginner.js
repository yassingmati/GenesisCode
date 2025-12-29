const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
const Plan = require('./src/models/Plan');
const CategoryPlan = require('./src/models/CategoryPlan');
require('dotenv').config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
};

const checkAndRestore = async () => {
    await connectDB();
    try {
        const userId = '6946e406164e7e166b4b9422';
        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found:', userId);
            return;
        }
        console.log(`Found User: ${user.email} (${user._id})`);

        // Check current subscription
        const sub = await Subscription.findOne({ user: userId });
        if (sub) {
            console.log('Subscription already exists:', sub);
            return;
        } else {
            console.log('No subscription found.');
        }

        // Find "Beginner" or "Débutant" Plan
        // Trying to find a Plan or details matching "Débutant"
        // Based on previous logs, we didn't see "Débutant" in Levels, but maybe it's a Plan name?
        // Or maybe "Introduction"?

        console.log('Searching for plans...');
        const plans = await Plan.find({
            $or: [
                { name: /Débutant/i },
                { name: /Beginner/i },
                { 'translations.fr.name': /Débutant/i }
            ]
        });

        console.log('Plans found:', plans);

        if (plans.length > 0) {
            const plan = plans[0];
            console.log(`Restoring Subscription for Plan: ${plan.name} (${plan._id})`);

            const newSub = new Subscription({
                user: userId,
                plan: plan._id,
                planModel: 'Plan',
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                autoRenew: false
            });
            await newSub.save();
            console.log('Subscription restored!');
        } else {
            console.log('Plan "Débutant" not found. Listing all plans to choose manually if needed.');
            const allPlans = await Plan.find({});
            allPlans.forEach(p => console.log(`- ${p.name} (${p._id})`));
        }

    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
};

checkAndRestore();
