import React from 'react';
import SimpleSubscriptionButton from '../components/SimpleSubscriptionButton';
import TestKonnectPayment from '../components/TestKonnectPayment';
import './TestPayment.css';

const TestPayment = () => {
  return (
    <div className="test-payment-page">
      <div className="test-payment-container">
        <h1>🧪 Test du Système de Paiement</h1>
        <p>Testez le nouveau système de paiement simplifié</p>
        
        <div className="test-section">
          <h2>🧪 Test Complet du Système de Paiement</h2>
          <TestKonnectPayment />
        </div>

        <div className="test-section">
          <h2>Boutons d'abonnement</h2>
          <div className="button-group">
            <SimpleSubscriptionButton variant="premium" className="large" />
            <SimpleSubscriptionButton variant="default" />
            <SimpleSubscriptionButton variant="outline" className="small" />
          </div>
        </div>

        <div className="test-section">
          <h2>Instructions de test</h2>
          <ol>
            <li>Cliquez sur un bouton d'abonnement</li>
            <li>Le modal s'ouvre avec les plans</li>
            <li>Testez le plan gratuit (accès immédiat)</li>
            <li>Testez un plan payant (redirection Konnect)</li>
            <li>Vérifiez que tout fonctionne</li>
          </ol>
        </div>

        <div className="test-section">
          <h2>Endpoints de test</h2>
          <div className="endpoint-list">
            <div className="endpoint">
              <strong>GET</strong> <code>/api/test</code> - Test du serveur
            </div>
            <div className="endpoint">
              <strong>GET</strong> <code>/api/plans</code> - Liste des plans
            </div>
            <div className="endpoint">
              <strong>POST</strong> <code>/api/payment/init</code> - Initialiser paiement
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPayment;
