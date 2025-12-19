const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

const CategoryPlan = require('../models/CategoryPlan');
const Category = require('../models/Category');

const verifyPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB:', mongoose.connection.name);
        console.log('Host:', mongoose.connection.host);

        const collectionName = CategoryPlan.collection.name;
        console.log(`Model 'CategoryPlan' uses collection: '${collectionName}'`);

        const plans = await CategoryPlan.find({}).lean();
        console.log(`\nTotal plans in DB: ${plans.length}`);

        console.log('--- ALL PLANS IN DB ---');
        plans.forEach(p => {
            console.log(`ID: ${p._id} | Active: ${p.active} | Price: ${p.price}`);
        });

        console.log('\n--- FIND ALL ACTIVE ---');
        const activePlans = await CategoryPlan.findAllActive();
        console.log(`Active plans count: ${activePlans.length}`);
        activePlans.forEach(p => {
            console.log(`ID: ${p._id} | Active: ${p.active} | Price: ${p.price} | Order: ${p.order}`);
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyPlans();
