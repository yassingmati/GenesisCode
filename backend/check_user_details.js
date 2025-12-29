require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'yassine.gmatii@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found:', email);
        } else {
            console.log('✅ User found:');
            console.log('TD:', user._id);
            console.log('Email:', user.email);
            console.log('UserType:', user.userType);
            console.log('Firebase UID:', user.firebaseUid);
            console.log('Has Local Password Hash:', !!user.localPasswordHash);
            if (user.localPasswordHash) {
                console.log('Password Hash (truncated):', user.localPasswordHash.substring(0, 10) + '...');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUser();
