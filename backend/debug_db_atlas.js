const mongoose = require('mongoose');

// Hardcoded URI to ensure we check the exact requested DB
const URI = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0";

const debugDb = async () => {
    try {
        console.log('🔌 Connecting to HARDCODED URI:', URI);
        await mongoose.connect(URI);
        console.log('✅ Connected.');

        const db = mongoose.connection.db;

        // Check Users Collection
        const count = await db.collection('users').countDocuments();
        console.log(`\nUsers count in Atlas: ${count}`);

        const email = "yassine1.gmatii@gmail.com";
        console.log(`🔎 Searching for specific user: "${email}"...`);

        const user = await db.collection('users').findOne({ email: email });

        if (user) {
            console.log('✅ USER FOUND!');
            console.log(`- ID: ${user._id}`);
            console.log(`- Type: ${user.userType}`);
            console.log(`- Firebase UID: ${user.firebaseUid}`);

            // Check relations
            const relations = await db.collection('parentchildren').find({ parent: user._id }).toArray();
            console.log(`\nRelationships (parentchildren): ${relations.length}`);
            if (relations.length > 0) {
                for (const r of relations) {
                    console.log(`  -> Child ID: ${r.child}, Status: ${r.status}`);
                    // Check if child exists
                    const child = await db.collection('users').findOne({ _id: r.child });
                    console.log(`     Child Email: ${child ? child.email : 'NOT FOUND'}`);
                }
            } else {
                console.log('⚠️ User exists but has NO entries in parentchildren collection.');
            }

        } else {
            console.log('❌ User STILL NOT FOUND in Atlas.');
            // Dump top 5 emails
            const allUsers = await db.collection('users').find({}, { projection: { email: 1 } }).limit(10).toArray();
            console.log('First 10 users in DB:', allUsers.map(u => u.email));
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugDb();
