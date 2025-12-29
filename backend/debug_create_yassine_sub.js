const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
require('dotenv').config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
};

const createSub = async () => {
    await connectDB();
    try {
        const email = 'yassine.gmatii@gmail.com';
        const user = await User.findOne({ email });
        if (!user) { console.log('User not found'); return; }

        const catPlanId = '6932babc3d010d0030187bff'; // Java Category Plan
        const pathId = '6932bab9ab7588ce73b7a593'; // Bases Java Path

        const newSub = new Subscription({
            user: user._id,
            plan: catPlanId,
            planModel: 'CategoryPlan',
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            autoRenew: false,
            grantedAccess: [{
                path: pathId,
                grantedAt: new Date()
            }]
        });

        await newSub.save();
        console.log('Created Subscription:', newSub._id);
        console.log('Restored access to Java Category and Bases Java Path.');

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

createSub();
