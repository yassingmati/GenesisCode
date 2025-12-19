require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/subscriptions';
// Mock headers similar to frontend
const HEADERS = {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:3000'
};

async function testBackend() {
    console.log('🚀 Starting Backend Subscription Tests...');

    try {
        // 1. Test GET Plans
        console.log('\nTesting GET /api/subscriptions/plans...');
        const plansRes = await fetch(`${BASE_URL}/plans`, { headers: HEADERS });
        const plansData = await plansRes.json();

        if (plansRes.ok) {
            console.log('✅ Plans fetched successfully:', plansData.plans?.length || 0, 'plans found.');
            if (plansData.plans?.length > 0) {
                console.log('Sample Plan:', plansData.plans[0].name || plansData.plans[0].translations?.fr?.name);
            }
        } else {
            console.error('❌ Failed to fetch plans:', plansData);
        }

        // 2. Test Subscribe (requires auth token ideally, but let's see response code)
        // We expect 401 Unauthorized if no token, which confirms the endpoint exists and is protected.
        console.log('\nTesting POST /api/subscriptions/subscribe (without token)...');
        const subRes = await fetch(`${BASE_URL}/subscribe`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ planId: 'fake_id' })
        });

        if (subRes.status === 401) {
            console.log('✅ Endpoint is protected (401 Unauthorized received as expected).');
        } else {
            console.log(`⚠️ User might be able to subscribe without token? Status: ${subRes.status}`);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

testBackend();
