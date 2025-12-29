
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');

const userId = '6946e406164e7e166b4b9422';
const firebaseUid = 'PY78xbFNWkT0fpN1PblcAWVqHdu2';

async function checkUser() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log(`Checking for user with ID: ${userId}`);
    let user = await User.findById(userId);

    if (!user) {
        console.log('User not found by ID. Checking by Firebase UID:', firebaseUid);
        user = await User.findOne({ firebaseUid: firebaseUid });
    }

    if (!user) {
        console.log('User not found by Firebase UID either.');
        const allUsers = await User.find().limit(5);
        console.log('First 5 users in DB:', allUsers.map(u => ({ id: u._id, uid: u.firebaseUid, email: u.email })));
        process.exit(0);
    }

    console.log(`User found: ${user._id} (${user.email})`);
    console.log('User embedded subscription:', user.subscription);

    const subscriptions = await Subscription.find({ user: user._id });
    console.log('User separate subscriptions:', subscriptions);

    process.exit(0);
}

checkUser();
