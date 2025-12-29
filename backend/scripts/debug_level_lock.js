const mongoose = require('mongoose');
const Level = require('../src/models/Level');
const AccessControlService = require('../src/services/accessControlService');
const path = require('path');

// Atlas URI from previous steps
const MONGO_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to Atlas DB');
    } catch (err) {
        console.error('DB Connection error:', err);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    try {
        const userId = '6946e406164e7e166b4b9422'; // yassine.gmatii@gmail.com
        const levelId = '6924480bc5bbbad53eb05d08';

        // 1. Inspect Level
        const level = await Level.findById(levelId);
        if (!level) {
            console.error('❌ Level NOT FOUND:', levelId);
        } else {
            console.log(`✅ Level Found: ${level.translations?.fr?.title || level.name}`);
            console.log('Parent Path ID:', level.path);
        }

        if (level) {
            const pathId = level.path;

            // 2. Simulate Path Access Check
            console.log(`\n--- Checking Path Access (${pathId}) ---`);
            const pathAccess = await AccessControlService.checkUserAccess(userId, pathId);
            console.log('Path Access:', pathAccess);

            // 3. Simulate Level Access Check
            console.log(`\n--- Checking Level Access (${levelId}) ---`);
            const levelAccess = await AccessControlService.checkUserAccess(userId, pathId, levelId);
            console.log('Level Access:', levelAccess);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
