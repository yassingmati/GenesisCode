// backend/src/scripts/verify_category_plans_migration.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Plan = require('../models/Plan');
const CategoryPlanController = require('../admin/controllers/categoryPlanController');

async function verifyMigration() {
    let testCategoryId = null;
    let testPlanId = null;

    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        // 1. Setup Test Data
        const uniqueId = Date.now();
        const testCategory = new Category({
            name: `Test Cat Migration ${uniqueId}`,
            active: true,
            translations: { fr: { name: `Test Cat ${uniqueId}`, description: 'Desc' } }
        });
        await testCategory.save();
        testCategoryId = testCategory._id;
        console.log('✅ Created Test Category:', testCategoryId);

        // Mock Req/Res
        const mockRes = {
            json: (data) => data,
            status: (code) => ({ json: (data) => ({ ...data, status: code }) })
        };

        // 2. Test Create
        console.log('🧪 Testing Create...');
        const createReq = {
            body: {
                categoryId: testCategoryId,
                price: 50,
                currency: 'TND',
                paymentType: 'one_time',
                accessDuration: 180,
                translations: { fr: { name: 'Test Plan', description: 'Test Desc' } }
            }
        };
        const createResult = await CategoryPlanController.createCategoryPlan(createReq, mockRes);

        if (!createResult.success) throw new Error('Create failed: ' + createResult.message);
        testPlanId = createResult.plan._id;

        // Verify in DB
        const planInDb = await Plan.findById(testPlanId);
        if (!planInDb || planInDb.type !== 'Category') throw new Error(`Plan not found or wrong type in DB. Expected 'Category', got '${planInDb?.type}'`);
        if (planInDb.accessDuration !== 180) throw new Error('accessDuration not saved correctly');
        console.log('✅ Create successful');

        // 3. Test Get
        console.log('🧪 Testing Get...');
        const getReq = { params: { categoryId: testCategoryId } };
        const getResult = await CategoryPlanController.getCategoryPlan(getReq, mockRes);
        if (!getResult.success) throw new Error('Get failed');
        if (getResult.plan._id !== testPlanId) throw new Error('Get returned wrong plan');
        console.log('✅ Get successful');

        // 4. Test Update
        console.log('🧪 Testing Update...');
        const updateReq = {
            params: { id: testPlanId },
            body: { price: 100, accessDuration: 365 }
        };
        const updateResult = await CategoryPlanController.updateCategoryPlan(updateReq, mockRes);
        if (updateResult.plan.priceMonthly !== 100) throw new Error('Update price failed');
        if (updateResult.plan.accessDuration !== 365) throw new Error('Update duration failed');
        console.log('✅ Update successful');

        // 5. Test Delete
        console.log('🧪 Testing Delete...');
        const deleteReq = { params: { id: testPlanId } };
        await CategoryPlanController.deleteCategoryPlan(deleteReq, mockRes);
        const planAfterDelete = await Plan.findById(testPlanId);
        if (planAfterDelete) throw new Error('Delete failed, plan still exists');
        console.log('✅ Delete successful');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        // Cleanup
        if (testPlanId) {
            await Plan.findByIdAndDelete(testPlanId);
        }
        if (testCategoryId) {
            await Category.findByIdAndDelete(testCategoryId);
        }
        console.log('🧹 Cleanup done');
        await mongoose.disconnect();
    }
}

verifyMigration();
