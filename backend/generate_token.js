const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');

const generateToken = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'admin2@test.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.error('User not found:', email);
            process.exit(1);
        }

        console.log('User found:', user._id);

        const payload = {
            id: user._id,
            email: user.email,
            roles: user.roles || ['admin']
        };

        const secret = process.env.JWT_SECRET || 'devsecret';
        const token = jwt.sign(payload, secret, { expiresIn: '30d' });

        console.log('VALID_TOKEN:', token);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

generateToken();
