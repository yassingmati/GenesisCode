const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath, override: true });

const User = require('../models/User');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'yassine1.gmatii@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found: ${email}`);
        } else {
            console.log('✅ User found:');
            console.log({
                id: user._id,
                email: user.email,
                userType: user.userType,
                firebaseUid: user.firebaseUid,
                hasPassword: !!user.password
            });

            // If you want to verify password, you'd need the hashing library (e.g. bcrypt)
            // assuming it's used in your Auth controller, but here we just check potential data issues.
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUser();
