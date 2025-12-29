const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
};

const findUser = async () => {
    await connectDB();
    try {
        const firebaseUid = 'PY78xbFNWkT0fpN1PblcAWVqHdu2';
        console.log('Searching for user with Firebase UID:', firebaseUid);

        const user = await User.findOne({ firebaseUid });
        if (user) {
            console.log(`Found User: ${user.email} (${user._id})`);
            console.log('User Details:', user);
        } else {
            console.log('User not found by Firebase UID.');

            // List all users to be sure
            const users = await User.find({}).select('email firebaseUid _id firstName lastName');
            console.log('All Users:', users);
        }

    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
};

findUser();
