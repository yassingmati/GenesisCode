// backend/copy-media-to-all.js
const mongoose = require('mongoose');
const Level = require('./src/models/Level');

// MongoDB Atlas URI
const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

const SOURCE_LEVEL_ID = '692436f443185c9f37681d65';

async function copyMedia() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        // 1. Get Source Level
        const sourceLevel = await Level.findById(SOURCE_LEVEL_ID);
        if (!sourceLevel) {
            console.error(`❌ Source level ${SOURCE_LEVEL_ID} not found`);
            process.exit(1);
        }

        console.log('📦 Source Media found:');
        console.log('Videos:', sourceLevel.videos);
        console.log('PDFs:', sourceLevel.pdfs);

        if (!sourceLevel.videos && !sourceLevel.pdfs) {
            console.warn('⚠️ No media found in source level');
        }

        // 2. Update All Levels (excluding source)
        const result = await Level.updateMany(
            { _id: { $ne: SOURCE_LEVEL_ID } },
            {
                $set: {
                    videos: sourceLevel.videos,
                    pdfs: sourceLevel.pdfs
                }
            }
        );

        console.log(`\n✅ Updated ${result.modifiedCount} levels with media from source level.`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected');
    }
}

copyMedia();
