const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
const Level = require('./src/models/Level');

const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

async function checkExercises() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Count exercises
        const exerciseCount = await Exercise.countDocuments();
        console.log(`📊 Total exercises in database: ${exerciseCount}\n`);

        if (exerciseCount === 0) {
            console.log('❌ No exercises found in database!');
        } else {
            // Show first 5 exercises
            const exercises = await Exercise.find().limit(5).populate('level');
            console.log('📝 First 5 exercises:');
            exercises.forEach((ex, idx) => {
                console.log(`  ${idx + 1}. ${ex.translations?.fr?.name || 'No name'} (${ex.type}) - Level: ${ex.level?._id || 'No level'}`);
            });

            // Check if levels have exercises reference
            console.log('\n🔗 Checking Level-Exercise links...');
            const level = await Level.findOne().populate('exercises');
            if (level) {
                console.log(`Level: ${level.translations?.fr?.title || 'No title'}`);
                console.log(`Exercises array length: ${level.exercises?.length || 0}`);
                if (level.exercises?.length > 0) {
                    console.log('✅ Level has exercises linked');
                } else {
                    console.log('❌ Level has NO exercises linked (exercises array is empty)');
                }
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkExercises();
