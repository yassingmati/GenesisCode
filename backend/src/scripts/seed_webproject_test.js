const mongoose = require('mongoose');
const path = require('path');
const result = require('dotenv').config({ path: path.join(__dirname, '../../.env') });
if (result.error) {
    console.error("Dotenv Error:", result.error);
}
console.log("Loading .env from:", path.join(__dirname, '../../.env'));
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Defined" : "Undefined");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Defined" : "Undefined");

const Exercise = require('../models/Exercise');
const Level = require('../models/Level');
const Path = require('../models/Path'); // Ensure Path is loaded if strictly needed
const Category = require('../models/Category'); // Same for Category

// Simple red square data:image png base64 (10x10 red pixel)
// We will use a public placeholder URL because our logic downloads it.
// Or we can assume the user will replace it.
// Let's use a reliable placeholder.
const SOLUTION_IMAGE_URL = "https://via.placeholder.com/500x300/FF0000/FFFFFF?text=Red+Button";

const connectDB = async () => {
    try {
        const uri = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const seedTestExercise = async () => {
    await connectDB();

    try {
        // 1. Find a Level to attach to (e.g., first level of first path)
        // Or create a dummy one.
        // Let's try to find an existing level "Introduction HTML" or similar, or just any.
        const level = await Level.findOne();
        if (!level) {
            console.error("No levels found in DB. Please seed content first.");
            process.exit(1);
        }

        console.log(`Using Level: ${level._id} (Order: ${level.order})`);

        // 2. Create WebProject Exercise
        const exerciseData = {
            level: level._id,
            type: 'WebProject',
            translations: {
                fr: {
                    name: "AI Test: Bouton Rouge",
                    question: "Créez un bouton rouge (background-color: red) avec le texte 'Click Me'.",
                    explanation: "L'IA va vérifier si votre résultat ressemble à l'image cible (un rectangle rouge)."
                },
                en: {
                    name: "AI Test: Red Button",
                    question: "Create a red button (background-color: red) with text 'Click Me'.",
                    explanation: "AI will check visuals."
                },
                ar: {
                    name: "AI Test: Red Button",
                    question: "Create a red button.",
                    explanation: "AI check."
                }
            },
            points: 50,
            difficulty: 'easy',
            files: [
                {
                    name: 'index.html',
                    language: 'html',
                    content: '<button class="my-btn">Click Me</button>'
                },
                {
                    name: 'style.css',
                    language: 'css',
                    content: '.my-btn {\n  /* Ajoutez votre CSS ici */\n}'
                },
                {
                    name: 'script.js',
                    language: 'javascript',
                    content: '// JS if needed'
                }
            ],
            // Pre-fill solution image with a remote URL for testing without local upload 
            // (Use the upload UI to change it later)
            solutionImage: SOLUTION_IMAGE_URL,
            solutions: ["red", "background-color"], // fallback keywords
        };

        const existing = await Exercise.findOne({ 'translations.fr.name': exerciseData.translations.fr.name });
        if (existing) {
            console.log("Updating existing test exercise...");
            Object.assign(existing, exerciseData);
            await existing.save();
            console.log(`✅ Exercise updated: ${existing._id}`);
        } else {
            const newEx = await Exercise.create(exerciseData);
            console.log(`✅ Exercise created: ${newEx._id}`);

            // Add to level if needed (depending on schema referencing)
            if (!level.exercises.includes(newEx._id)) {
                level.exercises.push(newEx._id);
                await level.save();
                console.log("Attached to level.");
            }
        }

        console.log("Done.");
        process.exit(0);

    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedTestExercise();
