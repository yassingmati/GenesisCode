require('dotenv').config();
const { sendVerificationEmail } = require('./src/utils/emailService');

async function test() {
    console.log('🚀 Starting email test...');
    console.log('Target: yassine.gmatii@gmail.com');
    console.log('SMTP Config:', {
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER,
        port: process.env.SMTP_PORT
    });

    try {
        await sendVerificationEmail('yassine.gmatii@gmail.com', 'TEST_TOKEN_MANUAL_VERIFICATION');
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Email sending failed:', error);
    }
}

test();
