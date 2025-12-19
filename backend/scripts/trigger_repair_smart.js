const axios = require('axios');

const BASE_URL = 'https://codegenesis-backend.onrender.com/api/auth';
const REPAIR_URL = `${BASE_URL}/repair-test-user`;
const PING_URL = `${BASE_URL}/ping`;
const SECRET = 'genesis_repair_secret_2025';

const checkPing = async () => {
    try {
        console.log('Testing /ping...');
        const res = await axios.get(PING_URL);
        console.log('✅ Ping success:', res.data);
        return true;
    } catch (error) {
        console.log('❌ Ping failed:', error.response ? error.response.status : error.message);
        if (error.response?.status === 404) {
            console.log('   -> Server code is OLD (route missing)');
        }
        return false;
    }
};

const repair = async (email, password) => {
    console.log(`Triggering repair for ${email}...`);
    try {
        const res = await axios.post(REPAIR_URL, {
            email,
            password,
            secret: SECRET
        });
        console.log(`✅ Repair success for ${email}:`, res.data);
    } catch (error) {
        if (error.response) {
            console.error(`❌ Repair failed for ${email} (${error.response.status}):`, error.response.data);
        } else {
            console.error(`❌ Repair network error for ${email}:`, error.message);
        }
    }
};

const main = async () => {
    let pingOk = await checkPing();
    if (!pingOk) {
        console.log('Waiting 10s and retrying ping...');
        await new Promise(r => setTimeout(r, 10000));
        pingOk = await checkPing();
    }

    if (pingOk) {
        console.log('Server is updated. Attempting repair...');
        await repair('parent_test@codegenesis.com', 'Password123!');
        await repair('enfant_test@codegenesis.com', 'Password123!');
    } else {
        console.log('Giving up on repair script for now. Deployment too slow.');
    }
};

main();
