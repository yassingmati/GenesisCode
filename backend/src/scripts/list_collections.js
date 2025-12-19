const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to:', mongoose.connection.name);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nCollections:');
        collections.forEach(c => console.log(`- ${c.name} (${c.type})`));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
run();
