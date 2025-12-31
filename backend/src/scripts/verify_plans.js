require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const listPlans = async () => {
    await connectDB();
    try {
        const plans = await Plan.find({});
        console.log(`Found ${plans.length} plans.`);
        plans.forEach(p => {
            console.log(`- ${p._id}: Name='${p.name}', Type='${p.type}'`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

listPlans();
