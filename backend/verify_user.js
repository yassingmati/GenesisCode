const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');

const userId = '690f615195c102dbad63e25f';

async function checkUser() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');
        console.log('DB Host:', mongoose.connection.host);
        console.log('DB Name:', mongoose.connection.name);

        const user = await User.findById(userId);
        if (user) {
            console.log('✅ User found:', user.email);
            console.log('Roles:', user.roles);
        } else {
            console.log('❌ User NOT found with ID:', userId);
            // List all users to see what's there
            const users = await User.find({}).limit(5);
            console.log('First 5 users:', users.map(u => ({ id: u._id, email: u.email })));
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUser();
