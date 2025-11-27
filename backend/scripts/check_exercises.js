const mongoose = require('mongoose');
const Exercise = require('../src/models/Exercise');
require('dotenv').config();

const checkExercises = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
        console.log('Connected to MongoDB');

        const levelId = '69244803c5bbbad53eb05c06';
        const exercises = await Exercise.find({ level: levelId });
        console.log(`Exercises found for level ${levelId}:`, exercises.length);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

checkExercises();
