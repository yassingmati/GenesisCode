const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkOldUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const oldId = '6943f4ecd7bf660f41a2d14d';
        console.log(`🔎 Checking for Old User ID: ${oldId}`);
        const user = await User.findById(oldId);
        if (user) {
            console.log(`⚠️ FOUND OLD USER! Email: ${user.email}`);
            console.log('This confirms why the token still works but access is false.');
        } else {
            console.log('✅ Old User NOT found.');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkOldUser();
