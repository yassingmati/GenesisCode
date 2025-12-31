
const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./src/models/Category');
const Path = require('./src/models/Path');
const Level = require('./src/models/Level');

const run = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is missing in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const specificCategories = await Category.find({ type: 'specific' }).lean();
        console.log(`Found ${specificCategories.length} specific categories:`);

        for (const cat of specificCategories) {
            console.log(`- [${cat._id}] ${cat.translations.fr.name} / ${cat.translations.en.name}`);
            const paths = await Path.find({ category: cat._id }).countDocuments();
            console.log(`  Targeting deletion of ${paths} paths associated with this category.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
