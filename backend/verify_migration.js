
const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./src/models/Category');
const Path = require('./src/models/Path');
const Level = require('./src/models/Level');

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const categories = await Category.find({ type: 'specific' }).lean();
        console.log(`Verified ${categories.length} specific categories.`);

        for (const cat of categories) {
            const paths = await Path.find({ category: cat._id });
            const levelsCount = await Level.countDocuments({ path: { $in: paths.map(p => p._id) } });
            console.log(`- ${cat.translations.en.name}: ${paths.length} paths, ${levelsCount} levels`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
