const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:5000/api';
// Real IDs from DB
const TEST_USER_ID = '6932baff8cc43217b6221091';
const EXERCISE_ID = '6932bab8ab7588ce73b7a4d3';

async function testSubmitPerformance() {
    console.log('--- Training Submit Performance Test ---');

    const payload = {
        userId: TEST_USER_ID,
        answer: "passed",
        passed: true,
        passedCount: 1,
        totalCount: 1,
        tests: []
    };

    const start = Date.now();
    try {
        const response = await fetch(`${API_URL}/courses/exercises/${EXERCISE_ID}/submit-public`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const end = Date.now();
        const duration = end - start;

        console.log(`Response Status: ${response.status}`);
        console.log(`Response Time: ${duration}ms`);

        if (response.ok) {
            const data = await response.json();
            console.log('Response Data:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log('Error Response:', text);
        }

        console.log('If Response Time is < 200ms, optimization is working.');

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testSubmitPerformance();
