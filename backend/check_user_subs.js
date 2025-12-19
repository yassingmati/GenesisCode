
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
const Plan = require('./src/models/Plan'); // Assuming Plan model exists
require('dotenv').config();

const MONGO_URI = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0";

const checkSubs = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const email = 'genesiscodee@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found!`);
            return;
        }

        console.log(`User found: ${user._id}`);

        const subs = await Subscription.find({ user: user._id }).populate('plan');

        if (subs.length === 0) {
            console.log('No subscriptions found for this user.');
        } else {
            console.log(`Found ${subs.length} subscriptions:`);
            subs.forEach((sub, index) => {
                console.log(`\n--- Subscription ${index + 1} ---`);
                console.log(`ID: ${sub._id}`);
                console.log(`Status: ${sub.status}`);
                console.log(`Plan: ${sub.plan ? sub.plan.name : (sub.categoryPlan ? sub.categoryPlan.name : 'Unknown/Direct Access')}`);
                console.log(`Start: ${sub.currentPeriodStart}`);
                console.log(`End: ${sub.currentPeriodEnd}`);
                console.log(`Cancel At Period End: ${sub.cancelAtPeriodEnd}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkSubs();
