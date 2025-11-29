require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'https://codegenesis-backend.onrender.com/api'; // Production URL
const LEVEL_ID = '69244803c5bbbad53eb05c06';

const testUpload = async () => {
    try {
        // Register a new user to get a valid token
        const testEmail = `testupload_${Date.now()}@test.com`;
        const testPassword = 'password123';
        console.log(`Registering new user: ${testEmail}...`);

        let token;
        try {
            const registerRes = await axios.post(`${API_URL}/auth/register`, {
                email: testEmail,
                password: testPassword,
                userType: 'student'
            });

            token = registerRes.data.token;
            console.log('Registered successfully. Token obtained.');
        } catch (regErr) {
            console.error('Registration Failed:', regErr.message);
            if (regErr.response) {
                console.error('Registration Status:', regErr.response.status);
                console.error('Registration Data:', regErr.response.data);
            }
            process.exit(1);
        }

        // Create dummy PDF
        const pdfPath = './test_upload.pdf';
        fs.writeFileSync(pdfPath, '%PDF-1.4\n%\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources << >>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 21\n>>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Test PDF) Tj\nET\nendstream\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');
        console.log('Created dummy PDF.');

        // Upload PDF
        const form = new FormData();
        form.append('pdf', fs.createReadStream(pdfPath));
        form.append('lang', 'fr');

        console.log(`Uploading PDF to ${API_URL}/courses/levels/${LEVEL_ID}/pdf...`);

        const response = await axios.post(`${API_URL}/courses/levels/${LEVEL_ID}/pdf`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Upload Status:', response.status);
        console.log('Upload Data:', response.data);
        if (response.data.debug_result) {
            console.log('Debug Result:', JSON.stringify(response.data.debug_result, null, 2));
        }

        if (response.data.url) {
            console.log('Verifying URL accessibility...');
            try {
                const checkRes = await axios.get(response.data.url);
                console.log('URL Check Status:', checkRes.status);
                console.log('URL is accessible!');
            } catch (err) {
                console.error('URL Check Failed:', err.message);
                if (err.response) console.error('Status:', err.response.status);

                // Inspect resource via Cloudinary API
                try {
                    const cloudinary = require('cloudinary').v2;
                    cloudinary.config({
                        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                        api_key: process.env.CLOUDINARY_API_KEY,
                        api_secret: process.env.CLOUDINARY_API_SECRET
                    });

                    // Extract public_id from URL
                    // URL: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/filename.pdf
                    const urlParts = response.data.url.split('/');
                    const filename = urlParts.pop();
                    const folderPath = urlParts.slice(7).join('/'); // Adjust index based on URL structure
                    // public_id usually includes folder
                    // Let's try to find it by listing recent resources if extraction is hard

                    console.log('Inspecting Cloudinary resource...');
                    // We can't easily guess public_id without knowing the exact structure, 
                    // but we can try to extract it.
                    // Assuming folder structure: codegenesis/levels/...
                    // The backend returns the full URL.

                    // Let's just list the last uploaded resource
                    const resources = await cloudinary.api.resources({
                        type: 'upload',
                        resource_type: 'image', // We used auto, so it might be image
                        max_results: 1,
                        direction: 'desc'
                    });

                    if (resources.resources.length > 0) {
                        const latest = resources.resources[0];
                        console.log('Latest Resource:', JSON.stringify(latest, null, 2));
                        console.log('Access Mode:', latest.access_mode);
                    } else {
                        console.log('No resources found via API.');
                    }

                } catch (cloudErr) {
                    console.error('Cloudinary Inspection Failed:', cloudErr.message);
                }
            }
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    } finally {
        // Cleanup
        if (fs.existsSync('./test_upload.pdf')) fs.unlinkSync('./test_upload.pdf');
    }
};

testUpload();
