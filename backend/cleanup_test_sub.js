
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');

async function cleanup() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'genesiscodee@gmail.com' });
    if (user) {
        console.log(`Cleaning up subscriptions for user: ${user._id}`);
        const res = await Subscription.deleteMany({ user: user._id, plan: '6946e406164e7e166b4b9422' });
        console.log(`Deleted ${res.deletedCount} test subscriptions.`);

        // Restore legacy if needed? No, keeping it canceled is fine as new code ignores it.
        // Actually, maybe better to set it to null to be clean.
        user.subscription = { status: null };
        await user.save();
        console.log('Reset legacy subscription field.');
    }

    process.exit(0);
}

cleanup();
