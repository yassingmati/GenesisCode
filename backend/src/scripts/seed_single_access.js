// src/scripts/seed_single_access.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Category = require('../models/Category');
const CategoryAccess = require('../models/CategoryAccess');
const CategoryPlan = require('../models/CategoryPlan');

async function seedUser() {
    console.log('🌱 Seeding Single Access User...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // 1. Get Categories
        const categories = await Category.find({});
        if (categories.length < 2) {
            console.error('❌ Need at least 2 categories to test access vs no-access.');
            return;
        }
        const cat1 = categories[0]; // Grant access to this
        const cat2 = categories[1]; // No access to this
        console.log(`Phase 1: Granting access to ${cat1.translations.fr.name} (${cat1._id})`);
        console.log(`Phase 2: Verifying NO access to ${cat2.translations.fr.name} (${cat2._id})`);

        // 2. Setup User
        const email = 'single_access@test.com';
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                firebaseUid: 'single_uid_' + Date.now(),
                email,
                userType: 'student',
                firstName: 'Single',
                lastName: 'Tester'
            });
        }

        // 3. CLEAN SLATE
        user.roles = [];
        user.isAdmin = false;
        await user.save();
        await Subscription.deleteMany({ user: user._id }); // Ensure no global sub
        await CategoryAccess.deleteMany({ user: user._id }); // Reset all category access

        // 4. Grant Access to Cat 1
        // Need a plan for it
        let plan = await CategoryPlan.findOne({ category: cat1._id });
        if (!plan) {
            plan = await CategoryPlan.create({
                category: cat1._id,
                price: 50,
                currency: 'TND',
                accessDuration: 365,
                paymentType: 'one_time',
                active: true
            });
        }

        await CategoryAccess.create({
            user: user._id,
            category: cat1._id,
            categoryPlan: plan._id,
            accessType: 'purchase',
            status: 'active',
            // Set expiry in future
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        console.log(`✅ Granted access to user ${email} for category ${cat1._id}`);
        console.log(`🔒 User should remain LOCKED out of ${cat2._id}`);

        // Output URLS for the Agent to use
        console.log(`\nURL_UNLOCKED: http://localhost:3000/learning/specific/${cat1._id}`);
        console.log(`URL_LOCKED: http://localhost:3000/learning/specific/${cat2._id}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Done');
    }
}

seedUser();
