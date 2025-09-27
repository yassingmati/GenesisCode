const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); // Vérifie l'importation

// Route d'authentification
router.post('/login', adminController.login);

// Route d'enregistrement
router.post('/register', adminController.register);

module.exports = router;
