const mongoose = require('mongoose');
const Level = require('./src/models/Level');
const Category = require('./src/models/Category');
const Path = require('./src/models/Path');

const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

async function getLevelId() {
    try {
        await mongoose.connect(MONGODB_URI);
        const category = await Category.findOne({ 'translations.fr.name': 'Débutant' });
        if (!category) throw new Error('Category not found');

        const path = await Path.findOne({ category: category._id });
        if (!path) throw new Error('Path not found');

        const level = await Level.findOne({ path: path._id });
        if (!level) throw new Error('Level not found');

        console.log(`LEVEL_ID=${level._id}`);
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

getLevelId();
