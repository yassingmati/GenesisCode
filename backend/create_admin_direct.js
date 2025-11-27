const mongoose = require('mongoose');
const User = require('./src/models/User');
const Admin = require('./src/models/Admin');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codegenesis';

async function createAdmin() {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        const adminEmail = 'admin2@test.com';
        const adminPassword = 'password123';

        // Create Admin model entry
        let admin = await Admin.findOne({ email: adminEmail });
        if (!admin) {
            admin = new Admin({ email: adminEmail, password: adminPassword });
            await admin.save();
            console.log('Admin created in Admin model');
        } else {
            console.log('Admin already exists in Admin model');
            admin.password = adminPassword; // Reset password
            await admin.save();
            console.log('Admin password reset');
        }

        // Create User model entry
        let user = await User.findOne({ email: adminEmail });
        if (!user) {
            user = new User({
                firebaseUid: `admin-manual-${Date.now()}`,
                email: adminEmail,
                firstName: 'Admin',
                lastName: 'System',
                userType: 'student',
                roles: ['admin'],
                isVerified: true,
                isProfileComplete: true
            });
            await user.save();
            console.log('Admin created in User model');
        } else {
            console.log('Admin already exists in User model');
            if (!user.roles.includes('admin')) {
                user.roles.push('admin');
                await user.save();
                console.log('Admin role added to User');
            }
        }

        console.log('Done');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createAdmin();
