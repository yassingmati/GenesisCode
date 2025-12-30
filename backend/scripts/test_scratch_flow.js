
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
        res.onComplete.then(() => resolve(res));
        try {
            controllerFn(req, res, (err) => {
                if (err) reject(err);
            });
        } catch (e) {
            reject(e);
        }
    });
}

// Main Test Function
async function runTest() {
    console.log('🚀 Starting Backend Scratch Flow Test...');

    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ DB Connection Error:', err.message);
        process.exit(1);
    }

    let categoryId, pathId, levelId, exerciseId;
    const testUserId = new mongoose.Types.ObjectId();

    try {
        // 1. Setup Data
        console.log('\n--- 1. Setting up Test Data ---');

        // Create Category
        const category = await Category.create({ type: 'classic', translations: { fr: { name: 'Scratch Test Cat' }, en: { name: 'Scratch Test Cat' }, ar: { name: 'Scratch Test Cat' } } });
        categoryId = category._id;

        // Create Path
        const pathDoc = await Path.create({ category: categoryId, translations: { fr: { name: 'Scratch Path' }, en: { name: 'Scratch Path' }, ar: { name: 'Scratch Path' } } });
        pathId = pathDoc._id;

        // Create Level
        const level = await Level.create({ path: pathId, translations: { fr: { title: 'Scratch Level', content: 'Content' }, en: { title: 'Scratch Level', content: 'Content' }, ar: { title: 'Scratch Level', content: 'Content' } } });
        levelId = level._id;
        console.log(`✅ Level Created: ${levelId}`);

        // 2. Test Create Scratch Exercise
        console.log('\n--- 2. Testing Create Scratch Exercise ---');

        // Scratch exercises use 'initialXml' and 'solutions' (array of strings for exact match usually)
        // Based on exerciseService: evaluateScratch normalizes XML string

        const correctXml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="controls_repeat_ext" id="r}TP#^@|T+?*G`%?.0!W" x="110" y="70"><value name="TIMES"><shadow type="math_number" id="?p!^7^gM2~#?*G`%?.0!W"><field name="NUM">10</field></shadow></value></block></xml>';

        const exercisePayload = {
            level: levelId,
            type: 'Scratch', // Using the XML type
            translations: {
                fr: { name: 'Scratch Loop', question: 'Create a loop that repeats 10 times', explanation: 'Use repeat block' },
                en: { name: 'Scratch Loop', question: 'Create a loop that repeats 10 times', explanation: 'Use repeat block' },
                ar: { name: 'Scratch Loop', question: 'Create a loop that repeats 10 times', explanation: 'Use repeat block' }
            },
            points: 20,
            initialXml: '<xml></xml>',
            solutions: [correctXml]
        };

        const reqCreate = mockReq(exercisePayload);
        const resCreate = mockRes();

        await executeController(CourseController.createExercise, reqCreate, resCreate);

        if (resCreate.statusCode === 201) {
            exerciseId = resCreate.body._id;
            console.log(`✅ Scratch Exercise Created: ${exerciseId}`);
        } else {
            console.error('❌ Failed to create Scratch exercise:', resCreate.statusCode, resCreate.body);
            throw new Error('Create Exercise Failed');
        }

        // 3. Test Submit Scratch Exercise - Correct Answer
        console.log('\n--- 3. Testing Submit Scratch (Correct) ---');

        // User submits the exact same XML (whitespace might differ, service should normalize)
        const userXmlCorrect = ` <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="controls_repeat_ext" id="r}TP#^@|T+?*G\`%?.0!W" x="110" y="70">
            <value name="TIMES">
                <shadow type="math_number" id="?p!^7^gM2~#?*G\`%?.0!W">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
    </xml> `;

        const submitPayloadCorrect = {
            userId: testUserId.toString(),
            answer: userXmlCorrect
        };

        const reqSubmitCorrect = mockReq(submitPayloadCorrect, { id: exerciseId });
        const resSubmitCorrect = mockRes();

        await executeController(CourseController.submitExercise, reqSubmitCorrect, resSubmitCorrect);

        if (resSubmitCorrect.body && resSubmitCorrect.body.success && resSubmitCorrect.body.correct) {
            console.log('✅ Correct Scratch Submission Verified');
            console.log('Points Earned:', resSubmitCorrect.body.pointsEarned);
        } else {
            console.error('❌ Correct Scratch Submission Failed:', resSubmitCorrect.body);
        }

        // 4. Test Submit Scratch Exercise - Incorrect Answer
        console.log('\n--- 4. Testing Submit Scratch (Incorrect) ---');

        const userXmlIncorrect = '<xml><block type="move_forward"></block></xml>';

        const reqSubmitIncorrect = mockReq({ userId: testUserId.toString(), answer: userXmlIncorrect }, { id: exerciseId });
        const resSubmitIncorrect = mockRes();

        await executeController(CourseController.submitExercise, reqSubmitIncorrect, resSubmitIncorrect);

        if (resSubmitIncorrect.body && resSubmitIncorrect.body.success && !resSubmitIncorrect.body.correct) {
            console.log('✅ Incorrect Scratch Submission Verified');
        } else {
            console.error('❌ Incorrect Scratch Submission Result:', resSubmitIncorrect.body);
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
