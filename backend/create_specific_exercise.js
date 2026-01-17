const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const LEVEL_ID = "69244803c5bbbad53eb05c06";

const EXERCISE_DATA = {
    level: new mongoose.Types.ObjectId(LEVEL_ID),
    type: "WebProject",
    difficulty: "medium",
    points: 100,
    translations: {
        fr: {
            name: "Premier Pas : Le Bouton Magique",
            question: "Créez une page web avec un titre centré et un bouton stylisé.",
            explanation: "Utilisez HTML pour la structure et CSS pour le style."
        },
        en: {
            name: "First Step: The Magic Button",
            question: "Create a webpage with a centered title and a styled button.",
            explanation: "Use HTML for structure and CSS for styling."
        },
        ar: {
            name: "First Step: The Magic Button",
            question: "Create a webpage with a centered title and a styled button.",
            explanation: "Use HTML for structure and CSS for styling."
        }
    },
    files: [
        {
            name: "index.html",
            language: "html",
            content: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon Site</title>
</head>
<body>
    <!-- Ajoutez votre code ici -->
    
</body>
</html>`
        },
        {
            name: "style.css",
            language: "css",
            content: `/* Ajoutez votre style ici */
body {
    font-family: sans-serif;
}`
        }
    ],
    validationRules: [
        {
            value: "<h1>",
            message: "Le fichier HTML doit contenir un titre <h1>.",
            points: 20,
            isRegex: false
        },
        {
            value: "text-align:\\s*center",
            message: "Le titre doit être centré (text-align: center).",
            points: 20,
            isRegex: true
        },
        {
            value: "<button",
            message: "Le fichier HTML doit contenir un bouton <button>.",
            points: 20,
            isRegex: false
        },
        {
            value: "background-color:",
            message: "Le bouton doit avoir une couleur de fond (background-color).",
            points: 20,
            isRegex: false
        },
        {
            value: "padding:",
            message: "Le bouton doit avoir de l'espacement interne (padding).",
            points: 20,
            isRegex: false
        }
    ]
};

async function createExercise() {
    console.log("🚀 Creating Exercise...");
    try {
        const uri = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(uri);
        console.log("✅ Connected to DB");

        const exercise = new Exercise(EXERCISE_DATA);
        await exercise.save();

        console.log(`✅ Exercise Created Successfully! ID: ${exercise._id}`);
        console.log("\n--- CORRECTION (SOLUTION) ---");
        console.log("HTML (index.html):");
        console.log(`
<body>
    <h1 style="text-align: center">Mon Titre</h1>
    <button>Cliquez ici</button>
</body>
        `);
        console.log("\nCSS (style.css):");
        console.log(`
button {
    background-color: blue;
    padding: 10px 20px;
    color: white;
    border: none;
    border-radius: 5px;
}
        `);

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

createExercise();
