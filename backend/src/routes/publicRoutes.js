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

// Public Konnect payment initialization to maintain compatibility with frontend expecting /api/payment/init
router.post('/payment/init', ensureHandler('initSubscriptionPayment', paymentController));

// Public webhook endpoint for Konnect
router.get('/payment/webhook', ensureHandler('handleKonnectWebhook', paymentController));

module.exports = router;
