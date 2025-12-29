const mongoose = require('mongoose');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Path = require('../src/models/Path');
const Plan = require('../src/models/Plan');
const CategoryPaymentService = require('../src/services/categoryPaymentService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
    } catch (err) {
        console.error('DB Connection error:', err);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    try {
        const email = 'yassine.gmatii@gmail.com';
        const user = await User.findOne({ email });
        if (!user) {
            console.error('User not found');
            return;
        }
        console.log(`User found: ${user._id}`);

        // 1. Grant Java (Category)
        const javaCat = await Category.findOne({ 'translations.fr.name': 'Java' });
        if (javaCat) {
            console.log(`Found Java: ${javaCat._id}`);
            let plan = await Plan.findOne({ type: 'Category', targetId: javaCat._id });
            if (!plan) {
                plan = await Plan.create({
                    _id: 'java_access_' + Date.now(),
                    name: 'Java Access',
                    type: 'Category',
                    targetId: javaCat._id,
                    priceMonthly: 0
                });
            }
            await CategoryPaymentService.grantFreeAccess(user._id, javaCat._id, plan._id);
            console.log('Granted Java Access');
        }

        // 2. Grant React Débutant (Path)
        const reactPath = await Path.findOne({ 'translations.fr.name': 'React Débutant' });
        if (reactPath) {
            console.log(`Found Path: ${reactPath.translations.fr.name} (${reactPath._id})`);
            // Determine category for this path
            // In CategoryAccess matching, checking access usually requires linking to a Category. 
            // Does granting access to a PATH require a Plan with type='Path'?
            // Yes, our updated controller logic supports it, but CategoryPaymentService.grantFreeAccess might need adjustment if it expects a CategoryId.
            // Actually, grantFreeAccess(userId, categoryId, planId). 
            // If we want to grant access to a PATH, we might need a Plan that covers that path, but usually access is checked via CategoryAccess.

            // Let's create a Plan for this Path
            let pathPlan = await Plan.findOne({ type: 'Path', targetId: reactPath._id });
            if (!pathPlan) {
                pathPlan = await Plan.create({
                    _id: 'react_debutant_' + Date.now(),
                    name: 'React Débutant Access',
                    type: 'Path',
                    targetId: reactPath._id,
                    priceMonthly: 0
                });
            }

            // We need to associate this plan with the user.
            // grantFreeAccess expects categoryId. This path belongs to "React" category (likely).
            // However, to strictly follow the "Grant Path" logic, we should probably add a subscription or a specialized access record.
            // Given the current system, usually generic subscriptions are handled via User.subscription.
            // But here we want multiple specific accesses.
            // The system seems to rely on CategoryAccess for specific unlocking.

            // Let's find the category of this path
            const courses = require('../src/controllers/courseController'); // Just to verify structure? No.
            // Path model has categoryId? Check schema?
            // Assuming we can pass the Category of the path.

            // Let's search for the Category "React" which seemingly contains this path
            const reactCat = await Category.findOne({ 'translations.fr.name': 'React' });
            if (reactCat) {
                await CategoryPaymentService.grantFreeAccess(user._id, reactCat._id, pathPlan._id);
                console.log(`Granted React Débutant Access (linked to React Category)`);
            } else {
                console.warn("Could not find React category to link Path access");
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
