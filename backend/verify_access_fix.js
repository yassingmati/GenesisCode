
const mongoose = require('mongoose');
require('dotenv').config();
const AccessControlService = require('./src/services/accessControlService');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
const Plan = require('./src/models/Plan');

const pathId = '694700e69f5918eff2b44bcc';
const levelId = '69244803c5bbbad53eb05c06';

async function verify() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Use the existing user
    const user = await User.findOne({ email: 'genesiscodee@gmail.com' });
    if (!user) {
        console.log('User genesiscodee@gmail.com not found for test.');
        process.exit(1);
    }
    console.log(`Using user: ${user._id}`);

    // 1. Ensure legacy subscription field is NOT active
    user.subscription = { status: 'canceled' };
    await user.save();
    console.log('Cleared legacy user.subscription field.');

    // 2. Create an ACTIVE subscription in Subscription collection
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    await Subscription.deleteMany({ user: user._id }); // Clear old subs

    const sub = await Subscription.create({
        user: user._id,
        plan: '6946e406164e7e166b4b9422', // Dummy plan ID, usually active plan is active
        status: 'active',
        currentPeriodEnd: futureDate,
        autoRenew: true
    });
    console.log('Created active Subscription document:', sub._id);

    // 3. Test Access Control
    console.log('Testing Access Control...');

    // Note: This might still fail with "Path not found" if the path doesn't exist, 
    // but we can check the logs to see if "Active subscription found" was printed.
    const access = await AccessControlService.checkUserAccess(user._id, pathId, levelId);

    console.log('Access Result:', JSON.stringify(access, null, 2));

    // Cleanup
    // await Subscription.findByIdAndDelete(sub._id);
    // console.log('Cleaned up test subscription');

    process.exit(0);
}

verify();
