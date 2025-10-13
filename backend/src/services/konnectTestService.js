// src/services/konnectTestService.js
// Service de test pour Konnect (sans vraie API)

class KonnectTestService {
  constructor() {
    this.isConfigured = () => true; // Toujours configuré en mode test
  }

  async initPayment(paymentData) {
    console.log('🧪 Mode test Konnect - Simulation paiement:', paymentData);
    
    const {
      amountCents,
      currency = 'TND',
      description,
      merchantOrderId,
      customerEmail,
      returnUrl,
      cancelUrl
    } = paymentData;

    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Générer un payment_ref réaliste (format Konnect)
    const konnectPaymentId = this.generateKonnectPaymentRef();

    // Créer une URL Konnect réelle avec payment_ref
    const konnectPaymentUrl = `https://gateway.sandbox.konnect.network/pay?payment_ref=${konnectPaymentId}`;

    console.log('✅ Paiement test initialisé:', {
      paymentId: konnectPaymentId,
      amount: amountCents,
      currency,
      url: konnectPaymentUrl
    });

    return {
      success: true,
      paymentUrl: konnectPaymentUrl,
      konnectPaymentId,
      merchantOrderId,
      amount: amountCents,
      currency,
      status: 'pending'
    };
  }

  // Générer un payment_ref au format Konnect (24 caractères hexadécimaux)
  generateKonnectPaymentRef() {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async checkPaymentStatus(paymentRef) {
    console.log('🧪 Mode test Konnect - Vérification statut:', paymentRef);
    
    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      paymentRef,
      status: 'completed', // Simuler un paiement réussi
      amount: 5000,
      currency: 'TND',
      orderId: `test_order_${Date.now()}`,
      customerEmail: 'test@genesis.com',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
  }

  async processWebhook(paymentRef) {
    console.log('🧪 Mode test Konnect - Webhook simulé:', paymentRef);
    
    const status = await this.checkPaymentStatus(paymentRef);
    
    return {
      success: true,
      paymentRef,
      status: status.status,
      isCompleted: status.status === 'completed',
      isFailed: false,
      amount: status.amount,
      currency: status.currency,
      orderId: status.orderId,
      customerEmail: status.customerEmail,
      completedAt: status.completedAt
    };
  }

  createDirectPaymentUrl(paymentData) {
    const {
      amountCents,
      currency = 'TND',
      description,
      merchantOrderId,
      customerEmail,
      returnUrl,
      cancelUrl
    } = paymentData;

    const params = new URLSearchParams({
      receiver_wallet_id: 'test-wallet-id',
      token: 'test-token',
      amount: amountCents,
      currency: currency,
      description: description,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      merchant_order_id: merchantOrderId,
      customer_email: customerEmail
    });

    return `https://gateway.sandbox.konnect.network/pay?${params.toString()}`;
  }

  getConfig() {
    return {
      isConfigured: true,
      baseUrl: 'https://api.sandbox.konnect.network',
      webhookUrl: 'http://localhost:5000/api/payment/webhook',
      hasApiKey: true,
      hasReceiverWalletId: true,
      mode: 'test'
    };
  }
}

module.exports = new KonnectTestService();
