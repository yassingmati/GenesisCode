const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const ExerciseService = require('../services/exerciseService');

const runTest = async () => {
    console.log("Testing ExerciseService.evaluateAnswer for WebProject...");

    const mockExercise = {
        _id: "mock_ex_1",
        type: 'WebProject',
        points: 50,
        files: [{ name: 'index.html', content: '<h1>Test</h1>' }],
        solutions: [],
        allowPartial: true,
        // Mock solution image to trigger AI path (optional, as we want to test dispatch first)
        solutionImage: null
    };

    const mockAnswer = {
        files: [{ name: 'index.html', content: '<h1>Test</h1>' }],
        screenshot: null
    };

    try {
        const result = await ExerciseService.evaluateAnswer(mockExercise, mockAnswer);
        console.log("Evaluation Result:", result);

        if (result && (result.isCorrect === true || result.isCorrect === false)) {
            console.log("✅ Dispatch success!");
        } else {
            console.log("❌ Result format unexpected");
        }

    } catch (e) {
        console.error("❌ Evaluation Failed:", e);
    }

    process.exit(0);
};

runTest();
