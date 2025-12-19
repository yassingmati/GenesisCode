const axios = require('axios');

const REGISTER_URL = 'https://codegenesis-backend.onrender.com/api/auth/register';
const SECRET = 'genesis_repair_secret_2025';

const repair = async (email, password) => {
    console.log(`Triggering repair via REGISTER for ${email}...`);
    try {
        const res = await axios.post(REGISTER_URL, {
            email,
            password,
            repairSecret: SECRET
        });
        console.log(`✅ Success for ${email}:`, res.data);
    } catch (error) {
        if (error.response) {
            console.error(`❌ Failed for ${email} (${error.response.status}):`, error.response.data);
        } else {
            console.error(`❌ Network Error for ${email}:`, error.message);
        }
    }
};

const main = async () => {
    console.log('Waiting 10s for deploy...');
    await new Promise(r => setTimeout(r, 10000));

    await repair('parent_test@codegenesis.com', 'Password123!');
    await repair('enfant_test@codegenesis.com', 'Password123!');
};

main();
