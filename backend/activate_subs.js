
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
require('dotenv').config();

const MONGO_URI = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0";

const activateSubs = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const email = 'genesiscodee@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found!`);
            return;
        }

        console.log(`Updating subscriptions for user: ${user._id}`);

        const result = await Subscription.updateMany(
            { user: user._id },
            { $set: { status: 'active' } }
        );

        console.log(`Updated ${result.modifiedCount} subscriptions to 'active'.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

activateSubs();
