const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
const ExerciseService = require('./src/services/exerciseService');

const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';
const LEVEL_ID = '69244803c5bbbad53eb05c06';

async function testExerciseSolutions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        const exercises = await Exercise.find({ level: LEVEL_ID }).sort({ order: 1 });

        console.log(`📊 Testing ${exercises.length} exercises\n`);

        for (const exercise of exercises) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`📝 Exercise: ${exercise.translations?.fr?.name} (${exercise.type})`);
            console.log(`${'='.repeat(60)}`);

            let testAnswer;
            let options = {};

            switch (exercise.type) {
                case 'Scratch':
                    // Test avec la solution correcte
                    testAnswer = exercise.solutions?.[0] || '';
                    console.log(`\n✅ Testing CORRECT answer (Scratch XML)`);
                    break;

                case 'ScratchBlocks':
                    // Test avec la solution correcte
                    testAnswer = exercise.solutions || [];
                    console.log(`\n✅ Testing CORRECT answer (ScratchBlocks)`);
                    break;

                case 'QCM':
                    // Test avec la solution correcte (index 2)
                    testAnswer = [2];
                    console.log(`\n✅ Testing CORRECT answer (option index 2 = const)`);
                    break;

                case 'Code':
                    // Test avec passed = true
                    testAnswer = exercise.solutions?.[0] || '';
                    options = { passed: true };
                    console.log(`\n✅ Testing CORRECT answer (Code with passed=true)`);
                    break;
            }

            try {
                const result = ExerciseService.evaluateAnswer(exercise, testAnswer, options);

                console.log(`\n📊 Result:`);
                console.log(`   - Correct: ${result.isCorrect ? '✅ YES' : '❌ NO'}`);
                console.log(`   - Points Earned: ${result.pointsEarned}/${exercise.points}`);
                console.log(`   - XP: ${result.xp}`);
                console.log(`   - Details: ${JSON.stringify(result.details).substring(0, 100)}...`);

                if (result.isCorrect) {
                    console.log(`\n✅ SUCCESS: Exercise validation works correctly!`);
                } else {
                    console.log(`\n❌ FAILURE: Exercise validation failed!`);
                    console.log(`   Expected: isCorrect = true`);
                    console.log(`   Got: isCorrect = false`);
                }

            } catch (error) {
                console.log(`\n❌ ERROR during evaluation:`);
                console.log(`   ${error.message}`);
                console.log(`   Stack: ${error.stack}`);
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`✅ All tests completed!`);
        console.log(`${'='.repeat(60)}\n`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected');
    }
}

testExerciseSolutions();
