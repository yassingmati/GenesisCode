const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
const Level = require('./src/models/Level');

const LEVEL_ID = '69244803c5bbbad53eb05c06';
const URI = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0";

async function createButtonExercise() {
    try {
        await mongoose.connect(URI);
        console.log('Connected to MongoDB');

        const filter = { type: 'WebProject', level: LEVEL_ID, "translations.fr.name": "Bouton Appel à l'Action" };

        let exercise = await Exercise.findOne(filter);
        if (!exercise) {
            exercise = new Exercise({ ...filter });
            console.log('Creating NEW exercise...');
        } else {
            console.log('Updating EXISTING exercise:', exercise._id);
        }

        // Update fields
        exercise.points = 50;
        exercise.difficulty = 'easy';
        exercise.solutionImage = 'https://ui-avatars.com/api/?name=Button&background=0D8ABC&color=fff&size=300';
        exercise.files = [
            {
                name: 'index.html',
                language: 'html',
                content: `<!DOCTYPE html>
<html>
<head>
  <title>Exercice Bouton</title>
</head>
<body>
  <!-- Ajoutez votre bouton ici -->
  <button class="btn">Cliquez-moi</button>
</body>
</html>`,
                readOnly: false
            },
            {
                name: 'style.css',
                language: 'css',
                content: `body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f2f5;
  font-family: sans-serif;
}

/* Complétez le style du bouton ci-dessous */
.btn {
  padding: 12px 24px;
  border: none;
  cursor: pointer;
  
}`,
                readOnly: false
            }
        ];
        exercise.translations = {
            fr: {
                name: 'Bouton Appel à l\'Action',
                question: `<h3>Objectif</h3>
<p>Créez un bouton moderne avec un dégradé de couleur et une ombre portée.</p>
<p>Voici à quoi il doit ressembler :</p>
<img src="https://ui-avatars.com/api/?name=Button&background=0D8ABC&color=fff&size=128" alt="Exemple" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />

<ul>
  <li>Utilisez la classe CSS <code>.btn</code></li>
  <li>Texte du bouton : "Cliquez-moi"</li>
  <li>Ajoutez un <code>hover</code> pour changer la couleur au survol.</li>
</ul>`,
                explanation: 'Utilisez box-shadow pour l\'ombre et background-color (ou background) pour la couleur.'
            },
            en: {
                name: 'Call to Action Button',
                question: `<h3>Objective</h3>
<p>Create a modern button with a gradient and shadow.</p>
<p>It should look like this:</p>
<img src="https://ui-avatars.com/api/?name=Button&background=0D8ABC&color=fff&size=128" alt="Example" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />

<ul>
  <li>Use CSS class <code>.btn</code></li>
  <li>Button text: "Cliquez-moi"</li>
  <li>Add a <code>hover</code> effect.</li>
</ul>`,
                explanation: 'Use box-shadow for shadow and background-color for color.'
            },
            ar: {
                name: 'Call to Action Button (AR)',
                question: `<h3>Objective</h3>
<p>Create a modern button with a gradient and shadow.</p>
<p>It should look like this:</p>
<img src="https://ui-avatars.com/api/?name=Button&background=0D8ABC&color=fff&size=128" alt="Example" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />

<ul>
  <li>Use CSS class <code>.btn</code></li>
  <li>Button text: "Cliquez-moi"</li>
  <li>Add a <code>hover</code> effect.</li>
</ul>`,
                explanation: 'Use box-shadow for shadow and background-color for color.'
            }
        };
        exercise.solutions = [
            'linear-gradient',
            'box-shadow',
            'border-radius',
            '.btn:hover'
        ];

        // Save Exercise
        const savedExercise = await exercise.save();
        console.log('Exercise created:', savedExercise._id);

        // Update Level
        const level = await Level.findById(LEVEL_ID);
        if (level) {
            level.exercises.push(savedExercise._id);
            await level.save();
            console.log(`Level ${LEVEL_ID} updated with new exercise.`);
        } else {
            console.error(`Level ${LEVEL_ID} not found!`);
        }

    } catch (error) {
        console.error('Error creating exercise:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createButtonExercise();
