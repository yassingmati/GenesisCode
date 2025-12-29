const mongoose = require('mongoose');
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

const clearSubs = async () => {
    await connectDB();
    try {
        const deleteResult = await Subscription.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} subscriptions.`);
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

clearSubs();
