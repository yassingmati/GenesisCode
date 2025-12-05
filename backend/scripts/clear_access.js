const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');
const CategoryAccess = require('../src/models/CategoryAccess');

async function clearAccess() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'genesiscodee@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        console.log(`Found user: ${user._id}`);

        const result = await CategoryAccess.deleteMany({ user: user._id });
        console.log(`Deleted ${result.deletedCount} access records for user ${email}.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

clearAccess();
