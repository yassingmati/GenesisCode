const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const searchUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
        console.log('Connected to MongoDB');

        const users = await User.find({
            $or: [
                { email: { $regex: 'yassine', $options: 'i' } },
                { name: { $regex: 'yassine', $options: 'i' } }
            ]
        });
        console.log('Users found:', users);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

searchUser();
