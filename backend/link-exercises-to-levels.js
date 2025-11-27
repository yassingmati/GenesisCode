const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
const Level = require('./src/models/Level');

const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

async function linkExercisesToLevels() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Get all levels
        const levels = await Level.find();
        console.log(`📊 Found ${levels.length} levels\n`);

        let totalLinked = 0;

        for (const level of levels) {
            // Find all exercises for this level
            const exercises = await Exercise.find({ level: level._id });

            if (exercises.length > 0) {
                // Update the level's exercises array
                level.exercises = exercises.map(ex => ex._id);
                await level.save();

                console.log(`✅ Linked ${exercises.length} exercises to level: ${level.translations?.fr?.title || level._id}`);
                totalLinked += exercises.length;
            }
        }

        console.log(`\n✅ Total exercises linked: ${totalLinked}`);

        // Verify
        const verifyLevel = await Level.findOne().populate('exercises');
        console.log(`\n🔍 Verification - Sample level has ${verifyLevel.exercises?.length || 0} exercises`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected');
    }
}

linkExercisesToLevels();
