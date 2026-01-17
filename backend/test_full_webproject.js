const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
const ExerciseService = require('./src/services/exerciseService');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log("URI loaded:", process.env.MONGODB_URI ? "YES" : "NO");

// MOCK DATA
const TEST_EXERCISE = {
    // Title/Description are likely unused directly if translations are used, 
    // but looking at schema, they might be in translations.
    // Schema says: translations: { fr: { name, question, explanation }, ... }

    translations: {
        fr: { name: "Test WebProject", question: "Crée un bouton rouge", explanation: "Utilise CSS" },
        en: { name: "Test WebProject", question: "Create red button", explanation: "Use CSS" },
        ar: { name: "Test WebProject", question: "Create red button", explanation: "Use CSS" }
    },
    difficulty: "easy",
    level: new mongoose.Types.ObjectId(), // Fake Level ID
    points: 50,
    type: "WebProject",
    files: [
        { name: "index.html", content: "<h1>Click me</h1>", language: "html" },
        { name: "style.css", content: "h1 { color: blue; }", language: "css" }
    ],
    validationRules: [
        { value: "background-color: red", points: 20, message: "Le fond doit être rouge" }
    ]
};

const USER_ANSWER_CORRECT = {
    files: [
        { name: "index.html", content: "<button>Click Me</button>", language: "html" },
        { name: "style.css", content: "button { background-color: red; }", language: "css" }
    ]
};

const USER_ANSWER_WRONG = {
    files: [
        { name: "index.html", content: "<button>Click Me</button>", language: "html" },
        { name: "style.css", content: "button { background-color: blue; }", language: "css" }
    ]
};

async function runTest() {
    console.log("🚀 Starting Full WebProject Backend Test...");

    try {
        const uri = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0";
        console.log(`Debug URI: ${uri ? uri.substring(0, 20) + '...' : 'UNDEFINED'}`);
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        // 1. CREATE EXERCISE (Admin Simulation)
        console.log("\n1. Creating Exercise...");
        // Clean up old test
        await Exercise.deleteMany({ title: TEST_EXERCISE.title });

        const exercise = new Exercise(TEST_EXERCISE);
        await exercise.save();
        console.log(`✅ Exercise Created: ${exercise._id}`);

        // 1.5 UPDATE EXERCISE (Admin Edit Simulation)
        console.log("\n1.5 Updating Exercise Files...");
        const newFiles = [
            { name: "index.html", content: "<h1>Updated Title</h1>", language: "html" },
            { name: "style.css", content: "body { background: black; }", language: "css" }
        ];
        exercise.files = newFiles;
        await exercise.save();
        console.log("✅ Exercise Updated with new files");

        // 2. FETCH EXERCISE (Student Simulation)
        console.log("\n2. Fetching Exercise...");
        const fetchedExercise = await Exercise.findById(exercise._id);

        // STRICT CHECK FOR FILES
        if (!fetchedExercise.files || fetchedExercise.files.length !== 2) {
            console.error("❌ Files missing or incorrect length!", fetchedExercise.files);
            throw new Error("File persistence failed");
        }
        if (!fetchedExercise.files[0].content.includes("Updated Title")) {
            console.error("❌ File content mismatch!", fetchedExercise.files[0]);
            throw new Error("File update failed");
        }
        console.log("✅ Exercise Fetched correctly (Files verified)");

        // 3. SUBMIT WRONG ANSWER
        console.log("\n3. Submitting WRONG Answer...");
        const wrongResult = await ExerciseService.evaluateWebProject(fetchedExercise, USER_ANSWER_WRONG, 50);
        console.log("Result:", wrongResult);

        if (wrongResult.pointsEarned < 50 && wrongResult.feedback.includes("Le fond doit être rouge")) {
            // Or at least it should NOT say "Excellent"
            // Wait, our logic says regex is checked. 
            // "background-color: red" is NOT in "background-color: blue;"
            // So it should fail.
            console.log("✅ Wrong answer correctly identified (Score low)");
        } else {
            console.warn("⚠️ Warning: Wrong answer might have been validated?", wrongResult);
        }


        // 4. SUBMIT CORRECT ANSWER
        console.log("\n4. Submitting CORRECT Answer...");
        const correctResult = await ExerciseService.evaluateWebProject(fetchedExercise, USER_ANSWER_CORRECT, 50);
        console.log("Result:", correctResult);

        if (correctResult.pointsEarned === 50 && correctResult.isCorrect) {
            console.log("✅ Correct answer VALIDATED successfully! (Score 50/50)");
        } else {
            console.error("❌ Failed to validate correct answer");
        }


    } catch (e) {
        console.error("❌ Test Failed:", e);
    } finally {
        await mongoose.disconnect();
        console.log("\n🏁 Test Completed");
    }
}

runTest();
