const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
const ExerciseService = require('./src/services/exerciseService');

const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';
const LEVEL_ID = '69244803c5bbbad53eb05c06';

async function debugExerciseSubmissions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        const exercises = await Exercise.find({ level: LEVEL_ID }).sort({ order: 1 });

        console.log(`📊 Debugging ${exercises.length} exercises\n`);

        for (const exercise of exercises) {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`📝 Exercise: ${exercise.translations?.fr?.name} (${exercise.type})`);
            console.log(`${'='.repeat(80)}`);

            console.log(`\n📋 Exercise Data:`);
            console.log(`   - ID: ${exercise._id}`);
            console.log(`   - Type: ${exercise.type}`);
            console.log(`   - Points: ${exercise.points}`);
            console.log(`   - Solutions: ${JSON.stringify(exercise.solutions).substring(0, 150)}...`);

            // Simuler différentes réponses du frontend
            let testCases = [];

            switch (exercise.type) {
                case 'Scratch':
                    testCases = [
                        { name: 'Correct XML', answer: exercise.solutions?.[0], options: {} },
                        { name: 'Empty string', answer: '', options: {} },
                        { name: 'Wrong XML', answer: '<xml></xml>', options: {} }
                    ];
                    break;

                case 'ScratchBlocks':
                    testCases = [
                        { name: 'Correct blocks array', answer: exercise.solutions, options: {} },
                        { name: 'Empty array', answer: [], options: {} },
                        { name: 'Wrong order', answer: exercise.solutions?.slice().reverse(), options: {} }
                    ];
                    break;

                case 'QCM':
                    testCases = [
                        { name: 'Correct answer [2]', answer: [2], options: {} },
                        { name: 'Wrong answer [0]', answer: [0], options: {} },
                        { name: 'Multiple answers [0,2]', answer: [0, 2], options: {} }
                    ];
                    break;

                case 'Code':
                    testCases = [
                        { name: 'Passed=true', answer: exercise.solutions?.[0], options: { passed: true } },
                        { name: 'Passed=false', answer: exercise.solutions?.[0], options: { passed: false } },
                        { name: 'PassedCount 3/3', answer: exercise.solutions?.[0], options: { passedCount: 3, totalCount: 3 } }
                    ];
                    break;
            }

            for (const testCase of testCases) {
                console.log(`\n   🧪 Test: ${testCase.name}`);
                console.log(`      Answer: ${JSON.stringify(testCase.answer).substring(0, 100)}...`);

                try {
                    const result = ExerciseService.evaluateAnswer(exercise, testCase.answer, testCase.options);
                    console.log(`      ✅ Result:`);
                    console.log(`         - isCorrect: ${result.isCorrect}`);
                    console.log(`         - pointsEarned: ${result.pointsEarned}/${exercise.points}`);
                    console.log(`         - xp: ${result.xp}`);
                } catch (error) {
                    console.log(`      ❌ Error: ${error.message}`);
                }
            }
        }

        console.log(`\n${'='.repeat(80)}`);
        console.log(`✅ Debug completed!`);
        console.log(`${'='.repeat(80)}\n`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected');
    }
}

debugExerciseSubmissions();
