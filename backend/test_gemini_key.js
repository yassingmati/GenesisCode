require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testKey() {
    console.log("Testing Gemini API Key...");
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ No API KEY found in process.env");
        return;
    }

    console.log(`Key found: ${apiKey.substring(0, 5)}... (Length: ${apiKey.length})`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Reply with 'OK' if you see this.";
        console.log("Sending prompt...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("✅ Success! Response:", text);
    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.message.includes("API key not valid")) {
            console.error("\n[DIAGNOSIS] The API Key provided is definitely rejected by Google.");
        }
    }
}

testKey();
