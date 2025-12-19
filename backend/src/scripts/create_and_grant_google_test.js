require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const CategoryAccess = require('../models/CategoryAccess');
const CategoryPlan = require('../models/CategoryPlan');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

async function createAndGrant() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');

        const email = 'google-test@example.com';

        // 1. Create User if not exists
        let user = await User.findOne({ email });
        if (!user) {
            console.log(`👤 User ${email} not found. Creating...`);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);

            user = await User.create({
                email,
                password: hashedPassword,
                firebaseUid: `dummy_${Date.now()}`,
                firstName: 'Google',
                lastName: 'Test',
                userType: 'student',
                isVerified: true,
                isProfileComplete: true,
                roles: []
            });
            console.log(`✅ User created: ${user._id}`);
        } else {
            console.log(`👤 Found existing user: ${user._id}`);
        }

        // 2. Find Category (Search localized names)
        const query = {
            $or: [
                { 'translations.fr.name': { $regex: new RegExp('^java$', 'i') } },
                { 'translations.en.name': { $regex: new RegExp('^java$', 'i') } },
                { 'translations.ar.name': { $regex: new RegExp('^java$', 'i') } }
            ]
        };

        let category = await Category.findOne(query);

        if (!category) {
            console.log('⚠️ Category "Java" not found by strictly matching localized names. Listing all categories...');
            const allCats = await Category.find({});
            console.table(allCats.map(c => ({
                id: c._id.toString(),
                fr: c.translations?.fr?.name,
                en: c.translations?.en?.name
            })));

            // Manual find
            category = allCats.find(c => {
                const fr = c.translations?.fr?.name || '';
                const en = c.translations?.en?.name || '';
                return fr.toLowerCase().includes('java') || en.toLowerCase().includes('java');
            });
        }

        if (!category) {
            console.error(`❌ Category 'Java' not found in database.`);
            process.exit(1);
        }

        const catName = category.translations?.fr?.name || category.translations?.en?.name || 'Unknown';
        console.log(`📚 Found category: ${catName} (${category._id})`);

        // 3. Find Plan
        const plan = await CategoryPlan.findOne({ category: category._id });
        if (!plan) {
            console.warn(`⚠️ No specific plan found for category ${catName}. Creating access requires a plan ID.`);
            // In production we might exit, but let's try to proceed or handle it
        }

        // 4. Grant Access
        const existingAccess = await CategoryAccess.findOne({
            user: user._id,
            category: category._id
        });

        if (existingAccess) {
            console.log('ℹ️ Access record already exists. Updating to active...');
            existingAccess.status = 'active';
            existingAccess.expiresAt = null;
            if (plan) existingAccess.categoryPlan = plan._id;
            await existingAccess.save();
            console.log('✅ Access updated to ACTIVE.');
        } else {
            console.log('🆕 Creating new access record...');
            if (!plan) {
                console.error('❌ Cannot create access without a valid categoryPlan ID.');
                process.exit(1);
            }

            await CategoryAccess.create({
                user: user._id,
                category: category._id,
                categoryPlan: plan._id,
                status: 'active',
                accessType: 'purchase', // Valid enum value
                purchaseDate: new Date(),
                expiresAt: null,
                amountPaid: 0,
                payment: { status: 'completed', paymentMethod: 'manual_grant' }
            });
            console.log('✅ Access granted successfully.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
    }
}

createAndGrant();
