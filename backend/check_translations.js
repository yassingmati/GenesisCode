
const mongoose = require('mongoose');
require('dotenv').config();

const Level = require('./src/models/Level');
const Path = require('./src/models/Path');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Check a Path
        const path = await Path.findOne({ 'translations.en.name': /Introduction/ });
        if (path) {
            console.log('Path Check:');
            console.log('EN:', path.translations.en.name);
            console.log('FR:', path.translations.fr.name);
            console.log('AR:', path.translations.ar.name);
        }

        // Check a Level
        const level = await Level.findOne({ 'translations.en.title': /Variable/ });
        if (level) {
            console.log('Level Check:');
            console.log('EN:', level.translations.en.title);
            console.log('FR:', level.translations.fr.title);
            console.log('AR:', level.translations.ar.title);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
