const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const ParentChild = require('./src/models/ParentChild');

const checkParentData = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const email = 'yassine1.gmatii@gamil.com'; // As typed by user
        // Also check corrected email just in case
        const emailCorrected = 'yassine1.gmatii@gmail.com';

        console.log(`\nSearching for user: ${email}`);
        const user = await User.findOne({ email: email });

        if (!user) {
            console.log('❌ User NOT found with exact email:', email);

            console.log(`Checking corrected email: ${emailCorrected}`);
            const userCorrected = await User.findOne({ email: emailCorrected });
            if (userCorrected) {
                console.log('✅ User FOUND with corrected email:', emailCorrected);
                console.log('ID:', userCorrected._id);
                console.log('Type:', userCorrected.userType);
                await checkRelations(userCorrected._id);
            } else {
                console.log('❌ User NOT found with corrected email either.');
                // List all parent users to help debug
                const parents = await User.find({ userType: 'parent' }).limit(5);
                console.log('\nOther parents in DB:', parents.map(p => ({ email: p.email, id: p._id })));
            }
        } else {
            console.log('✅ User FOUND with exact email:', email);
            console.log('ID:', user._id);
            console.log('Type:', user.userType);
            await checkRelations(user._id);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

async function checkRelations(parentId) {
    console.log(`\nChecking ParentChild relations for parentId: ${parentId}`);
    const relations = await ParentChild.find({ parent: parentId });

    if (relations.length === 0) {
        console.log('❌ No relationships found for this parent.');
    } else {
        console.log(`Found ${relations.length} relations:`);
        for (const rel of relations) {
            console.log(`- Child ID: ${rel.child}, Status: ${rel.status}`);
            // Check if child exists
            const child = await User.findById(rel.child);
            console.log(`  Child User: ${child ? child.email : 'NOT FOUND IN USERS'}`);
        }
    }
}

checkParentData();
