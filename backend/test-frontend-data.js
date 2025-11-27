const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
const ExerciseService = require('./src/services/exerciseService');

const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';
const LEVEL_ID = '69244803c5bbbad53eb05c06';

async function testWithFrontendData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        const exercise = await Exercise.findOne({ level: LEVEL_ID, type: 'ScratchBlocks' });

        if (!exercise) {
            console.error('❌ ScratchBlocks exercise not found');
            process.exit(1);
        }

        console.log(`📝 Testing: ${exercise.translations?.fr?.name}`);
        console.log(`   Solutions: ${JSON.stringify(exercise.solutions)}\n`);

        // Simuler la réponse du frontend avec des IDs
        const frontendAnswer = [
            {
                "text": "Répéter 10 fois",
                "category": "control",
                "id": 1763987754447
            },
            {
                "text": "Avancer de 10",
                "category": "motion",
                "id": 1763987754872
            }
        ];

        console.log(`🧪 Frontend answer (with IDs):`);
        console.log(`   ${JSON.stringify(frontendAnswer, null, 2)}\n`);

        const result = ExerciseService.evaluateAnswer(exercise, frontendAnswer, {});

        console.log(`📊 Evaluation Result:`);
        console.log(`   - isCorrect: ${result.isCorrect ? '✅ YES' : '❌ NO'}`);
        console.log(`   - pointsEarned: ${result.pointsEarned}/${exercise.points}`);
        console.log(`   - xp: ${result.xp}`);
        console.log(`   - blocksMatch: ${result.details.blocksMatch}`);

        if (result.isCorrect) {
            console.log(`\n✅ SUCCESS! The ID field is correctly ignored during comparison.`);
        } else {
            console.log(`\n❌ FAILURE! The comparison still fails.`);
            console.log(`   User blocks: ${JSON.stringify(result.details.userBlocks)}`);
            console.log(`   Correct blocks: ${JSON.stringify(result.details.correctBlocks)}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected');
    }
}

testWithFrontendData();
