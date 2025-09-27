// src/pages/PaymentReturn.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Container = styled.div` padding:2rem; display:flex; flex-direction:column; gap:1rem; align-items:center; `;

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const navigate = useNavigate();

  useEffect(() => {
    // Option: read payment ref from query to show it
    const paymentRef = searchParams.get('payment_ref') || searchParams.get('paymentRef') || searchParams.get('payment_id');
    (async () => {
      try {
        // refresh subscription from server
        const res = await api.get('/api/subscriptions/me');
        const sub = res.data.subscription || {};
        if (sub.status === 'active') {
          setStatus('success');
          toast.success('Paiement reçu — abonnement activé !');
        } else if (sub.konnectStatus === 'pending') {
          setStatus('pending');
          toast.info('Paiement en attente — vérifie dans quelques instants.');
        } else {
          setStatus('failed');
          toast.error('Paiement non confirmé.');
        }
      } catch (err) {
        console.error('PaymentReturn error', err);
        setStatus('error');
        toast.error('Erreur lors de la vérification du paiement.');
      }
    })();
  }, [searchParams]);

  return (
    <Container>
      {status === 'checking' && <div>Vérification du paiement...</div>}
      {status === 'success' && (
        <>
          <h2>Paiement confirmé</h2>
          <p>Merci — votre abonnement est activé.</p>
          <button onClick={() => navigate('/dashboard')}>Aller au tableau de bord</button>
        </>
      )}
      {status === 'pending' && (
        <>
          <h2>Paiement en attente</h2>
          <p>Nous vérifions la transaction. Revenez dans quelques secondes.</p>
          <button onClick={() => navigate('/subscriptions')}>Voir mes abonnements</button>
        </>
      )}
      {status === 'failed' && (
        <>
          <h2>Paiement non confirmé</h2>
          <p>Si tu as été débité, contacte le support. Sinon tu peux réessayer.</p>
          <button onClick={() => navigate('/plans')}>Voir les offres</button>
        </>
      )}
      {status === 'error' && <div>Erreur réseau, réessaye plus tard.</div>}
    </Container>
  );
}
