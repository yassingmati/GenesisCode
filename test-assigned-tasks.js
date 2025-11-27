const axios = require('axios');

async function testAssignedTasks() {
    try {
        // We need a token. Since we can't easily get one from the browser session here,
        // we might need to login as admin first or use a known token if available.
        // For now, let's try to hit the endpoint and see if it's 401 or 404.

        console.log("Testing /api/assigned-tasks/all...");
        try {
            const response = await axios.get('http://localhost:5000/api/assigned-tasks/all');
            console.log("Response status:", response.status);
            console.log("Response data:", response.data);
        } catch (error) {
            console.log("Error status:", error.response?.status);
            console.log("Error message:", error.message);
            if (error.response?.data) {
                console.log("Error data:", error.response.data);
            }
        }

    } catch (err) {
        console.error("Script error:", err);
    }
}

testAssignedTasks();
