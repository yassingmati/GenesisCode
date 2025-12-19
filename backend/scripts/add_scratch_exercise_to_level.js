const mongoose = require('mongoose');
const Exercise = require('../src/models/Exercise');
const Level = require('../src/models/Level');

// User provided URI
const MONGO_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';
const LEVEL_ID = '69244803c5bbbad53eb05c06';

// New Scratch (Blockly) Data
const scratchExerciseData = {
    level: LEVEL_ID,
    type: 'Scratch', // Using the standard 'Scratch' type (Blockly)
    points: 25,
    difficulty: 'easy',
    translations: {
        fr: {
            name: 'Initiation Scratch',
            question: 'Fais en sorte que le chat dise "Bonjour" quand on clique sur le drapeau vert.',
            explanation: 'Glisse le bloc "dire Bonjour" à l\'intérieur du bloc "quand drapeau vert pressé".'
        },
        en: {
            name: 'Scratch Intro',
            question: 'Make the cat say "Hello" when the green flag is clicked.',
            explanation: 'Drag the "say Hello" block inside the "when green flag clicked" block.'
        },
        ar: {
            name: 'مقدمة سكراتش',
            question: 'اجعل القط يقول "مرحباً" عند النقر على العلم الأخضر.',
            explanation: 'اسحب كتلة "قل مرحباً" داخل كتلة "عند النقر على العلم الأخضر".'
        }
    },
    // Initial XML for Blockly workspace
    initialXml: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="bg_event_whenflagclicked" id="start" x="50" y="50"></block></xml>',
    hint: "Regarde dans la catégorie Apparence (violet te)."
};

async function addExercise() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        // 1. Check Level
        const level = await Level.findById(LEVEL_ID);
        if (!level) {
            console.error(`Level ${LEVEL_ID} not found!`);
            process.exit(1);
        }
        console.log(`Found level: ${level.translations?.fr?.title}`);

        // 2. Create New Scratch Exercise
        console.log('Creating Scratch exercise...');
        const exercise = new Exercise(scratchExerciseData);
        await exercise.save();
        console.log(`Created Exercise ID: ${exercise._id}`);

        // 3. Update Level
        level.exercises.push(exercise._id);
        await level.save();
        console.log('Level updated with new exercise.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Done.');
    }
}

addExercise();
