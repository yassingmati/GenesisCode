const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
const Level = require('./src/models/Level');

const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';
const LEVEL_ID = '69244803c5bbbad53eb05c06';

async function updateExercisesWithSolutions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Get level and its exercises
        const level = await Level.findById(LEVEL_ID).populate('exercises');
        if (!level) {
            console.error('❌ Level not found');
            process.exit(1);
        }

        console.log(`📚 Level: ${level.translations?.fr?.title || 'No title'}`);
        console.log(`📝 Exercises: ${level.exercises.length}\n`);

        // Update each exercise with proper solutions
        for (const exercise of level.exercises) {
            console.log(`\n🔧 Updating: ${exercise.translations?.fr?.name} (${exercise.type})`);

            let solutions = [];

            switch (exercise.type) {
                case 'Scratch':
                    // Solution XML for Scratch (moving 10 steps)
                    solutions = ['<xml xmlns="https://developers.google.com/blockly/xml"><block type="motion_movesteps" x="10" y="10"><field name="STEPS">10</field></block></xml>'];
                    exercise.solutions = solutions;
                    break;

                case 'ScratchBlocks':
                    // Solution: correct order of blocks
                    solutions = [
                        { text: 'Répéter 10 fois', category: 'control' },
                        { text: 'Avancer de 10', category: 'motion' }
                    ];
                    exercise.solutions = solutions;
                    break;

                case 'QCM':
                    // Solution: index 2 (const)
                    exercise.solutions = [2];
                    break;

                case 'Code':
                    // Solution: function sum
                    solutions = ['function sum(a, b) { return a + b; }'];
                    exercise.solutions = solutions;
                    break;
            }

            await exercise.save();
            console.log(`✅ Updated with solutions: ${JSON.stringify(exercise.solutions).substring(0, 100)}...`);
        }

        console.log('\n✅ All exercises updated with solutions!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected');
    }
}

updateExercisesWithSolutions();
