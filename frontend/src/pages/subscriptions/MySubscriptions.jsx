// src/pages/subscriptions/MySubscriptions.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const Container = styled.div` padding:2rem; `;
const Box = styled.div` background:white; padding:1.2rem; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.05); `;

export default function MySubscriptions() {
  const [userSub, setUserSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchMe = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/subscriptions/me');
      setUserSub(res.data.subscription || null);
    } catch (err) {
      console.error('getMySubscription error', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMe(); }, []);

  const handleCancel = async () => {
    if (!window.confirm('Annuler l’abonnement à la fin de la période ?')) return;
    setProcessing(true);
    try {
      await api.post('/api/subscriptions/cancel');
      toast.success('Annulation programmée.');
      await fetchMe();
    } catch (err) {
      console.error(err);
    } finally { setProcessing(false); }
  };

  const handleResume = async () => {
    setProcessing(true);
    try {
      await api.post('/api/subscriptions/resume');
      toast.success('Abonnement réactivé.');
      await fetchMe();
    } catch (err) {
      console.error(err);
    } finally { setProcessing(false); }
  };

  const handleChangePlan = async (newPlanId) => {
    if (!window.confirm('Confirmer le changement de plan ?')) return;
    setProcessing(true);
    try {
      await api.post('/api/subscriptions/change-plan', { planId: newPlanId });
      toast.success('Plan modifié.');
      await fetchMe();
    } catch (err) {
      console.error(err);
    } finally { setProcessing(false); }
  };

  if (loading) return <Container>Chargement...</Container>;

  return (
    <Container>
      <h1>Mon abonnement</h1>
      {!userSub || !userSub.planId ? (
        <Box>
          <p>Vous n'avez pas d'abonnement actif.</p>
        </Box>
      ) : (
        <Box>
          <p><strong>Plan:</strong> {userSub.planId}</p>
          <p><strong>Statut:</strong> {userSub.status || '—'}</p>
          <p><strong>Fin période:</strong> {userSub.currentPeriodEnd ? new Date(userSub.currentPeriodEnd).toLocaleString() : '—'}</p>
          <p><strong>konnectStatus:</strong> {userSub.konnectStatus || '—'}</p>
          <div style={{marginTop:12, display:'flex', gap:8}}>
            {userSub.status !== 'active' && <button disabled={processing} onClick={handleResume}>Réactiver</button>}
            {userSub.status === 'active' && <button disabled={processing} onClick={handleCancel}>Annuler</button>}
            <button disabled={processing} onClick={() => handleChangePlan('pro')}>Passer au plan Pro</button>
          </div>
        </Box>
      )}
    </Container>
  );
}
