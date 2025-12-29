const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
const Plan = require('./src/models/Plan');
require('dotenv').config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
};

const restoreChild = async () => {
    await connectDB();
    try {
        // Target: Enfant Test
        const email = 'enfant_test@codegenesis.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('Enfant user not found.');
            return;
        }
        console.log(`Found Target User: ${user.email} (${user._id})`);

        // Find Débutant Plan
        let plan = await Plan.findOne({
            $or: [
                { name: /Débutant/i },
                { name: /Beginner/i },
                { 'translations.fr.name': /Débutant/i }
            ]
        });

        if (!plan) {
            console.log('Plan "Débutant" not found. Searching for *any* plan...');
            // Fallback: Find the cheapest active plan
            plan = await Plan.findOne({ active: true }).sort({ priceMonthly: 1 });
        }

        if (!plan) {
            console.log('No plans available to subscribe to.');
            return;
        }

        console.log(`Subscribing user to Plan: ${plan.name} (${plan._id})`);

        // Create Sub
        const newSub = new Subscription({
            user: user._id,
            plan: plan._id,
            planModel: 'Plan',
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            autoRenew: true
        });

        await newSub.save();
        console.log('Subscription restored for Enfant Test:', newSub._id);

    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
};

restoreChild();
