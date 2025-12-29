const mongoose = require('mongoose');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const CategoryAccess = require('../src/models/CategoryAccess');
const Subscription = require('../src/models/Subscription');
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
        const userId = '6946e406164e7e166b4b9422';
        const categoryId = '6924480bc5bbbad53eb05cfe';

        // 1. Check User
        const user = await User.findById(userId);
        if (!user) {
            console.log('❌ User NOT FOUND:', userId);
        } else {
            console.log(`✅ User Found: ${user.email} (${user._id})`);
            console.log('Roles:', user.roles);
            console.log('Subscription:', user.subscription);
        }

        // Check Specific Access
        const javaId = '6924480bc5bbbad53eb05cfe';
        const debutantId = '69244803c5bbbad53eb05bfc';

        const javaAccess = await CategoryAccess.findOne({ user: userId, category: javaId });
        console.log(`Java Access: ${javaAccess ? '✅ GRANTED' : '❌ DENIED'}`);
        if (javaAccess) console.log(javaAccess);

        const debutantAccess = await CategoryAccess.findOne({ user: userId, category: debutantId });
        console.log(`Débutant Access: ${debutantAccess ? '✅ GRANTED' : '❌ DENIED'}`);
        if (debutantAccess) console.log(debutantAccess);

        const pythonBasesId = '6947002b9f5918eff2b44bb3';
        const pythonAccess = await CategoryAccess.findOne({ user: userId, category: pythonBasesId });
        console.log(`Python Bases Access: ${pythonAccess ? '✅ GRANTED' : '❌ DENIED'}`);
        if (pythonAccess) console.log(pythonAccess);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
