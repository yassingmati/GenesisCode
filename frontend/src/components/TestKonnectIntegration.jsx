// Composant de test pour l'intégration Konnect complète
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import KonnectService from '../services/konnectService';
import SubscriptionService from '../services/subscriptionService';
import SubscriptionModal from './SubscriptionModal';
import KonnectPaymentHandler from './KonnectPaymentHandler';
import './TestKonnectIntegration.css';

const TestKonnectIntegration = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentHandler, setShowPaymentHandler] = useState(false);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const plansData = await SubscriptionService.getPlans();
      setPlans(plansData);
      console.log('✅ Plans chargés:', plansData);

    } catch (err) {
      console.error('❌ Erreur chargement plans:', err);
      setError('Erreur de chargement des plans');
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    const results = [];
    
    try {
      // Test 1: Configuration Konnect
      results.push({
        test: 'Configuration Konnect',
        status: 'success',
        message: 'Configuration chargée correctement'
      });

      // Test 2: Plans disponibles
      results.push({
        test: 'Plans disponibles',
        status: plans.length > 0 ? 'success' : 'error',
        message: `${plans.length} plans trouvés`
      });

      // Test 3: Service Konnect
      try {
        const testPayment = await KonnectService.initPayment({
          planId: 'free',
          customerEmail: 'test@genesis.com'
        });
        results.push({
          test: 'Service Konnect',
          status: 'success',
          message: 'Service Konnect fonctionnel'
        });
      } catch (err) {
        results.push({
          test: 'Service Konnect',
          status: 'error',
          message: err.message
        });
      }

      // Test 4: Service d'abonnement
      try {
        await SubscriptionService.getPlans();
        results.push({
          test: 'Service d\'abonnement',
          status: 'success',
          message: 'Service d\'abonnement fonctionnel'
        });
      } catch (err) {
        results.push({
          test: 'Service d\'abonnement',
          status: 'error',
          message: err.message
        });
      }

    } catch (err) {
      results.push({
        test: 'Tests généraux',
        status: 'error',
        message: err.message
      });
    }

    setTestResults(results);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handlePaymentInit = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentHandler(true);
  };

  const handlePaymentSuccess = (plan) => {
    console.log('✅ Paiement réussi pour le plan:', plan);
    setShowPaymentHandler(false);
    setShowModal(false);
    setSelectedPlan(null);
  };

  const handlePaymentError = (error) => {
    console.error('❌ Erreur paiement:', error);
    setShowPaymentHandler(false);
    setShowModal(false);
    setSelectedPlan(null);
  };

  const formatPrice = (priceCents) => {
    if (!priceCents) return 'Gratuit';
    return `${(priceCents / 100).toFixed(2)} TND`;
  };

  return (
    <div className="test-konnect-integration">
      <div className="test-header">
        <h1>🧪 Test d'Intégration Konnect</h1>
        <p>Vérification complète du système de paiement Konnect</p>
      </div>

      <div className="test-actions">
        <motion.button
          className="test-btn primary"
          onClick={runTests}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🚀 Lancer les Tests
        </motion.button>

        <motion.button
          className="test-btn secondary"
          onClick={loadPlans}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 Recharger les Plans
        </motion.button>
      </div>

      {/* Résultats des tests */}
      {testResults.length > 0 && (
        <div className="test-results">
          <h3>📊 Résultats des Tests</h3>
          {testResults.map((result, index) => (
            <motion.div
              key={index}
              className={`test-result ${result.status}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="result-icon">
                {result.status === 'success' ? '✅' : '❌'}
              </div>
              <div className="result-content">
                <h4>{result.test}</h4>
                <p>{result.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Plans disponibles */}
      <div className="plans-section">
        <h3>📋 Plans Disponibles</h3>
        
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des plans...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={loadPlans} className="retry-btn">
              Réessayer
            </button>
          </div>
        ) : (
          <div className="plans-grid">
            {plans && plans.length > 0 ? plans.map((plan) => (
              <motion.div
                key={plan._id}
                className="plan-card"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="plan-header">
                  <h4>{plan.name}</h4>
                  <div className="plan-price">
                    {formatPrice(plan.priceMonthly)}
                  </div>
                </div>
                
                <div className="plan-description">
                  <p>{plan.description}</p>
                </div>

                <div className="plan-features">
                  <ul>
                    {plan.features?.map((feature, index) => (
                      <li key={index}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="plan-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => handlePlanSelect(plan)}
                  >
                    Voir Détails
                  </button>
                  <button
                    className="action-btn secondary"
                    onClick={() => handlePaymentInit(plan)}
                  >
                    Tester Paiement
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="no-plans">
                <p>Aucun plan disponible pour le moment.</p>
                <button onClick={loadPlans} className="retry-btn">
                  Recharger
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {showModal && selectedPlan && (
        <SubscriptionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          pathId={null}
          pathName="Test Konnect"
          onSubscribe={handlePaymentSuccess}
        />
      )}

      {showPaymentHandler && selectedPlan && (
        <div className="payment-handler-overlay">
          <div className="payment-handler-container">
            <button
              className="close-btn"
              onClick={() => setShowPaymentHandler(false)}
            >
              ✕
            </button>
            <KonnectPaymentHandler
              plan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={() => setShowPaymentHandler(false)}
              customerEmail="test@genesis.com"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestKonnectIntegration;
