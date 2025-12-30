const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
require('dotenv').config();

const exerciseId = '6953c7cc4ece92661e986c7f';

async function inspectExercise() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const exercise = await Exercise.findById(exerciseId);

        if (!exercise) {
            console.log('Exercise not found');
            return;
        }

        console.log('=== EXERCISE DATA ===');
        console.log('ID:', exercise._id);
        console.log('Type:', exercise.type);
        console.log('Elements:', JSON.stringify(exercise.elements, null, 2));
        console.log('Targets:', JSON.stringify(exercise.targets, null, 2));
        console.log('Solutions Raw:', JSON.stringify(exercise.solutions, null, 2));

        if (exercise.solutions && exercise.solutions.length > 0) {
            console.log('Expected Solution Map:', exercise.solutions[0]);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

inspectExercise();
