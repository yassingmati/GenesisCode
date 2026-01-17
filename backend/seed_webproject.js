const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
const Level = require('./src/models/Level');

const LEVEL_ID = '69244803c5bbbad53eb05c06';
const URI = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0";

async function seedWebProject() {
    try {
        await mongoose.connect(URI);
        console.log('Connected to MongoDB');

        // Verify level exists (optional, but good for safety)
        // Note: The ID provided by user might be a placeholder or real. I'll try to cast it.
        // If it fails validation, I will just log it.

        // Create the exercise
        const exercise = new Exercise({
            type: 'WebProject',
            level: LEVEL_ID,
            points: 20,
            difficulty: 'medium',
            files: [
                {
                    name: 'index.html',
                    language: 'html',
                    content: `<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="card">
        <h1>Mon Profil</h1>
        <p>Bienvenue sur ma page !</p>
    </div>
</body>
</html>`,
                    readOnly: false
                },
                {
                    name: 'style.css',
                    language: 'css',
                    content: `body {
    font-family: sans-serif;
    background-color: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

.card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    text-align: center;
}

h1 {
    color: #333;
}

/* Ajoutez votre CSS ici pour changer la couleur du h1 en bleu */`,
                    readOnly: false
                }
            ],
            translations: {
                fr: {
                    name: 'Créer une carte de profil',
                    question: 'Modifiez le fichier CSS pour changer la couleur du titre en bleu (blue) et ajouter une bordure à la carte.',
                    explanation: 'La propriété color permet de changer la couleur du texte.'
                },
                en: {
                    name: 'Create a Profile Card',
                    question: 'Modify the CSS file to change the title color to blue and add a border to the card.',
                    explanation: 'The color property sets the color of the text.'
                },
                ar: {
                    name: 'Create a Profile Card (AR)',
                    question: 'Modify the CSS file to change the title color to blue and add a border to the card.',
                    explanation: 'The color property sets the color of the text.'
                }
            }
        });

        const savedExercise = await exercise.save();
        console.log('WebProject exercise created successfully!');
        console.log('Exercise ID:', savedExercise._id);

        // Link to Level
        const level = await Level.findById(LEVEL_ID);
        if (level) {
            level.exercises.push(savedExercise._id);
            await level.save();
            console.log('Level updated with new exercise.');
        } else {
            console.error('Level not found!');
        }

    } catch (error) {
        console.error('Error seeding exercise:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedWebProject();
