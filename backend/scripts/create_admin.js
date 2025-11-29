require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yassinegmatii:yassinegmatii@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

const createAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        const User = mongoose.connection.collection('users');
        const email = 'admin2@test.com';
        const password = 'password123';

        console.log(`Hashing password for ${email}...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('Updating/Creating user...');
        const result = await User.updateOne(
            { email: email },
            {
                $set: {
                    email: email,
                    password: hashedPassword,
                    role: 'admin',
                    firstName: 'Test',
                    lastName: 'Admin',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        console.log('User created/updated:', result);

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
};

createAdmin();
