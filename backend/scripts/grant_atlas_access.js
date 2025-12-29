const mongoose = require('mongoose');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Plan = require('../src/models/Plan');
const CategoryAccess = require('../src/models/CategoryAccess');
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
        const email = 'yassine.gmatii@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.error('❌ User NOT FOUND:', email);
            return;
        }
        console.log(`✅ User Found: ${user.email} (${user._id})`);

        // --- Grant Java Access ---
        const javaCat = await Category.findOne({
            $or: [
                { 'translations.fr.name': 'Java' },
                { 'translations.en.name': 'Java' },
                { 'name': 'Java' }
            ]
        });

        if (javaCat) {
            console.log(`Found Java Category: ${javaCat._id}`);
            let plan = await Plan.findOne({ type: 'Category', targetId: javaCat._id });
            if (!plan) {
                plan = await Plan.create({
                    _id: 'java_atlas_plan_' + Date.now(),
                    name: 'Java Access Plan (Atlas)',
                    type: 'Category',
                    targetId: javaCat._id,
                    priceMonthly: 0,
                    active: true
                });
            }

            await CategoryAccess.findOneAndUpdate(
                { user: user._id, category: javaCat._id },
                {
                    user: user._id,
                    category: javaCat._id,
                    plan: plan._id,
                    accessType: 'free',
                    status: 'active',
                    expiresAt: null
                },
                { upsert: true, new: true }
            );
            console.log('✅ Granted Java Access');
        } else {
            console.error('❌ Java Category NOT FOUND');
        }

        // --- Grant Débutant Access ---
        const debutantCat = await Category.findOne({
            $or: [
                { 'translations.fr.name': 'Débutant' },
                { 'translations.en.name': 'Beginner' },
                { 'name': 'Débutant' }
            ]
        });

        if (debutantCat) {
            console.log(`Found Débutant Category: ${debutantCat._id}`);
            let dPlan = await Plan.findOne({ type: 'Category', targetId: debutantCat._id });
            if (!dPlan) {
                dPlan = await Plan.create({
                    _id: 'debutant_atlas_plan_' + Date.now(),
                    name: 'Débutant Access Plan (Atlas)',
                    type: 'Category',
                    targetId: debutantCat._id,
                    priceMonthly: 0,
                    active: true
                });
            }

            await CategoryAccess.findOneAndUpdate(
                { user: user._id, category: debutantCat._id },
                {
                    user: user._id,
                    category: debutantCat._id,
                    plan: dPlan._id,
                    accessType: 'free',
                    status: 'active',
                    expiresAt: null
                },
                { upsert: true, new: true }
            );
            console.log('✅ Granted Débutant Category Access');
        } else {
            console.error("❌ Débutant Category NOT FOUND");
        }

        // --- Grant 'Apprendre les bases de Python' Access ---
        const pythonBasesId = '6947002b9f5918eff2b44bb3';
        const pythonBasesCat = await Category.findById(pythonBasesId);

        if (pythonBasesCat) {
            console.log(`Found Python Bases Category: ${pythonBasesCat._id}`);
            let pPlan = await Plan.findOne({ type: 'Category', targetId: pythonBasesCat._id });
            if (!pPlan) {
                pPlan = await Plan.create({
                    _id: 'python_bases_atlas_plan_' + Date.now(),
                    name: 'Python Bases Access Plan (Atlas)',
                    type: 'Category',
                    targetId: pythonBasesCat._id,
                    priceMonthly: 0,
                    active: true
                });
            }

            await CategoryAccess.findOneAndUpdate(
                { user: user._id, category: pythonBasesCat._id },
                {
                    user: user._id,
                    category: pythonBasesCat._id,
                    plan: pPlan._id,
                    accessType: 'free',
                    status: 'active',
                    expiresAt: null
                },
                { upsert: true, new: true }
            );
            console.log('✅ Granted Python Bases Category Access');
        } else {
            console.error("❌ Python Bases Category NOT FOUND");
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
