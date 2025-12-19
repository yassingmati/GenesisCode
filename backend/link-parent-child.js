const mongoose = require('mongoose');

// Hardcoded URI to ensure we target the correct DB
const URI = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0";

const linkAccounts = async () => {
    try {
        console.log('🔌 Connecting to Atlas...');
        await mongoose.connect(URI);
        console.log('✅ Connected.');

        const db = mongoose.connection.db;

        const parentEmail = "yassine1.gmatii@gmail.com";
        const childEmail = "genesiscodee@gmail.com";

        // 1. Find Parent
        const parent = await db.collection('users').findOne({ email: parentEmail });
        if (!parent) {
            console.error(`❌ Parent not found: ${parentEmail}`);
            process.exit(1);
        }
        console.log(`✅ Found Parent: ${parent.firstName} (ID: ${parent._id})`);

        // 2. Find Child
        const child = await db.collection('users').findOne({ email: childEmail });
        if (!child) {
            console.error(`❌ Child not found: ${childEmail}`);
            process.exit(1);
        }
        console.log(`✅ Found Child: ${child.firstName || 'Student'} (ID: ${child._id})`);

        // 3. Create Link
        const existingLink = await db.collection('parentchildren').findOne({
            parent: parent._id,
            child: child._id
        });

        if (existingLink) {
            console.log('⚠️ Link already exists. Updating status to active...');
            await db.collection('parentchildren').updateOne(
                { _id: existingLink._id },
                { $set: { status: 'active', updatedAt: new Date() } }
            );
        } else {
            console.log('➕ Creating new Active Link...');
            await db.collection('parentchildren').insertOne({
                parent: parent._id,
                child: child._id,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        console.log('✅ Accounts successfully linked!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

linkAccounts();
