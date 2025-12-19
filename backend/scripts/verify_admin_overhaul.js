// backend/scripts/verify_admin_overhaul.js
const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_URL = 'http://localhost:5000/api';
let adminToken = '';

// Test Data
const TEST_PLAN = {
    _id: 'test-verification-plan',
    name: 'Plan Test Automation',
    priceMonthly: 5000,
    currency: 'TND',
    type: 'global',
    features: ['Test Feature 1', 'Test Feature 2']
};

async function runTests() {
    try {
        console.log('🚀 Starting Backend Verification for Admin Overhaul...');

        // 1. Authenticate as Admin (Simulating or creating one)
        // Note: For this script to work, we need a valid admin in DB or we use a hardcoded dev token if available.
        // Or we register a temp admin.
        console.log('🔑 Authenticating...');
        try {
            // Attempt login with a known dev admin, or register one
            const loginRes = await axios.post(`${API_URL}/admin/login`, {
                email: 'admin@codegenesis.com',
                password: 'adminpassword123'
            });
            adminToken = loginRes.data.token;
            console.log('✅ Login successful');
        } catch (e) {
            console.log('⚠️ Login failed, attempting to register temp admin...');
            try {
                const regRes = await axios.post(`${API_URL}/admin/register`, {
                    email: 'admin@codegenesis.com',
                    password: 'adminpassword123'
                });
                adminToken = regRes.data.token;
                console.log('✅ Registration successful');
            } catch (regError) {
                console.error('❌ Authentication failed. Details:', regError.response?.data || regError.message);
                // Try logging in with a known user if possible or skip auth check for debugging if local
                process.exit(1);
            }
        }

        const headers = { Authorization: `Bearer ${adminToken}` };

        // 2. DASHBOARD STATS
        console.log('\n📊 Testing Dashboard Stats...');
        try {
            const statsRes = await axios.get(`${API_URL}/admin/dashboard-stats`, { headers });
            console.log('✅ Stats received:', statsRes.data);
            if (statsRes.data.users === undefined || statsRes.data.payments === undefined) {
                throw new Error('Invalid stats structure');
            }
        } catch (e) {
            console.error('❌ Dashboard Stats Failed:', e.response?.data || e.message);
        }

        // 3. PLAN MANAGEMENT (CRUD)
        console.log('\n🏷️ Testing Plan Management...');

        // CREATE
        console.log('   - Creating Plan...');
        try {
            // Cleanup first just in case
            // access DB directly or just try to create. 
            // We'll trust the API.
            await axios.post(`${API_URL}/admin/plans`, TEST_PLAN, { headers });
            console.log('   ✅ Plan created');
        } catch (e) {
            if (e.response?.data?.message?.includes('déjà utilisé')) {
                console.log('   ⚠️ Plan already exists, proceeding...');
            } else {
                console.error('   ❌ Create Plan Failed:', e.response?.data || e.message);
            }
        }

        // READ
        console.log('   - Listing Plans...');
        const plansRes = await axios.get(`${API_URL}/admin/plans`, { headers });
        const found = plansRes.data.plans.find(p => p._id === TEST_PLAN._id);
        if (found) console.log('   ✅ Plan found in list');
        else console.error('   ❌ Plan NOT found in list');

        // UPDATE
        console.log('   - Updating Plan...');
        try {
            await axios.put(`${API_URL}/admin/plans/${TEST_PLAN._id}`, { name: 'Plan Updated Name' }, { headers });
            console.log('   ✅ Plan updated');
        } catch (e) {
            console.error('   ❌ Update Plan Failed:', e.response?.data || e.message);
        }

        // DELETE
        console.log('   - Deleting Plan...');
        try {
            await axios.delete(`${API_URL}/admin/plans/${TEST_PLAN._id}`, { headers });
            console.log('   ✅ Plan deleted');
        } catch (e) {
            console.error('   ❌ Delete Plan Failed:', e.response?.data || e.message);
        }


        // 4. PAYMENTS HISTORY
        console.log('\n💳 Testing Payment History...');
        try {
            const payRes = await axios.get(`${API_URL}/admin/payments/history?limit=5`, { headers });
            console.log(`   ✅ Payments listed: ${payRes.data.payments.length} items returned`);
        } catch (e) {
            console.error('   ❌ Payment History Failed:', e.response?.data || e.message);
        }

        // 5. USER MANAGEMENT
        console.log('\n👥 Testing User Management...');
        try {
            const usersRes = await axios.get(`${API_URL}/admin/users`, { headers });
            console.log(`   ✅ Users listed: ${usersRes.data.users.length} items returned`);

            if (usersRes.data.users.length > 0) {
                const targetUser = usersRes.data.users[0];
                console.log(`   - Testing Role Update on ${targetUser.email || targetUser._id}...`);
                // Be careful not to break real usage, just toggle same role or add harmless one if possible. 
                // We'll just set it to what it is to verify 200 OK.
                await axios.put(`${API_URL}/admin/users/${targetUser._id}/role`, { roles: targetUser.roles || [] }, { headers });
                console.log('   ✅ Role update successful (dry run)');
            }
        } catch (e) {
            console.error('   ❌ User Management Failed:', e.response?.data || e.message);
        }

        console.log('\n✨ Verification Complete!');

    } catch (err) {
        console.error('Fatal Error:', err);
    }
}

runTests();
