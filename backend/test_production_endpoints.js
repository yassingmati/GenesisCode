const axios = require('axios');

const BASE_URL = 'https://codegenesis-backend.onrender.com/api';
const ADMIN_CREDENTIALS = {
    email: 'admin2@test.com',
    password: 'password123'
};

const testBackend = async () => {
    console.log('🚀 Starting Backend Verification...');
    console.log(`Target: ${BASE_URL}`);

    let token = null;

    // 1. Login
    try {
        console.log('\n1️⃣  Testing Admin Login...');
        const loginRes = await axios.post(`${BASE_URL}/admin/login`, ADMIN_CREDENTIALS);
        token = loginRes.data.token;
        console.log('✅ Login Successful!');
    } catch (error) {
        console.error('❌ Login Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Dashboard Stats
    try {
        console.log('\n2️⃣  Testing Dashboard Stats...');
        const statsRes = await axios.get(`${BASE_URL}/admin/dashboard-stats`, config);
        console.log('✅ Stats Retrieved:', statsRes.data);
    } catch (error) {
        console.error('❌ Stats Failed:', error.response ? error.response.data : error.message);
    }

    // 3. User Management
    try {
        console.log('\n3️⃣  Testing User Management (/admin/users)...');
        const usersRes = await axios.get(`${BASE_URL}/admin/users`, config);
        console.log(`✅ Users Retrieved: ${usersRes.data.users.length} users.`);
    } catch (error) {
        console.error('❌ User Management Failed:', error.response ? error.response.data : error.message);
    }

    // 4. Category Plans (Checking for 404 fix)
    try {
        console.log('\n4️⃣  Testing Category Plans (/admin/category-plans)...');
        const plansRes = await axios.get(`${BASE_URL}/admin/category-plans`, config);
        console.log(`✅ Category Plans Retrieved: ${plansRes.data.plans.length} plans.`);
    } catch (error) {
        console.error('❌ Category Plans Failed:', error.response ? error.response.data : error.message);
    }

    // 5. Categories (The one that was 404ing in frontend)
    try {
        console.log('\n5️⃣  Testing Categories (/courses/categories)...');
        const catsRes = await axios.get(`${BASE_URL}/courses/categories`, config);
        console.log(`✅ Categories Retrieved: ${catsRes.data.length} categories.`);
    } catch (error) {
        console.error('❌ Categories Failed:', error.response ? error.response.data : error.message);
    }

    console.log('\n🏁 Verification Complete.');
};

testBackend();
