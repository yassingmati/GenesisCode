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

const fixSubs = async () => {
    await connectDB();
    try {
        // 1. Delete subs with no plan (broken data)
        const deleteResult = await Subscription.deleteMany({ plan: { $exists: false } });
        console.log(`Deleted ${deleteResult.deletedCount} subscriptions without plan.`);

        // 2. Update remaining subs to have planModel = 'Plan' if missing
        const updateResult = await Subscription.updateMany(
            { planModel: { $exists: false } }, // filter
            { $set: { planModel: 'Plan' } }    // update
        );
        console.log(`Updated ${updateResult.modifiedCount} subscriptions with default planModel.`);

        const remaining = await Subscription.find({});
        console.log(`Remaining Subscriptions: ${remaining.length}`);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

fixSubs();
