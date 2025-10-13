// Service de paiement Konnect pour le frontend
import API_CONFIG from '../config/api';

class KonnectService {
  /**
   * Initialiser un paiement Konnect
   * @param {Object} paymentData - Données du paiement
   * @param {string} paymentData.planId - ID du plan
   * @param {string} paymentData.customerEmail - Email du client
   * @param {string} [paymentData.returnUrl] - URL de retour
   * @param {string} [paymentData.cancelUrl] - URL d'annulation
   * @returns {Promise<Object>} - Résultat du paiement
   */
  static async initPayment(paymentData) {
    try {
      console.log('🚀 Initialisation du paiement Konnect:', paymentData);

      // Validation des données requises
      if (!paymentData.planId) {
        throw new Error('ID du plan requis');
      }
      if (!paymentData.customerEmail) {
        throw new Error('Email du client requis');
      }

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.PAYMENT_INIT), {
        method: 'POST',
        headers: API_CONFIG.getPublicHeaders(),
        body: JSON.stringify({
          planId: paymentData.planId,
          customerEmail: paymentData.customerEmail,
          returnUrl: paymentData.returnUrl || `${window.location.origin}/payment/success`,
          cancelUrl: paymentData.cancelUrl || `${window.location.origin}/payment/cancel`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Paiement Konnect initialisé:', result);

      // Vérifier si c'est un accès gratuit
      if (result.freeAccess) {
        return {
          success: true,
          freeAccess: true,
          plan: result.plan,
          message: result.message
        };
      }

      // Vérifier si l'URL de paiement est générée
      if (result.paymentUrl) {
        return {
          success: true,
          paymentUrl: result.paymentUrl,
          konnectPaymentId: result.konnectPaymentId,
          merchantOrderId: result.merchantOrderId,
          plan: result.plan,
          message: result.message
        };
      }

      throw new Error(result.message || 'Erreur lors de l\'initialisation du paiement');

    } catch (error) {
      console.error('❌ Erreur initialisation paiement Konnect:', error);
      throw error;
    }
  }

  /**
   * Vérifier le statut d'un paiement
   * @param {string} paymentId - ID du paiement
   * @returns {Promise<Object>} - Statut du paiement
   */
  static async checkPaymentStatus(paymentId) {
    try {
      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.PAYMENT_STATUS(paymentId)), {
        method: 'GET',
        headers: API_CONFIG.getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erreur vérification statut paiement:', error);
      throw error;
    }
  }

  /**
   * Ouvrir la page de paiement Konnect
   * @param {string} paymentUrl - URL de paiement Konnect
   * @returns {Promise<Object>} - Fenêtre de paiement
   */
  static openPaymentWindow(paymentUrl) {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔗 Ouverture de la page de paiement Konnect:', paymentUrl);
        
        const paymentWindow = window.open(
          paymentUrl,
          'konnect_payment',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );

        if (!paymentWindow) {
          throw new Error('Impossible d\'ouvrir la fenêtre de paiement. Vérifiez les bloqueurs de popup.');
        }

        // Vérifier si la fenêtre est fermée
        const checkClosed = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkClosed);
            resolve({ status: 'cancelled', message: 'Paiement annulé par l\'utilisateur' });
          }
        }, 1000);

        // Écouter les messages de la fenêtre de paiement
        const messageHandler = (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'konnect_payment_success') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            paymentWindow.close();
            resolve({ status: 'success', data: event.data });
          } else if (event.data.type === 'konnect_payment_error') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            paymentWindow.close();
            reject(new Error(event.data.message || 'Erreur de paiement'));
          }
        };

        window.addEventListener('message', messageHandler);

        // Timeout après 30 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          if (!paymentWindow.closed) {
            paymentWindow.close();
          }
          reject(new Error('Timeout du paiement'));
        }, 30 * 60 * 1000);

      } catch (error) {
        console.error('❌ Erreur ouverture fenêtre de paiement:', error);
        reject(error);
      }
    });
  }

  /**
   * Rediriger vers la page de paiement Konnect
   * @param {string} paymentUrl - URL de paiement Konnect
   */
  static redirectToPayment(paymentUrl) {
    console.log('🔗 Redirection vers la page de paiement Konnect:', paymentUrl);
    window.location.href = paymentUrl;
  }

  /**
   * Construire l'URL de paiement Konnect directement
   * @param {Object} paymentData - Données du paiement
   * @returns {string} - URL de paiement Konnect
   */
  static buildPaymentUrl(paymentData) {
    const params = new URLSearchParams({
      receiver_wallet_id: API_CONFIG.KONNECT.RECEIVER_WALLET_ID,
      token: API_CONFIG.KONNECT.API_KEY,
      amount: Math.round(paymentData.amount * 100), // Convertir en centimes
      currency: paymentData.currency || 'TND',
      description: paymentData.description || 'Paiement GenesisCode',
      return_url: paymentData.returnUrl || `${window.location.origin}/payment/success`,
      cancel_url: paymentData.cancelUrl || `${window.location.origin}/payment/cancel`,
      merchant_order_id: paymentData.merchantOrderId || `order_${Date.now()}`,
      customer_email: paymentData.customerEmail
    });

    return `${API_CONFIG.KONNECT.GATEWAY_URL}/pay?${params.toString()}`;
  }
}

export default KonnectService;
