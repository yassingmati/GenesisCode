import React, { useState } from 'react';
import SubscriptionModal from './SubscriptionModal';
import SubscriptionButton from './SubscriptionButton';

const TestSubscriptionSystem = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Test du Système d'Abonnement</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Boutons d'Abonnement</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <SubscriptionButton variant="default" />
          <SubscriptionButton variant="premium" />
          <SubscriptionButton variant="outline" />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Modal d'Abonnement</h2>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Ouvrir Modal d'Abonnement
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Plans Disponibles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h3>Gratuit</h3>
            <p>Première leçon gratuite</p>
            <p><strong>0.00 TND</strong></p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h3>Premium Global</h3>
            <p>Accès complet à tous les parcours</p>
            <p><strong>49.99 TND/mois</strong></p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h3>Premium Débutant</h3>
            <p>Accès aux parcours débutant</p>
            <p><strong>19.99 TND/mois</strong></p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Instructions de Test</h2>
        <ol>
          <li>Cliquer sur "Ouvrir Modal d'Abonnement"</li>
          <li>Vérifier que 3 plans s'affichent</li>
          <li>Cliquer sur "S'abonner" pour un plan gratuit</li>
          <li>Vérifier le message "Plan gratuit - accès immédiat accordé !"</li>
          <li>Cliquer sur "S'abonner" pour un plan payant</li>
          <li>Vérifier la redirection vers Konnect</li>
        </ol>
      </div>

      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        pathId="test-path"
        pathName="Test Parcours"
      />
    </div>
  );
};

export default TestSubscriptionSystem;
