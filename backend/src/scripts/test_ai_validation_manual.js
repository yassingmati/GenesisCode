const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const AIService = require('../services/aiService');

const runTest = async () => {
    console.log("Testing AI Service...");
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY missing in .env");
        process.exit(1);
    }
    console.log("API Key found:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");

    // 1. Mock Images (Base64 Red Pixel vs Red Pixel)
    // Minimal valid PNG base64 (1x1 red pixel)
    const redPixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    // Blue pixel
    const bluePixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==";

    console.log("\n--- Test 1: Identical Images (Red vs Red) ---");
    try {
        // Mocking solution image fetch? 
        // AIService expects URL. For test, we can pass Data URI if our service supports it (it usually does via fetch or if we hacked it).
        // Wait, my AIService implementation tries to fetch if http, else reads file.
        // It does NOT support direct Base64 as solution string yet?
        // Let's check `backend/src/services/aiService.js` implementation I wrote.
        /*
          if (solutionImageUrl.startsWith('http')) { ... fetch ... }
          else { ... assumes file path ... }
        */
        // So I can't easily pass base64 directly as solution for this test unless I mock `fetch` or use a real URL.
        // Use a public URL for solution.
        const solutionUrl = "https://via.placeholder.com/10x10/FF0000/FF0000"; // Red

        // Pass base64 of a similar red image (or just dummy base64 matching red)
        // Let's try `redPixel` as user image.

        // NOTE: The AI might not see "placeholder text" as 100% identical to "pure red pixel", but should be high similarity?
        // Actually, let's use a real image URL that is just red.
        // Or simply trust the AI can compare a small image.

        const result = await AIService.compareVisuals(redPixel, solutionUrl);
        console.log("Result:", result);

    } catch (e) {
        console.error("Test 1 Failed:", e);
    }

    console.log("\n--- Test complete ---");
};

runTest();
