const mongoose = require('mongoose');
const CategoryAccess = require('../models/CategoryAccess');
const User = require('../models/User');
require('dotenv').config();

const verifyAccess = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to DB');

        // Check specific User ID from screenshot
        const userId = '6930162314493869c67628d7';
        const categoryId = '6924480bc5bbbad53eb05cfe'; // Java

        console.log(`👤 Checking access for User: ${userId} and Category: ${categoryId}`);

        // 1. Raw Find
        const rawAccess = await CategoryAccess.findOne({
            user: userId,
            category: categoryId
        });
        console.log('\n🔎 Raw Access Record:', rawAccess);

        if (rawAccess) {
            console.log('Status:', rawAccess.status);
            console.log('ExpiresAt:', rawAccess.expiresAt);
            console.log('Is Active (method)?', rawAccess.isActive ? rawAccess.isActive() : 'Method not available on raw doc?');
        }

        // 2. Static Method Find
        console.log('\n🔎 Testing findActiveByUserAndCategory...');
        const activeAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
        console.log('Result:', activeAccess ? '✅ Access Found' : '❌ Access NOT Found');

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

verifyAccess();
