// src/services/konnectService.js
const axios = require('axios');

const KONNECT_API_KEY = process.env.KONNECT_API_KEY || '';
const KONNECT_BASE_URL = process.env.KONNECT_BASE_URL || 'https://api.sandbox.konnect.network'; // sandbox by default
const RECEIVER_WALLET_ID = process.env.KONNECT_RECEIVER_WALLET_ID || null;

// Try to load optional SDK (@fwdmo/konnectjs or similar). If present, prefer it.
let KonnectSDK = null;
try {
  // eslint-disable-next-line global-require
  KonnectSDK = require('@fwdmo/konnectjs'); // optional third-party SDK
  console.info('Konnect SDK detected, will prefer SDK for initPayment if available.');
} catch (err) {
  KonnectSDK = null;
}

async function initPaymentWithSDK({ amountCents, currency = 'TND', returnUrl, merchantOrderId, description, customerEmail, metadata = {} }) {
  // Example usage for a SDK that requires instantiation.
  // SDK usage may vary: adapt if your SDK doc is different.
  const apiKey = KONNECT_API_KEY;
  if (!apiKey) throw new Error('KONNECT_API_KEY non défini');

  // Many SDKs expose a class; check how to instantiate in your SDK docs.
  // This code attempts common patterns; adjust if your SDK's API differs.
  let client;
  if (KonnectSDK && typeof KonnectSDK === 'function') {
    // default export is a constructor
    client = new KonnectSDK(apiKey, { env: 'sandbox' });
  } else if (KonnectSDK && KonnectSDK.Konnect) {
    client = new KonnectSDK.Konnect(apiKey, { env: 'sandbox' });
  } else {
    throw new Error('SDK Konnect présent mais format inattendu — utiliser la version REST.');
  }

  if (typeof client.initPayment !== 'function') {
    throw new Error('La SDK Konnect ne propose pas initPayment(), vérifier la doc du SDK.');
  }

  const payload = {
    receiverWalletId: RECEIVER_WALLET_ID,
    token: currency,
    amount: amountCents,
    type: 'immediate',
    return_url: returnUrl,
    merchant_order_id: merchantOrderId,
    description,
    customer: { email: customerEmail },
    metadata
  };

  const resp = await client.initPayment(payload);
  // normalize response to common shape
  return {
    paymentUrl: resp.paymentUrl || resp.payUrl || resp.url || resp.data?.payUrl || null,
    konnectPaymentId: resp.paymentRef || resp.id || resp.data?.paymentRef || null,
    raw: resp
  };
}

async function initPaymentWithRest({ amountCents, currency = 'TND', returnUrl, merchantOrderId, description, customerEmail, metadata = {} }) {
  if (!KONNECT_API_KEY) throw new Error('KONNECT_API_KEY non défini');
  if (!RECEIVER_WALLET_ID) console.warn('KONNECT_RECEIVER_WALLET_ID non défini. Vérifie ton .env.');

  const url = `${KONNECT_BASE_URL.replace(/\/$/, '')}/api/v2/payments/init-payment`;

  const payload = {
    receiverWalletId: RECEIVER_WALLET_ID,
    token: currency,
    amount: amountCents,
    type: 'immediate',
    returnUrl: returnUrl,               // certains endpoints attendent return_url ; on inclut returnUrl pour compatibilité serveur
    return_url: returnUrl,
    merchant_order_id: merchantOrderId,
    description,
    firstName: undefined,
    lastName: undefined,
    phoneNumber: undefined,
    email: customerEmail,
    metadata
  };

  try {
    const resp = await axios.post(url, payload, {
      headers: {
        'x-api-key': KONNECT_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // Normalize the common fields many Konnect endpoints return
    const data = resp.data || {};
    return {
      paymentUrl: data.payUrl || data.pay_url || data.payment_url || data.payUrl || data.url || data.link || null,
      konnectPaymentId: data.paymentRef || data.payment_ref || data.id || data.paymentId || null,
      raw: data
    };
  } catch (err) {
    const detail = (err.response && err.response.data) ? err.response.data : err.message;
    const e = new Error(`Konnect REST error: ${JSON.stringify(detail)}`);
    e.detail = detail;
    throw e;
  }
}

/**
 * initPayment: unified entry point
 * params: { amountCents, currency, returnUrl, merchantOrderId, description, customerEmail, metadata }
 */
async function initPayment(opts = {}) {
  // defensive checks
  if (!opts || typeof opts !== 'object') throw new Error('initPayment: options manquantes');
  if (!opts.amountCents) throw new Error('initPayment: amountCents requis');

  // Prefer SDK path if available
  if (KonnectSDK) {
    try {
      return await initPaymentWithSDK(opts);
    } catch (err) {
      console.warn('SDK Konnect détecté mais échec, fallback vers REST. Erreur SDK:', err && err.message ? err.message : err);
      // fallthrough to REST
    }
  }

  // REST fallback
  return await initPaymentWithRest(opts);
}

// Export clair — destructuring require works: const { initPayment } = require('./konnectService');
module.exports.initPayment = initPayment;
module.exports = { initPayment }; // double assign to be safe with different require styles