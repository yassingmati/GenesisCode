const mongoose = require('mongoose');
const User = require('../src/models/User');
const Level = require('../src/models/Level');
const Exercise = require('../src/models/Exercise');
const UserProgress = require('../src/models/UserProgress');
const UserLevelProgress = require('../src/models/UserLevelProgress');
require('dotenv').config();

const debugUserProgress = async () => {
    try {
        const atlasUri = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';
        await mongoose.connect(atlasUri);
        console.log('Connected to MongoDB Atlas');

        const userId = '690b905603482021a66e5bc5';
        const levelId = '69244803c5bbbad53eb05c06';

        // 1. Find User
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User with ID ${userId} not found`);
            process.exit(1);
        }
        console.log(`User found: ${user.email} (${user._id})`);

        // 2. Find Level and Exercises
        const exercises = await Exercise.find({ level: levelId });
        console.log(`Found ${exercises.length} exercises for level ${levelId}`);

        // 3. Check Progress for each exercise
        for (const exercise of exercises) {
            const progress = await UserProgress.findOne({ user: user._id, exercise: exercise._id });
            const title = exercise.translations?.fr?.name || exercise.translations?.en?.name || 'Untitled';
            console.log(`Exercise: ${title} (${exercise._id}) - Completed: ${progress?.completed || false}`);
            if (!progress) {
                console.log(`   -> No progress record found!`);
            }
        }

        // 4. Check Level Progress
        const levelProgress = await UserLevelProgress.findOne({ user: user._id, level: levelId });
        console.log(`Level Progress: Completed: ${levelProgress?.completed || false}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

debugUserProgress();
