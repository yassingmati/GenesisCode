require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Hardcoded URLs as requested by user (corrected format)
const VIDEO_URL = 'https://res.cloudinary.com/dsqx1qkus/video/upload/v1764260925/codegenesis/levels/69244803c5bbbad53eb05c06/videos/videos-1764260924086-556250369_btmfzf.mp4';
const PDF_URL = 'https://res.cloudinary.com/dsqx1qkus/raw/upload/v1764260950/codegenesis/levels/69244803c5bbbad53eb05c06/pdfs/pdfs-1764260949246-545087997_uvuzu3.pdf';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yassinegmatii:yassinegmatii@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

const updateAllMedia = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const Level = mongoose.connection.collection('levels');

        const updateResult = await Level.updateMany({}, {
            $set: {
                // Update legacy fields
                video: VIDEO_URL,
                pdf: PDF_URL,

                // Update localized fields
                videos: {
                    fr: VIDEO_URL,
                    en: VIDEO_URL,
                    ar: VIDEO_URL
                },
                pdfs: {
                    fr: PDF_URL,
                    en: PDF_URL,
                    ar: PDF_URL
                },

                // Clear Cloudinary metadata to avoid confusion/deletion of the shared file
                // We don't want the controller to try and delete this shared file when someone uploads a new one for a specific level
                cloudinary_videos: {},
                cloudinary_pdfs: {}
            }
        });

        console.log(`Updated ${updateResult.modifiedCount} levels.`);
        console.log('Video URL set to:', VIDEO_URL);
        console.log('PDF URL set to:', PDF_URL);

    } catch (error) {
        console.error('Error updating media:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
};

updateAllMedia();
