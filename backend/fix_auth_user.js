require('dotenv').config();
const admin = require('./src/utils/firebaseAdmin');

const email = 'yassine.gmatii@gmail.com';

const fixUser = async () => {
    try {
        console.log(`Searching for user ${email} in Firebase...`);
        const userRecord = await admin.auth().getUserByEmail(email);
        console.log(`Found user: ${userRecord.uid}`);

        await admin.auth().deleteUser(userRecord.uid);
        console.log('✅ Successfully deleted user from Firebase.');
        console.log('You can now Register again with this email.');

    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log('User not found in Firebase. You should be able to Register.');
        } else {
            console.error('Error:', error);
        }
    }
    process.exit();
};

fixUser();
