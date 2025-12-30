const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
require('dotenv').config();

async function listExercises() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis';
        await mongoose.connect(mongoUri);

        // Find last 5 DragDrop exercises
        const exercises = await Exercise.find({ type: 'DragDrop' }).sort({ _id: -1 }).limit(5);

        console.log('=== RECENT DRAGDROP EXERCISES ===');
        exercises.forEach(ex => {
            console.log(`ID: ${ex._id}`);
            console.log(`Title: ${ex.title}`);
            console.log(`Solutions: ${JSON.stringify(ex.solutions)}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

listExercises();
