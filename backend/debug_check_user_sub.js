const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
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

const checkUserSub = async () => {
    await connectDB();
    try {
        const email = 'yassine.gmatii@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User Subscription Data:', user.subscription);

        if (user.subscription && user.subscription.planId) {
            console.log('Found embedded subscription data! Attempting recovery...');

            const existingSub = await Subscription.findOne({ user: user._id });
            if (existingSub) {
                console.log('Subscription document already exists (created by previous script?).');
            } else {
                console.log('Creating Subscription document from User data...');
                const newSub = new Subscription({
                    user: user._id,
                    plan: user.subscription.planId,
                    status: user.subscription.status || 'active',
                    currentPeriodEnd: user.subscription.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    konnectPaymentId: user.subscription.konnectPaymentId,
                    planModel: 'Plan' // Assumption, usually embedded is for global plan
                });
                await newSub.save();
                console.log('Restored Subscription:', newSub._id);
            }
        } else {
            console.log('No embedded subscription data found in User document.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

checkUserSub();
