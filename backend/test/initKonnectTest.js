// test/initKonnectTest.js
require('dotenv').config();
const path = require('path');

// require the konnect service - adapte le chemin si ton projet diffère
const { initPayment } = require(path.join(__dirname, '..', 'src', 'services', 'konnectService'));

(async () => {
  try {
    console.log('typeof initPayment =', typeof initPayment);
    const res = await initPayment({
      amountCents: 10000, // 10.00 if cents
      currency: 'TND',
      returnUrl: 'http://localhost:3000/pay-return',
      merchantOrderId: `test_${Date.now()}`,
      description: 'Test payment via Konnect',
      customerEmail: 'test@example.com'
    });
    console.log('initPayment result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Test initPayment failed:', err && err.message ? err.message : err);
    if (err && err.detail) console.error('Detail:', err.detail);
  }
})();
