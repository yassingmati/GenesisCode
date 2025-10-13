// src/services/konnectPaymentService.js
const axios = require('axios');

class KonnectPaymentService {
  constructor() {
    this.apiKey = process.env.KONNECT_API_KEY;
    this.receiverWalletId = process.env.KONNECT_RECEIVER_WALLET_ID;
    this.baseUrl = process.env.KONNECT_BASE_URL || 'https://api.konnect.network';
    this.webhookUrl = process.env.KONNECT_WEBHOOK_URL || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/api/konnect/webhook`;
    
    console.log('🔗 Service Konnect initialisé:');
    console.log('- API Key:', this.apiKey ? this.apiKey.substring(0, 20) + '...' : 'NON DÉFINIE');
    console.log('- Wallet ID:', this.receiverWalletId || 'NON DÉFINI');
    console.log('- Base URL:', this.baseUrl);
    console.log('- Webhook URL:', this.webhookUrl);
    
    if (!this.apiKey) {
      console.warn('⚠️ KONNECT_API_KEY non définie - service de paiement désactivé');
    }
    if (!this.receiverWalletId) {
      console.warn('⚠️ KONNECT_RECEIVER_WALLET_ID non définie - service de paiement désactivé');
    }
  }

  /**
   * Initialiser un paiement Konnect
   * @param {Object} paymentData - Données du paiement
   * @param {number} paymentData.amountCents - Montant en centimes
   * @param {string} paymentData.currency - Devise (TND par défaut)
   * @param {string} paymentData.description - Description du paiement
   * @param {string} paymentData.merchantOrderId - ID de commande unique
   * @param {string} paymentData.customerEmail - Email du client
   * @param {string} paymentData.returnUrl - URL de retour après paiement
   * @param {string} paymentData.cancelUrl - URL d'annulation
   * @param {Object} paymentData.metadata - Métadonnées additionnelles
   * @returns {Promise<Object>} Résultat du paiement
   */
  async initPayment(paymentData) {
    try {
      if (!this.apiKey || !this.receiverWalletId) {
        throw new Error('Configuration Konnect manquante');
      }

      const {
        amountCents,
        currency = 'TND',
        description,
        merchantOrderId,
        customerEmail,
        returnUrl,
        cancelUrl,
        metadata = {}
      } = paymentData;

      // Validation des paramètres requis
      if (!amountCents || amountCents <= 0) {
        throw new Error('Montant invalide');
      }
      if (!merchantOrderId) {
        throw new Error('ID de commande requis');
      }
      if (!customerEmail) {
        throw new Error('Email client requis');
      }

      const payload = {
        receiverWalletId: this.receiverWalletId,
        token: currency,
        amount: amountCents,
        type: 'immediate',
        description: description || `Paiement ${merchantOrderId}`,
        orderId: merchantOrderId,
        returnUrl: returnUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/success`,
        cancelUrl: cancelUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/cancel`,
        webhook: this.webhookUrl,
        customerEmail: customerEmail,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          source: 'genesis-platform'
        }
      };

      console.log('🚀 Initialisation paiement Konnect:', {
        amount: amountCents,
        currency,
        orderId: merchantOrderId,
        customerEmail
      });

      const response = await axios.post(
        `${this.baseUrl}/api/v2/payments/init-payment`,
        payload,
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const { payUrl, paymentRef } = response.data;

      if (!payUrl || !paymentRef) {
        throw new Error('Réponse Konnect invalide');
      }

      console.log('✅ Paiement Konnect initialisé:', {
        paymentRef,
        payUrl: payUrl.substring(0, 50) + '...'
      });

      return {
        success: true,
        paymentUrl: payUrl,
        konnectPaymentId: paymentRef,
        merchantOrderId,
        amount: amountCents,
        currency,
        status: 'pending'
      };

    } catch (error) {
      console.error('❌ Erreur initialisation paiement Konnect:', error.message);
      
      if (error.response) {
        console.error('Détails erreur Konnect:', error.response.data);
        throw new Error(`Erreur Konnect: ${JSON.stringify(error.response.data)}`);
      }
      
      throw new Error(`Erreur service paiement: ${error.message}`);
    }
  }

  /**
   * Vérifier le statut d'un paiement
   * @param {string} paymentRef - Référence du paiement Konnect
   * @returns {Promise<Object>} Statut du paiement
   */
  async checkPaymentStatus(paymentRef) {
    try {
      if (!this.apiKey) {
        throw new Error('Configuration Konnect manquante');
      }

      if (!paymentRef) {
        throw new Error('Référence paiement requise');
      }

      const response = await axios.get(
        `${this.baseUrl}/api/v2/payments/${paymentRef}`,
        {
          headers: {
            'x-api-key': this.apiKey
          },
          timeout: 10000
        }
      );

      const payment = response.data.payment;
      
      return {
        success: true,
        paymentRef,
        status: payment.status,
        amount: payment.amount,
        currency: payment.token,
        orderId: payment.orderId,
        customerEmail: payment.customerEmail,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
        raw: payment
      };

    } catch (error) {
      console.error('❌ Erreur vérification statut paiement:', error.message);
      
      if (error.response) {
        console.error('Détails erreur Konnect:', error.response.data);
        throw new Error(`Erreur Konnect: ${JSON.stringify(error.response.data)}`);
      }
      
      throw new Error(`Erreur vérification paiement: ${error.message}`);
    }
  }

  /**
   * Traiter un webhook Konnect
   * @param {string} paymentRef - Référence du paiement
   * @returns {Promise<Object>} Résultat du traitement
   */
  async processWebhook(paymentRef) {
    try {
      console.log('🔔 Traitement webhook Konnect:', paymentRef);
      
      const paymentStatus = await this.checkPaymentStatus(paymentRef);
      
      return {
        success: true,
        paymentRef,
        status: paymentStatus.status,
        isCompleted: paymentStatus.status === 'completed',
        isFailed: ['failed', 'cancelled', 'expired'].includes(paymentStatus.status),
        amount: paymentStatus.amount,
        currency: paymentStatus.currency,
        orderId: paymentStatus.orderId,
        customerEmail: paymentStatus.customerEmail,
        completedAt: paymentStatus.completedAt
      };

    } catch (error) {
      console.error('❌ Erreur traitement webhook:', error.message);
      throw error;
    }
  }

  /**
   * Créer une URL de paiement direct (pour les tests)
   * @param {Object} paymentData - Données du paiement
   * @returns {string} URL de paiement
   */
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
      receiver_wallet_id: this.receiverWalletId,
      token: this.apiKey,
      amount: amountCents,
      currency: currency,
      description: description || `Paiement ${merchantOrderId}`,
      return_url: returnUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/success`,
      cancel_url: cancelUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/cancel`,
      merchant_order_id: merchantOrderId,
      customer_email: customerEmail
    });

    return `https://gateway.sandbox.konnect.network/pay?${params.toString()}`;
  }

  /**
   * Valider la configuration Konnect
   * @returns {boolean} Configuration valide
   */
  isConfigured() {
    return !!(this.apiKey && this.receiverWalletId);
  }

  /**
   * Obtenir les informations de configuration (sans les clés sensibles)
   * @returns {Object} Informations de configuration
   */
  getConfig() {
    return {
      isConfigured: this.isConfigured(),
      baseUrl: this.baseUrl,
      webhookUrl: this.webhookUrl,
      hasApiKey: !!this.apiKey,
      hasReceiverWalletId: !!this.receiverWalletId
    };
  }
}

module.exports = new KonnectPaymentService();
