const fetch = require('node-fetch');

async function testSubscribe() {
    console.log('🚀 Testing Subscribe Endpoint with provided data...');

    const url = "http://localhost:5000/api/subscriptions/subscribe";
    const headers = {
        "accept": "*/*",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MTFkNTUxN2U4NDdjNTViN2FkNGExNSIsImVtYWlsIjoiZ29vZ2xlLXRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjUyNzYwNjQsImV4cCI6MTc2NTM2MjQ2NH0.b2Bm3fHNgLBTb-AUcI_iYm48jomLx4WWS9kftcCecqw",
        "content-type": "application/json"
    };
    const body = JSON.stringify({
        "planId": "plan-javascript",
        "returnUrl": "http://localhost:3000/payment/success",
        "cancelUrl": "http://localhost:3000/payment/cancel"
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        console.log(`Response Status: ${response.status} ${response.statusText}`);
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            console.log('Response Body:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log('Response Text:', text);
        }

    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

testSubscribe();
