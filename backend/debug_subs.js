const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
require('dotenv').config();

async function debugSubs() {
    try {
        const MONGO_URI = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Also log the collection names to verify where we are
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const email = 'yassine.gmatii@gmail.com';
        const user = await User.findOne({ email })
            .populate('subscriptions');

        if (!user) {
            console.log('User not found');
            return;
        }

        // Check for duplicate users
        const users = await User.find({ email: { $regex: 'yassine', $options: 'i' } });
        console.log('Users found with "yassine":', users.map(u => ({ id: u._id, email: u.email })));

        // List all subscriptions and their owners
        const allSubs = await Subscription.find().populate('user');
        console.log('Total subscriptions in DB:', allSubs.length);

        // Dump ALL subscriptions to see who owns them
        console.log('--- DUMPING ALL SUBSCRIPTIONS ---');
        allSubs.forEach(s => {
            console.log(`Sub ID: ${s._id}, User: ${s.user?.email} (${s.user?._id}), Plan: ${s.plan}, Status: ${s.status}`);
        });

        // Validating CategoryAccess
        const CategoryAccess = require('./src/models/CategoryAccess');
        const catAccess = await CategoryAccess.find({ user: user._id });
        console.log('CategoryAccess for yassine.gmatii@gmail.com:', catAccess.length);
        console.log(JSON.stringify(catAccess, null, 2));

        const targetSubs = allSubs.filter(s => s.user && s.user.email === 'yassine.gmatii@gmail.com');
        console.log('Subscriptions for yassine.gmatii@gmail.com:', targetSubs.length);
        if (targetSubs.length > 0) {
            console.log('First target sub:', JSON.stringify(targetSubs[0], null, 2));
        } else {
            // Did we find any for the specific ID?
            const idSubs = allSubs.filter(s => s.user && s.user._id.toString() === '6946e406164e7e166b4b9422');
            console.log('Subscriptions for ID 6946e406164e7e166b4b9422:', idSubs.length);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

debugSubs();
