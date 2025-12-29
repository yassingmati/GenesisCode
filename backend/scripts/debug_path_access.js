const mongoose = require('mongoose');
const Path = require('../src/models/Path');
const Category = require('../src/models/Category');
const AccessControlService = require('../src/services/accessControlService');
const User = require('../src/models/User');
const path = require('path');

// Hardcoded URI provided by user
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
        const pathId = '694700e69f5918eff2b44bcc';
        const userId = '6946e406164e7e166b4b9422';
        const categoryId = '6924480bc5bbbad53eb05cfe'; // Java

        // 1. Check Path Details
        const pathDoc = await Path.findById(pathId);
        if (!pathDoc) {
            console.log('❌ Path NOT FOUND:', pathId);
        } else {
            console.log(`✅ Path Found: ${pathDoc.translations?.fr?.name || pathDoc.name}`);
            console.log('Path Category:', pathDoc.category);

            if (String(pathDoc.category) === String(categoryId)) {
                console.log('✅ Path belongs to Java Category');
            } else {
                console.log(`❌ Path belongs to DIFFERENT Category: ${pathDoc.category} (Expected: ${categoryId})`);
            }
        }

        // 2. Simulate Access Check
        console.log('--- Simulating AccessControlService.checkUserAccess ---');
        // We need to re-instantiate or use the service directly if it's static
        // AccessControlService methods are static? Let's check.
        // Assuming checkUserAccess(userId, pathId, levelId)

        try {
            const hasAccess = await AccessControlService.checkUserAccess(userId, pathId);
            // Note: checkUserAccess usually takes (userId, pathId, levelId) or similar. 
            // The user call was /api/access/check?pathId=...&levelId=...
            // Let's check with just pathId first if possible, or dummy level.

            console.log('AccessControlService Result:', hasAccess);
        } catch (e) {
            console.error('Service Error:', e);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
