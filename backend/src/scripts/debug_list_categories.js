const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const listCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const categories = await Category.find({}, 'name _id slug');
        console.log('Catégories trouvées:', categories);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listCategories();
