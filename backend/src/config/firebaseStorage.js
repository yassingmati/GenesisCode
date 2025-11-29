const admin = require('../utils/firebaseAdmin');
const { v4: uuidv4 } = require('uuid');

const bucket = admin.storage().bucket();

/**
 * Upload file to Firebase Storage
 * @param {string} filePath - Local file path
 * @param {string} destination - Destination path in bucket
 * @param {string} mimeType - File MIME type
 * @returns {Promise<object>} Upload result with public url
 */
const uploadFile = async (filePath, destination, mimeType) => {
    try {
        const [file] = await bucket.upload(filePath, {
            destination: destination,
            metadata: {
                contentType: mimeType,
                metadata: {
                    firebaseStorageDownloadTokens: uuidv4(),
                }
            }
        });

        // Make the file public
        await file.makePublic();

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

        return {
            url: publicUrl,
            name: file.name,
            bucket: bucket.name
        };
    } catch (error) {
        console.error('Firebase Storage upload error:', error);
        throw error;
    }
};

/**
 * Delete file from Firebase Storage
 * @param {string} fileUrl - Public URL of the file
 * @returns {Promise<void>}
 */
const deleteFile = async (fileUrl) => {
    try {
        if (!fileUrl) return;

        // Extract file path from URL
        // URL format: https://storage.googleapis.com/bucket-name/path/to/file
        const urlParts = fileUrl.split(`https://storage.googleapis.com/${bucket.name}/`);
        if (urlParts.length !== 2) return;

        const filePath = urlParts[1];
        const file = bucket.file(filePath);

        await file.delete();
    } catch (error) {
        console.error('Firebase Storage delete error:', error);
        // Don't throw, just log
    }
};

module.exports = {
    uploadFile,
    deleteFile
};
