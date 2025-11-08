// src/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const { protect } = require('../middlewares/authMiddleware');
const { requireActiveSubscription, optionalSubscription } = require('../middlewares/subscriptionMiddleware');

// Helper pour gérer les erreurs async
const catchErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Obtenir les plans d'abonnement publics
 */
router.get('/plans', catchErrors(async (req, res) => {
  try {
    const plans = await Plan.find({ active: true }).sort({ priceMonthly: 1 });
    
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
}));

// Routes protégées
router.use(protect);

/**
 * Obtenir l'abonnement de l'utilisateur connecté
 */
router.get('/me', catchErrors(async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findActiveByUser(userId);
    
    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        message: 'Aucun abonnement actif'
      });
    }

    // Populate le plan si ce n'est pas déjà fait
    if (subscription.plan && typeof subscription.plan === 'object' && !subscription.plan._id) {
      await subscription.populate('plan');
    }

    return res.json({
      success: true,
      subscription: {
        id: subscription._id,
        status: subscription.status,
        plan: subscription.plan ? {
          _id: subscription.plan._id || subscription.plan.id,
          id: subscription.plan._id || subscription.plan.id,
          name: subscription.plan.name,
          description: subscription.plan.description,
          priceMonthly: subscription.plan.priceMonthly,
          currency: subscription.plan.currency
        } : null,
        planId: subscription.plan?._id || subscription.plan?.id || null,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt,
        createdAt: subscription.createdAt,
        konnectStatus: subscription.konnectStatus
      },
      message: 'Abonnement récupéré avec succès'
    });
  } catch (error) {
    console.error('Erreur récupération abonnement:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'abonnement'
    });
  }
}));

/**
 * S'abonner à un plan
 */
router.post('/subscribe', catchErrors(async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'ID du plan requis'
      });
    }

    // Vérifier que le plan existe
    const plan = await Plan.findById(planId);
    if (!plan || !plan.active) {
      return res.status(404).json({
        success: false,
        message: 'Plan introuvable ou inactif'
      });
    }

    // Vérifier qu'il n'y a pas déjà un abonnement actif
    const existingSubscription = await Subscription.findActiveByUser(userId);
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'Un abonnement actif existe déjà',
        currentSubscription: existingSubscription._id
      });
    }

    // Rediriger vers le paiement
    return res.json({
      success: true,
      message: 'Redirection vers le paiement',
      paymentUrl: `/api/payment/init`,
      planId: planId
    });

  } catch (error) {
    console.error('Erreur souscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la souscription'
    });
  }
}));

/**
 * Changer de plan
 */
router.post('/change-plan', requireActiveSubscription, catchErrors(async (req, res) => {
  try {
    const { newPlanId } = req.body;
    const userId = req.user.id;

    if (!newPlanId) {
      return res.status(400).json({
        success: false,
        message: 'ID du nouveau plan requis'
      });
    }

    // Vérifier que le nouveau plan existe
    const newPlan = await Plan.findById(newPlanId);
    if (!newPlan || !newPlan.active) {
      return res.status(404).json({
        success: false,
        message: 'Nouveau plan introuvable ou inactif'
      });
    }

    // Marquer l'abonnement actuel pour annulation à la fin de la période
    const currentSubscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    });

    if (currentSubscription) {
      currentSubscription.cancelAtPeriodEnd = true;
      await currentSubscription.save();
    }

    return res.json({
      success: true,
      message: 'Changement de plan programmé',
      newPlan: newPlanId,
      effectiveDate: currentSubscription ? currentSubscription.currentPeriodEnd : null
    });

  } catch (error) {
    console.error('Erreur changement plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de plan'
    });
  }
}));

/**
 * Annuler l'abonnement
 */
router.post('/cancel', requireActiveSubscription, catchErrors(async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Aucun abonnement actif trouvé'
      });
    }

    // Annuler l'abonnement
    await subscription.cancel();

    return res.json({
      success: true,
      message: 'Abonnement annulé avec succès',
      cancellationDate: subscription.canceledAt,
      effectiveEndDate: subscription.currentPeriodEnd
    });

  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de l\'abonnement'
    });
  }
}));

/**
 * Reprendre l'abonnement
 */
router.post('/resume', catchErrors(async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active',
      cancelAtPeriodEnd: true
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Aucun abonnement à reprendre'
      });
    }

    // Reprendre l'abonnement
    await subscription.reactivate();

    return res.json({
      success: true,
      message: 'Abonnement repris avec succès',
      subscription: {
        id: subscription._id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    });

  } catch (error) {
    console.error('Erreur reprise abonnement:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la reprise de l\'abonnement'
    });
  }
}));

/**
 * Obtenir les détails d'un plan
 */
router.get('/plans/:planId', catchErrors(async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan introuvable'
      });
    }

    return res.json({
      success: true,
      plan: {
        id: plan._id,
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        currency: plan.currency,
        interval: plan.interval,
        features: plan.features,
        active: plan.active
      }
    });

  } catch (error) {
    console.error('Erreur récupération plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du plan'
    });
  }
}));

module.exports = router;