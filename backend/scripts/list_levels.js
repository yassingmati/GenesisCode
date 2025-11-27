const mongoose = require('mongoose');
const Level = require('../src/models/Level');
require('dotenv').config();

const listLevels = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
        console.log('Connected to MongoDB');

        const levels = await Level.find({}, '_id translations');
        console.log('Levels found:', JSON.stringify(levels, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

listLevels();
