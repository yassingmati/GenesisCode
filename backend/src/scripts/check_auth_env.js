const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath, override: true });

const admin = require('../utils/firebaseAdmin');

const checkFirebase = () => {
    try {
        const isAvailable = admin.apps.length > 0;
        console.log('Firebase Configured:', isAvailable);
        console.log('FIREBASE_WEB_API_KEY:', process.env.FIREBASE_WEB_API_KEY ? 'Present' : 'Missing');

        if (isAvailable) {
            console.log('Attempting to use Firebase Admin...');
            // We could try to fetch the user from Firebase if we had the right scope
        }
    } catch (e) {
        console.error('Firebase Check Error:', e.message);
    }
};

checkFirebase();
