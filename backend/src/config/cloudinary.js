const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

/**
 * Upload video to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<object>} Upload result with url and public_id
 */
const uploadVideo = async (filePath, folder = 'codegenesis/videos') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video',
            folder: folder,
            use_filename: true,
            unique_filename: true,
            overwrite: false
        });

        return {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            duration: result.duration,
            size: result.bytes
        };
    } catch (error) {
        console.error('Cloudinary video upload error:', error);
        throw error;
    }
};

/**
 * Upload PDF to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<object>} Upload result with url and public_id
 */
const uploadPDF = async (filePath, folder = 'codegenesis/pdfs') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'raw', // For PDFs and other documents
            folder: folder,
            use_filename: true,
            unique_filename: true,
            overwrite: false
        });

        return {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            size: result.bytes
        };
    } catch (error) {
        console.error('Cloudinary PDF upload error:', error);
        throw error;
    }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @param {string} resourceType - 'video' or 'raw'
 * @returns {Promise<object>} Deletion result
 */
const deleteFile = async (publicId, resourceType = 'video') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};

module.exports = {
    cloudinary,
    uploadVideo,
    uploadPDF,
    deleteFile
};
