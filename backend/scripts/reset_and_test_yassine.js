const mongoose = require('mongoose');
const User = require('../src/models/User');
const Subscription = require('../src/models/Subscription');
const CategoryAccess = require('../src/models/CategoryAccess');
const Category = require('../src/models/Category');
const CategoryPaymentService = require('../src/services/categoryPaymentService');
const AccessControlService = require('../src/services/accessControlService');
const Path = require('../src/models/Path');

require('dotenv').config();

async function run() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI missing');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'yassine.gmatii@gmail.com';
        let user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found! Creating...`);
            user = await User.create({
                email: email,
                firebaseUid: 'yassine_test_uid_' + Date.now(),
                username: 'YassineTest',
                userType: 'student'
            });
        }
        console.log(`User found/created: ${user._id}`);

        // 1. Reset Subscriptions & Access
        console.log('--- Resetting Access ---');
        const subRes = await Subscription.deleteMany({ user: user._id });
        const accessRes = await CategoryAccess.deleteMany({ user: user._id });
        console.log(`Deleted ${subRes.deletedCount} subscriptions and ${accessRes.deletedCount} category accesses.`);

        // 2. Grant Java Access
        console.log('--- Granting Java Access ---');
        // Search in translations - strict match for Java
        const javaCategory = await Category.findOne({
            $or: [
                { 'translations.fr.name': 'Java' },
                { 'translations.en.name': 'Java' },
                // Fallback to regex if exact match fails but be stricter
                { 'translations.fr.name': /^Java$/i },
                { 'translations.en.name': /^Java$/i }
            ]
        });

        if (!javaCategory) {
            console.error('Category "Java" not found (Strict match)! Searching loosely...');
            // Fallback loose
            const looseCat = await Category.findOne({
                $or: [
                    { 'translations.fr.name': { $regex: /java/i } },
                    { 'translations.en.name': { $regex: /java/i } }
                ]
            });
            if (looseCat) {
                console.log(`Found similar: ${looseCat.translations?.fr?.name}`);
            }

            const cats = await Category.find({}, 'translations');
            console.log('Available categories:', cats.map(c => c.translations?.fr?.name || c.translations?.en?.name));
            return;
        }

        const javaName = javaCategory.translations?.fr?.name || javaCategory.translations?.en?.name;
        console.log(`Found Java Category: ${javaName} (${javaCategory._id})`);

        // Find a plan for this category
        const Plan = require('../src/models/Plan');
        let plan = await Plan.findOne({ type: 'category', targetId: javaCategory._id });
        if (!plan) {
            console.log('No plan found for Java, creating dummy plan...');
            plan = await Plan.create({
                _id: 'java_access_plan_' + Date.now(), // Manual string ID
                name: 'Java Access Plan',
                type: 'Category', // Capitalized 'Category'
                targetId: javaCategory._id,
                priceMonthly: 0,
                active: true
            });
        }

        // Grant access using the plan ID
        await CategoryPaymentService.grantFreeAccess(user._id, javaCategory._id, plan._id);
        console.log(`Granted access to ${javaName} with Plan ${plan._id}`);

        // 3. Verify Java Access
        console.log('--- Verifying Java Access ---');
        const javaCheck = await CategoryPaymentService.checkCategoryAccess(user._id, javaCategory._id);
        console.log(`Java Access Check: ${javaCheck.hasAccess} (Type: ${javaCheck.access?.type})`);

        // 4. Verify Access to ALL other categories
        console.log('--- Verifying Other Categories ---');
        const allCategories = await Category.find({});

        for (const cat of allCategories) {
            if (cat._id.toString() === javaCategory._id.toString()) continue;

            const catName = cat.translations?.fr?.name || cat.translations?.en?.name || 'Unnamed';
            const check = await CategoryPaymentService.checkCategoryAccess(user._id, cat._id);
            const result = check.hasAccess ? 'ALLOWED' : 'DENIED';
            const color = check.hasAccess ? '\x1b[31m' : '\x1b[32m'; // Red if allowed (unexpected), Green if denied
            const reset = '\x1b[0m';

            console.log(`${color}[${result}]${reset} ${catName}: ${check.hasAccess ? JSON.stringify(check.access) : check.reason}`);

            // Also check via AccessControlService on a path if available
            const path = await Path.findOne({ category: cat._id });
            if (path) {
                const pathName = path.translations?.fr?.name || path.translations?.en?.name || 'Unnamed Path';
                const pathCheck = await AccessControlService.checkUserAccess(user._id, path._id);
                console.log(`    Path Check (${pathName}): ${pathCheck.hasAccess} (${pathCheck.reason || pathCheck.source})`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
