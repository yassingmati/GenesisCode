// src/routes/accessRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const AccessControlService = require('../services/accessControlService');

// Routes protégées
router.use(protect);

// GET /access/check?pathId=&levelId=&exerciseId=
router.get('/check', async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const { pathId, levelId, exerciseId } = req.query || {};

    if (!pathId) {
      return res.status(400).json({
        success: false,
        message: 'ID du parcours requis',
        code: 'MISSING_PATH_ID'
      });
    }

    const access = await AccessControlService.checkUserAccess(userId, pathId, levelId || null, exerciseId || null);
    return res.json({ success: true, access });
  } catch (err) {
    console.error('accessRoutes.check error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur de vérification d\'accès',
      code: 'ACCESS_CHECK_ERROR'
    });
  }
});

module.exports = router;


