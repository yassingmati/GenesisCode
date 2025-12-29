const mongoose = require('mongoose');
const ParentChild = require('./src/models/ParentChild');
const User = require('./src/models/User');
require('dotenv').config();

const debugRelations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Case insensitive search for the user
        const targetEmailLower = 'yassine.gmatii@gmail.com'.toLowerCase();

        // Find all users that might match
        const users = await User.find({
            $or: [
                { email: { $regex: 'yassine', $options: 'i' } },
                { email: targetEmailLower }
            ]
        });

        console.log(`\nFound ${users.length} users matching 'yassine' or exact email:`);
        users.forEach(u => console.log(` - ID: ${u._id}, Email: '${u.email}', Type: ${u.userType}`));

        if (users.length === 0) {
            console.log("CRITICAL: User not found even with loose search!");
        } else {
            const targetUser = users[0]; // Assume first one is relevant for now

            console.log(`\nChecking relations for Child ID: ${targetUser._id}`);
            const relations = await ParentChild.find({ child: targetUser._id });
            console.log(`Found ${relations.length} relations for this child.`);

            relations.forEach(rel => {
                console.log(` REL: ${rel._id}`);
                console.log(`   Parent: ${rel.parent}`);
                console.log(`   Status: '${rel.status}'`);  // critical check for spaces/casing
                console.log(`   Invited: ${rel.invitedAt}`);
                console.log(`   Accepted: ${rel.acceptedAt}`);
            });

            // Also check if this user is a parent having invites?
            const parentRelations = await ParentChild.find({ parent: targetUser._id });
            if (parentRelations.length > 0) {
                console.log(`\nUser is also a PARENT in ${parentRelations.length} relations.`);
            }
        }

        // Dump all relations just in case
        console.log("\nDumping ALL ParentChild relations:");
        const all = await ParentChild.find({});
        all.forEach(r => console.log(` ${r._id}: ${r.parent} -> ${r.child} [${r.status}]`));


    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugRelations();
