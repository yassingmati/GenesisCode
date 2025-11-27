// Script pour donner accès direct à un niveau spécifique
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Level = require('./src/models/Level');
const Path = require('./src/models/Path');
const CourseAccess = require('./src/models/CourseAccess');

const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

async function grantLevelAccess() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        const user = await User.findOne({ email: 'yassine.gmatii@gmail.com' });
        if (!user) {
            console.error('❌ User not found');
            process.exit(1);
        }
        console.log(`✅ User: ${user.email}`);

        const levelId = '690c7be344d3becb125f0bd1';
        const level = await Level.findById(levelId).populate('path');
        if (!level) {
            console.error('❌ Level not found');
            process.exit(1);
        }
        console.log(`✅ Level: ${level.translations?.fr?.title || 'Sans titre'}`);
        console.log(`   Path: ${level.path._id}`);

        // Créer un accès explicite pour ce niveau
        const existing = await CourseAccess.findOne({
            user: user._id,
            path: level.path._id,
            level: levelId
        });

        if (existing) {
            existing.accessType = 'unlocked';
            existing.canView = true;
            existing.canInteract = true;
            existing.isActive = true;
            existing.expiresAt = null;
            await existing.save();
            console.log('✅ Updated existing access');
        } else {
            await CourseAccess.create({
                user: user._id,
                path: level.path._id,
                level: levelId,
                accessType: 'unlocked',
                source: 'admin',
                canView: true,
                canInteract: true,
                canDownload: true,
                isActive: true,
                expiresAt: null
            });
            console.log('✅ Created new access');
        }

        console.log('\n✅ Access granted to level!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected');
    }
}

grantLevelAccess();
