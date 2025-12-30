
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath, override: true });

// Models
const Category = require('../src/models/Category');
const Path = require('../src/models/Path');
const Level = require('../src/models/Level');
const Exercise = require('../src/models/Exercise');
const User = require('../src/models/User');
const UserProgress = require('../src/models/UserProgress');

// Controller
const { CourseController } = require('../src/controllers/CourseController');

// Mock Express Request/Response
const mockReq = (body = {}, params = {}, query = {}, user = null) => ({
    body,
    params,
    query,
    user,
    language: 'fr',
    acceptsLanguages: () => 'fr',
    get: () => 'localhost'
});

const mockRes = () => {
    let resolve;
    const p = new Promise(r => resolve = r);
    const res = {
        statusCode: 200, // default
        onComplete: p
    };
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        resolve(res);
        return res;
    };
    res.end = () => {
        resolve(res);
        return res;
    };
    return res;
};

async function executeController(controllerFn, req, res) {
    return new Promise((resolve, reject) => {
        // Handle success via res.json/end
        res.onComplete.then(() => resolve(res));

        // Handle error via next()
        // Note: catchErrors middleware returns undefined immediately, so we just call it.
        try {
            const result = controllerFn(req, res, (err) => {
                if (err) reject(err);
            });
            // If it returns a promise (unlikely with standard middleware pattern but possible if unwrapped), we could await it
            // but for catchErrors wrapped, we rely on callbacks.
        } catch (e) {
            reject(e);
        }
    });
}

