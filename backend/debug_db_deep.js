const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const debugDb = async () => {
    try {
        console.log('🔌 Connecting to:', process.env.MONGODB_URI);
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        const db = mongoose.connection.db;

        // 1. List Collections
        console.log('\n📂 Collections in database:');
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        console.log(collectionNames);

        if (collectionNames.length === 0) {
            console.log('⚠️  NO COLLECTIONS FOUND! The database might be empty or the name in URI is wrong.');
            return;
        }

        // 2. Check Users Collection
        if (collectionNames.includes('users')) {
            const count = await db.collection('users').countDocuments();
            console.log(`\njm Users count: ${count}`);

            if (count > 0) {
                console.log('🔎 Searching for variants of "yassine"...');
                // Regex search for 'yassine' case insensitive
                const users = await db.collection('users').find({
                    $or: [
                        { email: { $regex: /yassine/i } },
                        { firstName: { $regex: /yassine/i } },
                        { lastName: { $regex: /yassine/i } }
                    ]
                }).toArray();

                if (users.length > 0) {
                    console.log('✅ Found POTENTIAL matches:');
                    users.forEach(u => {
                        console.log(`- ID: ${u._id}`);
                        console.log(`  Email: "${u.email}"`);
                        console.log(`  Type: ${u.userType}`);
                        console.log(`  Names: ${u.firstName} ${u.lastName}`);
                    });

                    // Check relations for the first match
                    const parentId = users[0]._id;
                    const relations = await db.collection('parentchildren').find({ parent: parentId }).toArray();
                    console.log(`\nRelationships for first match (${users[0].email}):`, relations.length);
                    relations.forEach(r => console.log('  -> Child ID:', r.child, 'Status:', r.status));

                } else {
                    console.log('❌ No users found matching "yassine".');
                    console.log('Listing first 5 users in DB:');
                    const first5 = await db.collection('users').find({}).limit(5).toArray();
                    first5.forEach(u => console.log(`- ${u.email}`));
                }
            }
        } else {
            console.log('❌ "users" collection NOT found.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugDb();
