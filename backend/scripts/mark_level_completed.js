const mongoose = require('mongoose');
const User = require('../src/models/User');
const UserLevelProgress = require('../src/models/UserLevelProgress');
const Level = require('../src/models/Level');
require('dotenv').config();

const markLevelCompleted = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
        console.log('Connected to MongoDB');

        const email = 'yassine1.gmatii@gmail.com';
        const levelId = '69244803c5bbbad53eb05c06';

        // 1. Find User
        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }
        console.log(`User found: ${user._id}`);

        // 2. Find Level (optional, just to verify it exists)
        // Note: The ID provided might be a mock or specific, we'll try to use it directly.
        // If it's not a valid ObjectId, this might fail.
        if (!mongoose.isValidObjectId(levelId)) {
            console.error(`Invalid Level ID: ${levelId}`);
            // If it's a custom string ID, we might need to handle it, but usually Mongo IDs are ObjectIds.
            // The user provided '69244803c5bbbad53eb05c06' which looks like a 24-char hex string (ObjectId).
        }

        // 3. Update/Create UserLevelProgress
        const result = await UserLevelProgress.findOneAndUpdate(
            { user: user._id, level: levelId },
            {
                completed: true,
                completedAt: new Date(),
                $inc: { xp: 50 } // Bonus XP
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('Level marked as completed:', result);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

markLevelCompleted();
