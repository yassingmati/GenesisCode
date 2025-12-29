const mongoose = require('mongoose');
const CategoryPlan = require('./src/models/CategoryPlan');
const Level = require('./src/models/Level');
require('dotenv').config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
};

const findDetails = async () => {
    await connectDB();
    try {
        const javaCatId = '6932bab9ab7588ce73b7a591';

        console.log('Searching CategoryPlan for Category:', javaCatId);
        const catPlan = await CategoryPlan.findOne({ category: javaCatId });
        console.log('CategoryPlan:', catPlan ? catPlan._id : 'Not Found');

        console.log('Listing all Levels:');
        const levels = await Level.find({});
        levels.forEach(l => console.log(`- ${l.name || l.translations?.fr?.name} (${l._id})`));

    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
};

findDetails();
