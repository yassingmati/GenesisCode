// Script pour donner accès à TOUS les paths et niveaux
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Path = require('./src/models/Path');
const Level = require('./src/models/Level');
const CourseAccess = require('./src/models/CourseAccess');

const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

async function grantAllAccess() {
    try {
        console.log('🔌 Connecting...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        const user = await User.findOne({ email: 'yassine.gmatii@gmail.com' });
        if (!user) {
            console.error('❌ User not found');
            process.exit(1);
        }
        console.log(`✅ User: ${user.email}`);

        // Récupérer tous les paths
        const paths = await Path.find({});
        console.log(`✅ Found ${paths.length} paths`);

        let created = 0;
        let updated = 0;

        for (const path of paths) {
            const pathName = path.translations?.fr?.name || 'Sans nom';

            // Créer accès au path
            const existingPath = await CourseAccess.findOne({
                user: user._id,
                path: path._id,
                level: null
            });

            if (existingPath) {
                existingPath.accessType = 'unlocked';
                existingPath.canView = true;
                existingPath.canInteract = true;
                existingPath.isActive = true;
                await existingPath.save();
                updated++;
            } else {
                await CourseAccess.create({
                    user: user._id,
                    path: path._id,
                    accessType: 'unlocked',
                    source: 'admin',
                    canView: true,
                    canInteract: true,
                    canDownload: true,
                    isActive: true
                });
                created++;
            }

            // Récupérer tous les niveaux de ce path
            const levels = await Level.find({ path: path._id });

            for (const level of levels) {
                const existingLevel = await CourseAccess.findOne({
                    user: user._id,
                    path: path._id,
                    level: level._id
                });

                if (existingLevel) {
                    existingLevel.accessType = 'unlocked';
                    existingLevel.canView = true;
                    existingLevel.canInteract = true;
                    existingLevel.isActive = true;
                    await existingLevel.save();
                    updated++;
                } else {
                    await CourseAccess.create({
                        user: user._id,
                        path: path._id,
                        level: level._id,
                        accessType: 'unlocked',
                        source: 'admin',
                        canView: true,
                        canInteract: true,
                        canDownload: true,
                        isActive: true
                    });
                    created++;
                }
            }

            console.log(`  ✅ ${pathName}: ${levels.length} levels`);
        }

        console.log(`\n✅ Done! Created: ${created}, Updated: ${updated}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected');
    }
}

grantAllAccess();
