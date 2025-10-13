// Composant de test pour le système de paiement Konnect reformulé
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import KonnectPaymentHandler from './KonnectPaymentHandler';
import { FiCheck, FiX, FiLoader, FiCreditCard, FiExternalLink } from 'react-icons/fi';
import './TestKonnectPayment.css';

const TestKonnectPayment = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/plans');
      const data = await response.json();

      if (data.success) {
        setPlans(data.plans);
        console.log('✅ Plans chargés:', data.plans);
        addTestResult('Plans chargés', 'success', `Plans récupérés: ${data.plans.length}`);
      } else {
        throw new Error(data.message || 'Erreur de chargement des plans');
      }
    } catch (err) {
      console.error('❌ Erreur chargement plans:', err);
      setError('Erreur de connexion au serveur');
      addTestResult('Chargement plans', 'error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTestResult = (test, status, message) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handlePlanSelect = (plan) => {
    console.log('📋 Plan sélectionné:', plan);
    console.log('📋 Plan ID:', plan._id || plan.id);
    
    setSelectedPlan(plan);
    setError(null);
    addTestResult('Plan sélectionné', 'info', `Plan: ${plan.name} (ID: ${plan._id || plan.id}) (${plan.priceMonthly ? (plan.priceMonthly / 100).toFixed(2) + ' TND' : 'Gratuit'})`);
  };

  const handlePaymentSuccess = (result) => {
    console.log('✅ Paiement réussi:', result);
    addTestResult('Paiement réussi', 'success', result.type === 'free_access' ? 'Accès gratuit accordé' : 'Paiement effectué');
  };

  const handlePaymentError = (error) => {
    console.error('❌ Erreur paiement:', error);
    addTestResult('Erreur paiement', 'error', error.message);
  };

  const handlePaymentCancel = () => {
    console.log('⚠️ Paiement annulé');
    addTestResult('Paiement annulé', 'warning', 'Utilisateur a annulé le paiement');
  };

  const resetTest = () => {
    setSelectedPlan(null);
    setError(null);
    setTestResults([]);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FiCheck className="text-green-500" />;
      case 'error':
        return <FiX className="text-red-500" />;
      case 'warning':
        return <FiX className="text-yellow-500" />;
      case 'info':
        return <FiLoader className="text-blue-500" />;
      default:
        return <FiLoader />;
    }
  };

  return (
    <div className="test-konnect-payment">
      <div className="test-header">
        <h1>🧪 Test du Système de Paiement Konnect</h1>
        <p>Testez le nouveau système de paiement reformulé</p>
      </div>

      <div className="test-content">
        {/* Section Plans */}
        <div className="test-section">
          <h2>📋 Plans Disponibles</h2>
          {loading ? (
            <div className="loading">
              <FiLoader className="animate-spin" />
              <span>Chargement des plans...</span>
            </div>
          ) : error ? (
            <div className="error">
              <FiX />
              <span>{error}</span>
            </div>
          ) : (
            <div className="plans-grid">
              {plans.map(plan => (
                <motion.div
                  key={plan._id}
                  className={`plan-card ${selectedPlan?._id === plan._id ? 'selected' : ''}`}
                  onClick={() => handlePlanSelect(plan)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="plan-header">
                    <h3>{plan.name}</h3>
                    <div className="plan-price">
                      {plan.priceMonthly ? 
                        `${(plan.priceMonthly / 100).toFixed(2)} ${plan.currency}` : 
                        'Gratuit'
                      }
                    </div>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-features">
                    {plan.features?.map((feature, index) => (
                      <div key={index} className="feature">
                        <FiCheck />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Section Test de Paiement */}
        {selectedPlan && (
          <div className="test-section">
            <h2>💳 Test de Paiement</h2>
            <div className="selected-plan">
              <h3>Plan sélectionné: {selectedPlan.name}</h3>
              <p>{selectedPlan.description}</p>
              <div className="plan-debug">
                <h4>🔍 Détails du Plan (Debug)</h4>
                <div className="debug-info">
                  <div><strong>ID:</strong> {selectedPlan._id || selectedPlan.id || 'NON DÉFINI'}</div>
                  <div><strong>Nom:</strong> {selectedPlan.name}</div>
                  <div><strong>Prix:</strong> {selectedPlan.priceMonthly ? (selectedPlan.priceMonthly / 100).toFixed(2) + ' TND' : 'Gratuit'}</div>
                  <div><strong>Devise:</strong> {selectedPlan.currency || 'NON DÉFINIE'}</div>
                  <div><strong>Actif:</strong> {selectedPlan.active ? 'Oui' : 'Non'}</div>
                </div>
              </div>
            </div>
            
            <KonnectPaymentHandler
              plan={selectedPlan}
              customerEmail="test@genesis.com"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          </div>
        )}

        {/* Section Résultats de Test */}
        <div className="test-section">
          <div className="test-results-header">
            <h2>📊 Résultats de Test</h2>
            <button onClick={resetTest} className="btn-reset">
              Réinitialiser
            </button>
          </div>
          
          <div className="test-results">
            {testResults.length === 0 ? (
              <p className="no-results">Aucun test effectué</p>
            ) : (
              testResults.map(result => (
                <motion.div
                  key={result.id}
                  className={`test-result ${result.status}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="result-icon">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="result-content">
                    <div className="result-test">{result.test}</div>
                    <div className="result-message">{result.message}</div>
                    <div className="result-time">{result.timestamp}</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Section Instructions */}
        <div className="test-section">
          <h2>📝 Instructions de Test</h2>
          <div className="instructions">
            <ol>
              <li><strong>Sélectionnez un plan</strong> - Cliquez sur un plan pour le tester</li>
              <li><strong>Testez l'accès gratuit</strong> - Le plan "Gratuit" devrait donner un accès immédiat</li>
              <li><strong>Testez un plan payant</strong> - Les autres plans devraient ouvrir Konnect</li>
              <li><strong>Vérifiez les URLs</strong> - Les URLs générées doivent être au format Konnect</li>
              <li><strong>Surveillez les résultats</strong> - Consultez la section "Résultats de Test"</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestKonnectPayment;
