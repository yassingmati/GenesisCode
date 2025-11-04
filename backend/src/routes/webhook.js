// src/routes/webhooks.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * Webhook endpoint for Konnect (and generic payment webhooks).
 * - Mount this router at /webhooks in your app.
 * - It accepts JSON payloads. If Konnect signs webhooks, add verification.
 */

router.use(express.json()); // ensure JSON body parsing for this router

router.post('/konnect', async (req, res) => {
  const payload = req.body;
  console.log('[Webhook] /webhooks/konnect payload:', JSON.stringify(payload, null, 2));

  try {
    // Try many possible field names (Konnect may use paymentRef, id, payment_id, payment_ref, etc.)
    const paymentId = payload.id || payload.payment_id || payload.paymentRef || payload.payment_ref || payload.paymentId || null;
    const merchantOrderId = payload.merchant_order_id || payload.merchantOrderId || payload.orderId || payload.merchantOrderId || null;
    const status = (payload.status || payload.payment_status || payload.state || payload.paymentState || payload.result || '').toString().toLowerCase();

    // Try to extract userId from merchantOrderId if we used format: sub_<userId>_<ts>
    let userId = null;
    if (merchantOrderId && merchantOrderId.startsWith('sub_')) {
      const parts = merchantOrderId.split('_');
      if (parts.length >= 2) userId = parts[1];
    }

    // If we don't have userId from merchantOrderId, try to find user by konnectPaymentId stored in DB
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    } else if (paymentId) {
      user = await User.findOne({ 'subscription.konnectPaymentId': paymentId }).exec();
    }

    if (!user) {
      console.warn('[Webhook] Aucun utilisateur trouvé pour paymentId / merchantOrderId:', paymentId, merchantOrderId);
      // Ack anyway so Konnect doesn't retry too aggressively (but you may want to return 404 to debug)
      return res.status(200).json({ received: true, note: 'no user matched' });
    }

    // Idempotence: if same payment and status already applied, exit early
    const prevStatus = user.subscription?.konnectStatus || null;
    const prevPaymentId = user.subscription?.konnectPaymentId || null;
    if (prevPaymentId === paymentId && prevStatus === status) {
      return res.status(200).json({ received: true, idempotent: true });
    }

    // Keep Subscription collection in sync (best-effort upsert)
    try {
      const Subscription = require('../models/Subscription');
      if (paymentId) {
        await Subscription.findOneAndUpdate(
          { konnectPaymentId: paymentId },
          {
            $setOnInsert: { user: user._id },
            $set: {
              konnectStatus: status,
              status: ['paid', 'success', 'completed', 'succeeded'].includes(status) ? 'active' : (['cancelled', 'canceled', 'failed', 'declined', 'error'].includes(status) ? 'incomplete' : 'pending')
            }
          },
          { upsert: true, new: true }
        );
      }
    } catch (syncErr) {
      console.warn('[Webhook] Subscription sync warning:', syncErr && syncErr.message ? syncErr.message : syncErr);
    }

    // Normalize status handling: consider paid/success/completed as success
    if (['paid', 'success', 'completed', 'succeeded'].includes(status)) {
      user.subscription = user.subscription || {};
      user.subscription.status = 'active';
      user.subscription.konnectStatus = 'paid';
      // ensure the payment id persisted
      if (paymentId) user.subscription.konnectPaymentId = paymentId;
      // if merchantOrderId contains plan/user meta you could parse it here
      await user.save();
      console.log(`[Webhook] Updated user ${user._id} subscription -> active`);
      return res.status(200).json({ received: true, updated: true });
    }

    // handle cancelled/failed
    if (['cancelled', 'canceled', 'failed', 'declined', 'error'].includes(status)) {
      user.subscription = user.subscription || {};
      user.subscription.status = 'incomplete';
      user.subscription.konnectStatus = status;
      if (paymentId) user.subscription.konnectPaymentId = paymentId;
      await user.save();
      console.log(`[Webhook] Updated user ${user._id} subscription -> incomplete (${status})`);
      return res.status(200).json({ received: true, updated: true });
    }

    // Unknown status: store raw status for investigation
    user.subscription = user.subscription || {};
    user.subscription.konnectStatus = status || (payload.status || 'unknown');
    if (paymentId) user.subscription.konnectPaymentId = paymentId;
    await user.save();
    console.log(`[Webhook] Updated user ${user._id} subscription -> saved konnectStatus=${user.subscription.konnectStatus}`);
    return res.status(200).json({ received: true, updated: 'status_saved' });
  } catch (err) {
    console.error('[Webhook] Error processing Konnect webhook:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'webhook error' });
  }
});

module.exports = router;
