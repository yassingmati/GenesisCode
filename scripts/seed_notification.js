require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');
const Notification = require('../backend/src/models/Notification');
const User = require('../backend/src/models/User');

const seedNotification = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            console.error('MONGODB_URI missing in .env');
            return;
        }

        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // Find the user
        const email = 'genesiscodee@gmail.com'; // User from screenshot
        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        console.log(`Found user: ${user._id}`);

        // Create notification
        await Notification.create({
            recipient: user._id,
            type: 'system',
            title: 'Bienvenue sur GenesisCode ! 🚀',
            message: 'Ceci est une notification de test pour vérifier le système.',
            data: { test: true },
            read: false
        });

        console.log('Notification seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding notification:', error);
        process.exit(1);
    }
};

seedNotification();
