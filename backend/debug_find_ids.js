const mongoose = require('mongoose');
const Path = require('./src/models/Path');
const Level = require('./src/models/Level');
const Category = require('./src/models/Category');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const findIds = async () => {
    await connectDB();
    try {
        // Find Java stuff
        const categories = await Category.find({
            $or: [
                { 'name': /java/i },
                { 'translations.fr.name': /java/i }
            ]
        });
        console.log('Categories found:', categories.map(c => ({ id: c._id, name: c.name || c.translations?.fr?.name })));

        const paths = await Path.find({
            $or: [
                { 'name': /java/i },
                { 'translations.fr.name': /java/i }
            ]
        });
        console.log('Paths found:', paths.map(p => ({ id: p._id, name: p.name || p.translations?.fr?.name })));

        const levels = await Level.find({
            $or: [
                { 'name': /débutant/i },
                { 'translations.fr.name': /débutant/i },
                { 'name': /beginner/i }
            ]
        });
        console.log('Levels found:', levels.map(l => ({ id: l._id, name: l.name || l.translations?.fr?.name })));

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

findIds();
