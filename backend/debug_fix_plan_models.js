const mongoose = require('mongoose');
const Plan = require('./src/models/Plan');
const Subscription = require('./src/models/Subscription');
require('dotenv').config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
};

const fixPlanModels = async () => {
    await connectDB();
    try {
        const subs = await Subscription.find({ planModel: 'CategoryPlan' });
        console.log(`Checking ${subs.length} CategoryPlan subscriptions...`);

        for (const sub of subs) {
            const planId = sub.plan; // This is the ID stored
            console.log(`Sub ${sub._id} has plan ID: ${planId} (Type: ${typeof planId})`);

            if (typeof planId === 'string' && planId.length > 24) {
                // It's a long string, likely not ObjectId hex (24 chars)
                // Or it IS a timestamped string like 'java_access_plan_176...'
            }

            // Check if this ID exists in Plan collection
            const planExists = await Plan.findById(planId);
            if (planExists) {
                console.log(`- Found in Plan collection! Updating planModel to 'Plan'.`);
                sub.planModel = 'Plan';
                await sub.save();
                console.log(`-- Updated.`);
            } else {
                console.log(`- Not found in Plan collection.`);
                // If it's not in Plan, and it's a String, it definitely won't be in CategoryPlan (ObjectId).
                // So it's a broken reference or a missing Plan.
                // We might need to recreate the Plan or map it to a CategoryPlan.
            }
        }

    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
};

fixPlanModels();
