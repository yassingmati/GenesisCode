const axios = require('axios');

const API_URL = 'https://codegenesis-backend.onrender.com/api/auth/repair-test-user';
const SECRET = 'genesis_repair_secret_2025';

const repair = async (email, password) => {
    console.log(`Triggering repair for ${email}...`);
    try {
        const res = await axios.post(API_URL, {
            email,
            password,
            secret: SECRET
        });
        console.log(`✅ Success for ${email}:`, res.data);
    } catch (error) {
        if (error.response) {
            console.error(`❌ Failed for ${email} (${error.response.status}):`, error.response.data);
        } else {
            console.error(`❌ Network/Other Error for ${email}:`, error.message);
        }
    }
};

const main = async () => {
    // Wait Loop for deployment? 
    // We'll just try immediately, assuming user might run this later or I retry.
    // Actually, I'll recommend the user to wait 2-3 mins if this fails.

    console.log('Attempting to repair test users on remote server...');
    await repair('parent_test@codegenesis.com', 'Password123!');
    await repair('enfant_test@codegenesis.com', 'Password123!');
};

main();
