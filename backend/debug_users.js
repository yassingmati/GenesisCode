require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const debugUsers = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        const count = await User.countDocuments();
        console.log(`Total users: ${count}`);

        const users = await User.find({}, 'email firstName lastName').limit(5);
        console.log('First 5 users:', users);

        const targetUser = await User.findOne({ email: 'genesiscodee@gmail.com' });
        console.log('Target user search:', targetUser ? 'FOUND' : 'NOT FOUND');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugUsers();
