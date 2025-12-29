const mongoose = require('mongoose');
const Plan = require('../src/models/Plan');
const Category = require('../src/models/Category');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
    } catch (err) {
        console.error('DB Connection error:', err);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();

    try {
        // 1. Get a category ID
        const category = await Category.findOne();
        if (!category) throw new Error('No categories found for testing');

        // 2. Simulate Creating a Category Plan (Mocking Controller Logic)
        const mockReqBody = {
            _id: 'test_java_plan_' + Date.now(),
            name: 'Test Java Plan',
            type: 'Category',
            targetId: category._id,
            active: true
        };

        console.log('--- Creating Plan ---');
        console.log('Payload:', mockReqBody);

        const plan = await Plan.create(mockReqBody);
        console.log('Plan Created:', plan);

        // 3. Verify Plan Properties
        if (plan.type !== 'Category') {
            console.error('❌ FAIL: Plan type is not Category');
        } else if (String(plan.targetId) !== String(category._id)) {
            console.error('❌ FAIL: TargetId mismatch');
        } else {
            console.log('✅ PASS: Plan created with correct Type and TargetId');
        }

        // 4. Cleanup
        await Plan.deleteOne({ _id: plan._id });
        console.log('Cleanup complete');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
