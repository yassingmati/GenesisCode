try {
    require('dotenv').config();
    const userService = require('../src/services/userService');
    const authService = require('../src/services/authService');
    const authController = require('../src/controllers/authController');
    console.log('Imports successful');
} catch (e) {
    console.error('Import failed:', e);
    process.exit(1);
}
