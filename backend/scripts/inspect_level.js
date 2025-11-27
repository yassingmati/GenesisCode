const mongoose = require('mongoose');
const Level = require('../src/models/Level');
require('dotenv').config();

const inspectLevel = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
        console.log('Connected to MongoDB');

        const levelId = '69244803c5bbbad53eb05c06';
        const level = await Level.findById(levelId);

        if (!level) {
            console.log('Level not found');
        } else {
            console.log('Level found:', JSON.stringify(level, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

inspectLevel();
