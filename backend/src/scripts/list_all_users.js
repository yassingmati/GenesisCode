const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}, 'email _id username');
        console.log(`Found ${users.length} users:`);
        users.forEach(u => console.log(`- ${u.email} (${u._id})`));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

listUsers();
