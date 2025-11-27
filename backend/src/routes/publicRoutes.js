// src/routes/publicRoutes.js
const express = require('express');
const router = express.Router();

let subscriptionController = null;
let paymentController = null;

try {
  subscriptionController = require('../controllers/subscriptionController');
  console.log('✅ publicRoutes: subscriptionController loaded');
} catch (err) {
  console.error('❌ publicRoutes: unable to load subscriptionController:', err && err.message ? err.message : err);
}

try {
  paymentController = require('../controllers/paymentController');
  console.log('✅ publicRoutes: paymentController loaded');
} catch (err) {
  console.error('❌ publicRoutes: unable to load paymentController:', err && err.message ? err.message : err);
}

function ensureHandler(name, controller) {
  const fn = controller && controller[name];
  if (typeof fn === 'function') return fn;
  return (req, res) => {
    console.error(`Missing handler: ${controller?.constructor?.name || 'controller'}.${name}`);
    return res.status(500).json({ success: false, message: `Handler manquant: ${name}` });
  };
}

// Public plans endpoint to be consumed by the client without authentication
router.get('/plans', async (req, res) => {
  try {
    const Plan = require('../models/Plan');
    const plans = await Plan.find({ active: true }).lean().exec();

    return res.json({
      success: true,
      plans: plans.map(plan => ({
        id: plan._id,
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        currency: plan.currency,
        interval: plan.interval,
        features: plan.features
      })),
      message: 'Plans récupérés avec succès'
    });
  } catch (error) {
    console.error('Erreur récupération plans:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plans'
    });
  }
});

// NOTE: Les routes de paiement sont gérées par paymentRoutes.js monté à /api/payment
// Pas besoin de les dupliquer ici pour éviter les conflits

// DEBUG ROUTE
router.get('/debug-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('../models/User');

    const dbStatus = mongoose.connection.readyState;
    const dbHost = mongoose.connection.host;
    const dbName = mongoose.connection.name;

    const userCount = await User.countDocuments({});
    const targetUser = await User.findById('690f615195c102dbad63e25f').select('_id email roles').lean();

    res.json({
      success: true,
      dbStatus,
      dbHost,
      dbName,
      userCount,
      targetUser,
      envMongoURI: process.env.MONGODB_URI ? 'Defined' : 'Undefined'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DEBUG ROUTE: Create Admin User
router.post('/debug-create-admin', async (req, res) => {
  try {
    const User = require('../models/User');
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcryptjs'); // Assuming bcryptjs is used, or just skip password hashing for now if not logging in via password

    const email = 'admin2@test.com';
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        firebaseUid: 'admin-debug-' + Date.now(),
        userType: 'parent', // or student, doesn't matter much for admin role
        roles: ['admin'],
        firstName: 'Admin',
        lastName: 'Debug',
        isVerified: true,
        isProfileComplete: true
      });
      console.log('✅ Created admin user:', user._id);
    } else {
      // Ensure it has admin role
      if (!user.roles.includes('admin')) {
        user.roles.push('admin');
        await user.save();
      }
      console.log('✅ Found existing admin user:', user._id);
    }

    // Generate Token using the SERVER'S secret
    const secret = process.env.JWT_SECRET || 'devsecret';
    const token = jwt.sign({
      id: user._id,
      email: user.email,
      roles: user.roles
    }, secret, { expiresIn: '30d' });

    res.json({
      success: true,
      message: 'Admin user ready',
      user: { id: user._id, email: user.email, roles: user.roles },
      token
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
