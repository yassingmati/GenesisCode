// backend/src/routes/protectedRoute.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');

router.get('/admin', auth, (req, res) => {
  res.json({ message: `Bienvenue ${req.user.email}, accès admin accordé.` });
});

module.exports = router;
