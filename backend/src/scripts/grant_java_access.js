require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const CategoryAccess = require('../models/CategoryAccess');
const CategoryPlan = require('../models/CategoryPlan');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/codegenesis';

async function grantAccess() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'google-test@example.com';
        // Java Category ID from previous context: 6924480bc5bbbad53eb05cfe
        // But let's try to find it dynamically by name if possible, or fallback to ID
        const categoryId = '6924480bc5bbbad53eb05cfe';

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`❌ User not found: ${email}`);
            process.exit(1);
        }
        console.log(`👤 Found user: ${user.email} (${user._id})`);

        const category = await Category.findById(categoryId);
        // If not found by ID, try name 'Java'
        const targetCategory = category || await Category.findOne({ name: 'Java' });

        if (!targetCategory) {
            console.error(`❌ Category not found (checked ID ${categoryId} and name 'Java')`);
            process.exit(1);
        }
        console.log(`📚 Found category: ${targetCategory.name} (${targetCategory._id})`);

        // Find a plan for this category to link (usually required for data consistency)
        const plan = await CategoryPlan.findOne({ category: targetCategory._id });
        if (!plan) {
            console.warn(`⚠️ No specific plan found for category. Creating access without plan reference (might cause issues if schema requires it).`);
        } else {
            console.log(`💳 Found plan: ${plan.name} (${plan._id})`);
        }

        // Check if access already exists
        const existingAccess = await CategoryAccess.findOne({
            user: user._id,
            category: targetCategory._id
        });

        if (existingAccess) {
            console.log('ℹ️ Access record already exists. Updating to active...');
            existingAccess.status = 'active';
            existingAccess.expiresAt = null; // Lifetime
            if (plan) existingAccess.plan = plan._id;
            await existingAccess.save();
            console.log('✅ Access updated to ACTIVE.');
        } else {
            console.log('🆕 Creating new access record...');
            await CategoryAccess.create({
                user: user._id,
                category: targetCategory._id,
                plan: plan ? plan._id : null,
                status: 'active',
                accessType: 'specific',
                purchaseDate: new Date(),
                expiresAt: null, // Lifetime access
                amountPaid: 0,
                paymentMethod: 'manual_grant',
                paymentStatus: 'completed'
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

grantAccess();
