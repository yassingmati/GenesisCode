const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const checkUser = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) throw new Error('MONGODB_URI missing');

        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        const email = 'admin2@test.com';

        // Check User collection
        const User = require('./src/models/User');
        const user = await User.findOne({ email });

        if (user) {
            console.log('👤 Found in User collection:', user._id);
            console.log('   Roles:', user.roles);
        } else {
            console.log('❌ Not found in User collection');
        }

        // Check Admin collection
        const Admin = require('./src/models/Admin');
        const admin = await Admin.findOne({ email });

        if (admin) {
            console.log('🛡️ Found in Admin collection:', admin._id);
        } else {
            console.log('❌ Not found in Admin collection');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

checkUser();
