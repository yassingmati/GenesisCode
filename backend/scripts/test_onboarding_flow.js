require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const authController = require('../src/controllers/authController');
const authService = require('../src/services/authService');
// Mock Req/Res helpers
const createMockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const runTest = async () => {
    console.log('🚀 Starting Onboarding Flow Test...');

    try {
        // 1. Connect to DB
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 2. Cleanup previous test user
        const testEmail = 'test_onboarding_' + Date.now() + '@example.com';
        const testUid = 'firebase_uid_' + Date.now();

        // 3. Simulate Google Login (New User)
        console.log(`\n🔵 Testing Login with Google (New User: ${testEmail})...`);

        // We need to mock the verification part or bypass it.
        // Since we modified authController, let's look at how we can test the creation logic.
        // The controller uses `admin.auth().verifyIdToken`. We can't easily mock that without stubbing.
        // BETTER APPROACH: Verify the logic by manually creating the user exactly as the controller does
        // and then testing the completeProfile controller.

        // Simulating the "Creation" logic from authController:
        // isProfileComplete: false, // FORCE false to trigger onboarding wizard

        const newUser = new User({
            firebaseUid: testUid,
            email: testEmail,
            firstName: 'Test',
            lastName: 'User',
            userType: 'student',
            isProfileComplete: false, // THIS IS WHAT WE WANT TO VERIFY IS HANDLED CORRECTLY DOWNSTREAM
            isVerified: true
        });
        await newUser.save();
        console.log('✅ Simulated New Google User Created (isProfileComplete: false)');

        // 4. Test completeProfile
        console.log('\n🔵 Testing completeProfile (Adding Password)...');

        const req = {
            user: { id: newUser._id },
            body: {
                firstName: 'Updated',
                lastName: 'Name',
                userType: 'parent',
                password: 'securePassword123'
            }
        };
        const res = createMockRes();

        await authController.completeProfile(req, res);

        // 5. Verify Results
        if (res.statusCode && res.statusCode !== 200) {
            throw new Error(`Complete Profile failed with status ${res.statusCode}: ${JSON.stringify(res.data)}`);
        }

        const updatedUser = await User.findById(newUser._id).select('+localPasswordHash');

        console.log('🔍 Verifying updates...');

        if (updatedUser.isProfileComplete !== true) {
            throw new Error('❌ isProfileComplete should be true');
        } else {
            console.log('✅ isProfileComplete is true');
        }

        if (updatedUser.userType !== 'parent') {
            throw new Error('❌ userType should be updated to parent');
        } else {
            console.log('✅ userType updated to parent');
        }

        if (!updatedUser.localPasswordHash) {
            throw new Error('❌ localPasswordHash is missing');
        } else {
            console.log('✅ localPasswordHash is present');
        }

        // Verify Password
        const isMatch = await authService.comparePassword('securePassword123', updatedUser.localPasswordHash);
        if (isMatch) {
            console.log('✅ Password hash verified successfully');
        } else {
            throw new Error('❌ Password hash mismatch');
        }

        // Cleanup
        await User.findByIdAndDelete(newUser._id);
        console.log('\n✅ Test User Cleaned up');
        console.log('\n🎉 ALL TESTS PASSED!');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();
