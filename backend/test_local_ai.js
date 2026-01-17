const AIService = require('./src/services/aiService');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function testLocalAI() {
    console.log("🧪 Testing Local AI Service (Sharp + Pixelmatch)...");

    try {
        // 1. Generate a dummy "red button" image (User Answer)
        const userImageBuffer = await sharp({
            create: {
                width: 200,
                height: 100,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 1 }
            }
        }).png().toBuffer();

        const userImageBase64 = userImageBuffer.toString('base64');

        // 2. Generate a dummy "red button" image (Solution)
        // Identical to user image for this test
        const solutionImageBuffer = await sharp({
            create: {
                width: 200,
                height: 100,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 1 }
            }
        }).png().toBuffer();

        // Save solution to disk to simulate a file path/URL
        const solutionPath = path.resolve(__dirname, 'solution_test.png');
        fs.writeFileSync(solutionPath, solutionImageBuffer);

        // Use file:// protocol or absolute path which our service might handle if we tweaked it, 
        // BUT our service logic expects HTTP or relative URL. 
        // Let's hack the service call to accept a direct path for this test, 
        // OR mock the fetching part. 
        // Actually, let's just use the server URL if running, or mock the fetch.

        // Wait! The service currently enforces HTTP fetch for everything except it warns on local path.
        // I need to modify the service to allow local file paths for easy testing? 
        // Or better, I can setup a simple express server in this script to serve the image? 
        // Too complex.

        // Let's update AIService to handle local file paths for testing/CLI usage if it doesn't already.
        // Checking current implementation... it returns error for non-http.

        // Ok, I will assume the server is running on localhost:5000 and serving files.
        // But I don't have a file uploaded there easily.

        // Simpler approach: Create a "blue button" image and compare against red.

        // Let's rely on the fact that I modified AIService to try fetching.
        // I'll just skip the fetch part and call `pixelmatch` logic directly? 
        // No, I want to test the full `compareVisuals` function.

        // Workaround: I will mock `global.fetch` in this script.
    } catch (e) {
        console.error("Setup error:", e);
    }
}

async function runTestWithMock() {
    // Mock Fetch to return the solution buffer
    const solutionBuffer = await sharp({
        create: {
            width: 200,
            height: 100,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 1 } // Red
        }
    }).png().toBuffer();

    const differentBuffer = await sharp({
        create: {
            width: 200,
            height: 100,
            channels: 4,
            background: { r: 0, g: 0, b: 255, alpha: 1 } // Blue
        }
    }).png().toBuffer();

    global.fetch = async (url) => {
        console.log(`[MockFetch] Request to ${url}`);
        return {
            ok: true,
            arrayBuffer: async () => url.includes('blue') ? differentBuffer : solutionBuffer
        };
    };

    console.log("\n--- TEST 1: Identical Images (Red vs Red) ---");
    const userRed = solutionBuffer.toString('base64');
    const result1 = await AIService.compareVisuals(userRed, "http://mock/red.png");
    console.log("Result 1:", result1);

    console.log("\n--- TEST 2: Different Images (Blue vs Red) ---");
    const userBlue = differentBuffer.toString('base64');
    const result2 = await AIService.compareVisuals(userBlue, "http://mock/red.png");
    console.log("Result 2:", result2);
}

runTestWithMock();
