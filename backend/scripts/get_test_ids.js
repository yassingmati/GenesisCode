const mongoose = require('mongoose');
const User = require('../src/models/User');
const Exercise = require('../src/models/Exercise');
require('dotenv').config();

async function getData() {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CodegenesisDB');
        }

        const user = await User.findOne({});
        const exercise = await Exercise.findOne({});

        console.log('USER_ID:', user ? user._id.toString() : 'not_found');
        console.log('EXERCISE_ID:', exercise ? exercise._id.toString() : 'not_found');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

getData();
