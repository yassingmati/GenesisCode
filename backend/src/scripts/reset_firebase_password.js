const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath, override: true });

const admin = require('../utils/firebaseAdmin');

const resetPassword = async () => {
    try {
        const uid = 'qMQSeT6EHIfKe9a8hfaG9At3m8z2'; // UID from DB inspection
        const newPassword = 'password123'; // Setting a known password (user asked for 1234567 but min length is often 6. 1234567 is 7 chars so fine. I'll use what they sent: 1234567)

        console.log(`Resetting password for UID: ${uid}...`);

        await admin.auth().updateUser(uid, {
            password: '1234567'
        });

        console.log('✅ Password successfully updated to: 1234567');

        // Verify user info
        const userRecord = await admin.auth().getUser(uid);
        console.log('User email:', userRecord.email);
        console.log('User disabled:', userRecord.disabled);

    } catch (e) {
        console.error('❌ Error updating password:', e.message);
    }
};

resetPassword();
