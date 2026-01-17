const mongoose = require('mongoose');
const Level = require('./src/models/Level');
const Exercise = require('./src/models/Exercise');

// Hardcoded IDs from previous context
const LEVEL_ID = "69244803c5bbbad53eb05c06";
const EXERCISE_ID = "696b705e391a4a6c2f34bb74";
const MONGO_URI = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0";

async function repairLink() {
    console.log("🛠️ Starting Repair...");
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to DB");

        const result = await Level.findByIdAndUpdate(
            LEVEL_ID,
            { $addToSet: { exercises: EXERCISE_ID } },
            { new: true }
        );

        if (result) {
            console.log("✅ SUCCESS: Linked Exercise to Level.");
            console.log(`Current Exercises in Level: ${result.exercises.length}`);
        } else {
            console.error("❌ ERROR: Level not found.");
        }

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

repairLink();
