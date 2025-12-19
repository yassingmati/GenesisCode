const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath, override: true });

const run = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        console.log('Connecting to:', uri ? uri.replace(/\/\/.*@/, '//***:***@') : 'UNDEFINED');
        await mongoose.connect(uri);

        console.log('Connected to:', mongoose.connection.name);

        const collectionName = 'plans';
        console.log(`\nInspecting collection: '${collectionName}'`);

        const docs = await mongoose.connection.db.collection(collectionName).find({}).toArray();
        console.log(`Found ${docs.length} documents.`);

        if (docs.length > 0) {
            console.log('Sample document keys:', Object.keys(docs[0]));
            console.log('Sample document:', JSON.stringify(docs[0], null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
run();
