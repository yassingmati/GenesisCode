const mongoose = require('mongoose');
const ParentChild = require('./src/models/ParentChild');
const User = require('./src/models/User');
require('dotenv').config();

const debugRelations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB at host: ${mongoose.connection.host}`);
        console.log(`Database name: ${mongoose.connection.name}`);

        // Dump ALL users
        const users = await User.find({});
        console.log(`\n Total Users: ${users.length}`);
        users.forEach(u => console.log(` - [${u._id}] ${u.email} (${u.userType})`));

        // Dump ALL relations
        const relations = await ParentChild.find({});
        console.log(`\n Total Relations: ${relations.length}`);
        relations.forEach(r => {
            console.log(` - [${r._id}] Parent:${r.parent} -> Child:${r.child} Status:${r.status}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugRelations();