// Main Test Function
async function runTest() {
    console.log('🚀 Starting Backend Exercise Flow Test...');

    // Connect to DB
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in .env');
        process.exit(1);
    }

    console.log('Use URI:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***@'));

    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ DB Connection Error:', err.message);
        process.exit(1);
    }

    let categoryId, pathId, levelId, exerciseId;
    const testUserId = new mongoose.Types.ObjectId(); // Random dummy user ID

    try {
        // 1. Setup Data (Category -> Path -> Level)
        console.log('\n--- 1. Setting up Test Data ---');

        // Create Category
        const category = await Category.create({
            type: 'classic',
            translations: {
                fr: { name: 'Test Category Auto' },
                en: { name: 'Test Category Auto' },
                ar: { name: 'Test Category Auto' }
            }
        });
        categoryId = category._id;
        console.log(`✅ Category Created: ${categoryId}`);

        // Create Path
        const pathDoc = await Path.create({
            category: categoryId,
            translations: {
                fr: { name: 'Test Path Auto' },
                en: { name: 'Test Path Auto' },
                ar: { name: 'Test Path Auto' }
            }
        });
        pathId = pathDoc._id;
        console.log(`✅ Path Created: ${pathId}`);

        // Create Level
        const level = await Level.create({
            path: pathId,
            translations: {
                fr: { title: 'Test Level Auto', content: 'Content' },
                en: { title: 'Test Level Auto', content: 'Content' },
                ar: { title: 'Test Level Auto', content: 'Content' }
            }
        });
        levelId = level._id;
        console.log(`✅ Level Created: ${levelId}`);

        // 2. Test Create Exercise (Admin Flow)
        console.log('\n--- 2. Testing Create Exercise ---');

        const exercisePayload = {
            level: levelId,
            type: 'QCM',
            translations: {
                fr: { name: 'QCM Test', question: '2 + 2 = ?', explanation: 'Maths basic' },
                en: { name: 'QCM Test', question: '2 + 2 = ?', explanation: 'Basic math' },
                ar: { name: 'QCM Test', question: '2 + 2 = ?', explanation: 'Maths basic' }
            },
            options: [
                { id: 'opt1', text: '3' },
                { id: 'opt2', text: '4' },
                { id: 'opt3', text: '5' }
            ],
            solutions: ['opt2'], // Correct answer is 4 (index/id logic might vary, let's check service)
            points: 10
        };

        // NOTE: In ExerciseService.js evaluateQCM:
        // "if (typeof a === 'number') return exercise.options[a]?.id;"
        // It seems solutions can be indices or IDs. CourseController validateExercise checks:
        // "if (!Number.isInteger(solution) ..." -> Wait!
        // Let's re-read validateExercise in CourseController line 172.
        // "if (!Number.isInteger(solution) || solution < 0 || solution > maxIndex)"
        // So the Controller enforces INDICES validation for QCM?
        // But ExerciseService seems to handle IDs too. 
        // If the controller enforces indices, I MUST send indices.
        // Let's try sending index [1] corresponding to 'opt2'.

        exercisePayload.solutions = [1];

        const reqCreate = mockReq(exercisePayload);
        const resCreate = mockRes();

        await executeController(CourseController.createExercise, reqCreate, resCreate);

        if (resCreate.statusCode === 201) {
            exerciseId = resCreate.body._id;
            console.log(`✅ Exercise Created Successfully: ${exerciseId}`);
            console.log('Body:', JSON.stringify(resCreate.body, null, 2));
        } else {
            console.error('❌ Failed to create exercise:', resCreate.statusCode, resCreate.body);
            throw new Error('Create Exercise Failed');
        }

        // 3. Test Submit Exercise - Correct Answer
        console.log('\n--- 3. Testing Submit Exercise (Correct) ---');

        // Prepare correct answer
        // If solutions was [1], and options are id:'opt2' at index 1.
        // ExerciseService evaluateQCM handles both indices and IDs if options have IDs.
        // Let's try submitting the ID 'opt2' first, if that fails we try index 1.
        // Wait, if I submit 'opt2', validateAnswer checks if it's array/number/string.
        // evaluateQCM normalizes: "if (typeof a === 'number') return exercise.options[a]?.id;"
        // So it converts indices to IDs internally for comparison.
        // And solutions in DB is [1].
        // Wait, if solutions in DB is [1], normalize(correctAnswers) will take options[1].id -> 'opt2'.
        // So correctNorm = ['opt2'].
        // If I send user answer ['opt2'], userNorm = ['opt2']. Match!
        // So sending ID should work.

        const submitPayloadCorrect = {
            userId: testUserId.toString(),
            answer: ['opt2']
        };

        const reqSubmitCorrect = mockReq(submitPayloadCorrect, { id: exerciseId });
        const resSubmitCorrect = mockRes();

        await executeController(CourseController.submitExercise, reqSubmitCorrect, resSubmitCorrect);

        if (resSubmitCorrect.body && resSubmitCorrect.body.success && resSubmitCorrect.body.correct) {
            console.log('✅ Correct Submission Verified');
            console.log('Points Earned:', resSubmitCorrect.body.pointsEarned);
        } else {
            console.error('❌ Correct Submission Failed:', resSubmitCorrect.body);
        }

        // 4. Test Submit Exercise - Incorrect Answer
        console.log('\n--- 4. Testing Submit Exercise (Incorrect) ---');

        const submitPayloadIncorrect = {
            userId: testUserId.toString(),
            answer: ['opt1'] // Wrong answer
        };

        const reqSubmitIncorrect = mockReq(submitPayloadIncorrect, { id: exerciseId });
        const resSubmitIncorrect = mockRes();

        await executeController(CourseController.submitExercise, reqSubmitIncorrect, resSubmitIncorrect);

        if (resSubmitIncorrect.body && resSubmitIncorrect.body.success && !resSubmitIncorrect.body.correct) {
            console.log('✅ Incorrect Submission Verified (as expected)');
        } else {
            console.error('❌ Incorrect Submission Logic Failed (It was marked correct or failed):', resSubmitIncorrect.body);
        }

    } catch (error) {
        console.error('❌ Test Failed with Exception:', error);
    } finally {
        console.log('\n--- 5. Cleanup ---');
        try {
            if (exerciseId) {
                await Exercise.findByIdAndDelete(exerciseId);
                await UserProgress.deleteMany({ exercise: exerciseId });
            }
            if (levelId) await Level.findByIdAndDelete(levelId);
            if (pathId) await Path.findByIdAndDelete(pathId);
            if (categoryId) await Category.findByIdAndDelete(categoryId);
            console.log('✅ Cleanup completed');
        } catch (e) {
            console.error('Cleanup error:', e);
        }

        await mongoose.disconnect();
        console.log('👋 Disconnected');
    }
}

runTest();
