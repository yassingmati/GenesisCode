const mongoose = require('mongoose');
const Subscription = require('./src/models/Subscription');
const Plan = require('./src/models/Plan');
const CategoryPlan = require('./src/models/CategoryPlan');
const User = require('./src/models/User');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const checkSubs = async () => {
    await connectDB();
    try {
        const count = await Subscription.countDocuments();
        console.log(`Total Subscriptions: ${count}`);

        const subs = await Subscription.find({})
            .populate('user', 'email')
            .populate('plan')
            .limit(5);

        console.log('First 5 Subscriptions:');
        subs.forEach(sub => {
            console.log({
                id: sub._id,
                user: sub.user?.email,
                planModel: sub.planModel, // checking if this field exists on doc
                planId: sub.plan?._id,
                planName: sub.plan?.name || sub.plan?.translations?.fr?.name || 'No Plan Name',
                status: sub.status
            });
            // Log the raw plan field if populate failed
            if (!sub.plan) {
                console.log('Use of refPath validation: subscription.plan was null. Raw plan ID:', sub.get('plan'));
            }
        });

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

checkSubs();
