const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const Path = require('../src/models/Path');
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
        console.log('--- Searching for "Débutant" ---');

        const cat = await Category.findOne({
            $or: [
                { 'translations.fr.name': /débutant/i },
                { 'translations.en.name': /beginner/i },
                { name: /débutant/i }
            ]
        });
        if (cat) console.log(`Found Category: ${cat.translations?.fr?.name} (${cat._id})`);

        const p = await Path.findOne({
            $or: [
                { 'translations.fr.name': /débutant/i },
                { 'translations.en.name': /beginner/i },
                { name: /débutant/i }
            ]
        });
        if (p) console.log(`Found Path: ${p.translations?.fr?.name} (${p._id})`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
