const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');

const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';
const LEVEL_ID = '69244803c5bbbad53eb05c06';

async function verifySolutions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        const exercises = await Exercise.find({ level: LEVEL_ID });

        console.log(`📊 Exercises in level: ${exercises.length}\n`);

        exercises.forEach((ex, idx) => {
            console.log(`${idx + 1}. ${ex.translations?.fr?.name} (${ex.type})`);
            console.log(`   Solutions: ${ex.solutions ? '✅ Present' : '❌ Missing'}`);
            if (ex.solutions) {
                console.log(`   Content: ${JSON.stringify(ex.solutions).substring(0, 100)}...`);
            }
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected');
    }
}

verifySolutions();
