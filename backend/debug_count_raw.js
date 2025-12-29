const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB:', mongoose.connection.name);

    const collName = 'categoryaccesses';
    const count = await mongoose.connection.db.collection(collName).countDocuments();
    console.log(`Total documents in raw '${collName}' collection: ${count}`);

    const docs = await mongoose.connection.db.collection(collName).find().toArray();
    console.log('First 5 docs _id:', docs.slice(0, 5).map(d => d._id));

    // Check unique users
    const uniqueUsers = [...new Set(docs.map(d => d.user?.toString()))];
    console.log(`Unique user IDs found: ${uniqueUsers.length}`);

    process.exit();
};

run();
