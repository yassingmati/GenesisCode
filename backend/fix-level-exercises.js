// backend/fix-level-exercises.js
const mongoose = require('mongoose');
const Level = require('./src/models/Level');
const Exercise = require('./src/models/Exercise');

// MongoDB Atlas URI
const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

async function fixLevelExercises() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        // 1. Get all levels
        const levels = await Level.find({});
        console.log(`🔍 Found ${levels.length} levels. Checking exercises...`);

        let updatedCount = 0;

        for (const level of levels) {
            // Find exercises for this level
            const exercises = await Exercise.find({ level: level._id }).select('_id');
            const exerciseIds = exercises.map(ex => ex._id);

            if (exerciseIds.length > 0) {
                // Update level with exercise IDs
                level.exercises = exerciseIds;
                await level.save();
                // console.log(`✅ Updated Level ${level._id} with ${exerciseIds.length} exercises.`);
                updatedCount++;
            } else {
                console.warn(`⚠️ No exercises found for Level ${level._id}`);
            }
        }

        console.log(`\n✅ Successfully updated ${updatedCount} levels with exercise references.`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected');
    }
}

fixLevelExercises();
