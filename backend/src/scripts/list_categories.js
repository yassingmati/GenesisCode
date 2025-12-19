require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/codegenesis';

async function listCategories() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');
        console.log(`🔌 URI: ${MONGO_URI.replace(/:([^:@]+)@/, ':****@')}`); // Hide password

        const categories = await Category.find({}, '_id name slug');
        console.log('\n📊 Categories Found:', categories.length);
        console.table(categories.map(c => ({
            id: c._id.toString(),
            name: c.name,
            slug: c.slug
        })));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

listCategories();
