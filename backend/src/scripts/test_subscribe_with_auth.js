require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const User = require('../models/User');

// Hardcoded for testing since we just wrote it to .env
// In a real script we would rely on dotenv, but path resolution can be tricky
const SECRET = process.env.JWT_SECRET || 'b1c3a42a9367c4b83fe7633960c483a260c267a7bb2a3654541c0e2802c66d31';

async function testSubscribeWithAuth() {
    console.log('🚀 Testing Subscribe Endpoint with FRESH TOKEN...');

    try {
        // 1. Connect to DB to find User
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ DB Connected');

        // Use a user KNOWN to exist in the server's view (from debug logs)
        const user = await User.findOne({ email: 'test@example.com' });
        if (!user) {
            throw new Error('User test@example.com not found!');
        }
        console.log('✅ User Found:', user._id);

        // 2. Generate Valid Token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            SECRET,
            { expiresIn: '1h' }
        );
        console.log('✅ Token Generated');

        // 3. Make Request
        const url = "http://localhost:5000/api/subscriptions/subscribe";
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };
        // Use "plan-javascript" as requested by user, relying on backend to resolve or error if strictly checking IDs
        // We verified plan-javascript exists in Step 711
        const body = JSON.stringify({
            "planId": "plan-javascript",
            "returnUrl": "http://localhost:3000/payment/success",
            "cancelUrl": "http://localhost:3000/payment/cancel"
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        console.log(`\nResponse Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log('Response Body:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testSubscribeWithAuth();
