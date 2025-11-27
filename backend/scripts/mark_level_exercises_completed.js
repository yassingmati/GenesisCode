const mongoose = require('mongoose');
const User = require('../src/models/User');
const Level = require('../src/models/Level');
const Exercise = require('../src/models/Exercise');
const UserProgress = require('../src/models/UserProgress');
const UserLevelProgress = require('../src/models/UserLevelProgress');
require('dotenv').config();

const markAllExercisesCompleted = async () => {
    try {
        const atlasUri = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';
        await mongoose.connect(atlasUri);
        console.log('Connected to MongoDB Atlas');

        const email = 'yassine1.gmatii@gmail.com';
        const levelId = '69244804c5bbbad53eb05c12';

        // 1. Verify User exists
        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }
        const userId = user._id;
        console.log(`User found: ${user.email} (${user._id})`);

        // 2. Find Level and its Exercises
        const exercises = await Exercise.find({ level: levelId });
        console.log(`Found ${exercises.length} exercises for level ${levelId}`);

        if (exercises.length === 0) {
            console.warn('No exercises found for this level.');
        }

        // 3. Mark each exercise as completed
        let updatedCount = 0;
        for (const exercise of exercises) {
            await UserProgress.findOneAndUpdate(
                { user: userId, exercise: exercise._id },
                {
                    completed: true,
                    completedAt: new Date(),
                    xp: 10, // Default XP
                    pointsEarned: exercise.points || 10,
                    pointsMax: exercise.points || 10,
                    attempts: 1,
                    bestScore: exercise.points || 10
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            updatedCount++;
        }
        console.log(`Marked ${updatedCount} exercises as completed.`);

        // 4. Mark Level as completed
        await UserLevelProgress.findOneAndUpdate(
            { user: userId, level: levelId },
            {
                completed: true,
                completedAt: new Date(),
                $inc: { xp: 50 } // Bonus XP
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log('Level marked as completed in UserLevelProgress.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

markAllExercisesCompleted();
