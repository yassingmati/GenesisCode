require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./src/models/Notification');
const User = require('./src/models/User');

const seedAll = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users. Seeding notifications...`);

        for (const user of users) {
            await Notification.create({
                recipient: user._id,
                type: 'system',
                title: 'Test System 🔔',
                message: `Notification de test pour l'utilisateur ${user.email}`,
                data: { test: true },
                read: false
            });
            console.log(`+ Seeded for ${user.email}`);
        }

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedAll();
