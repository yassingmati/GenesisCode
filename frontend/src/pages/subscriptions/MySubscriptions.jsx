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
      const subscription = res.data?.subscription || res.data || null;
      setUserSub(subscription);
      
      if (!subscription) {
        console.log('Aucun abonnement actif pour cet utilisateur');
      } else {
        console.log('Abonnement récupéré:', subscription);
      }
    } catch (err) {
      console.error('getMySubscription error', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors du chargement de l\'abonnement';
      toast.error(errorMsg);
      setUserSub(null);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMe(); }, []);

  const handleCancel = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Il restera actif jusqu\'à la fin de la période en cours.')) return;
    setProcessing(true);
    try {
      await api.post('/api/subscriptions/cancel');
      toast.success('Abonnement annulé avec succès. Il restera actif jusqu\'à la fin de la période.');
      await fetchMe();
    } catch (err) {
      console.error('Erreur annulation abonnement:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de l\'annulation de l\'abonnement';
      toast.error(errorMsg);
    } finally { setProcessing(false); }
  };

  const handleResume = async () => {
    setProcessing(true);
    try {
      await api.post('/api/subscriptions/resume');
      toast.success('Abonnement réactivé avec succès.');
      await fetchMe();
    } catch (err) {
      console.error('Erreur reprise abonnement:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de la reprise de l\'abonnement';
      toast.error(errorMsg);
    } finally { setProcessing(false); }
  };

  const handleChangePlan = async (newPlanId) => {
    if (!window.confirm('Confirmer le changement de plan ?')) return;
    setProcessing(true);
    try {
      await api.post('/api/subscriptions/change-plan', { newPlanId });
      toast.success('Plan modifié avec succès.');
      await fetchMe();
    } catch (err) {
      console.error('Erreur changement plan:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors du changement de plan';
      toast.error(errorMsg);
    } finally { setProcessing(false); }
  };

  if (loading) return <Container>Chargement...</Container>;

  return (
    <Container>
      <h1>Mon abonnement</h1>
      {!userSub ? (
        <Box>
          <p>Vous n'avez pas d'abonnement actif.</p>
          <p style={{marginTop: '1rem', color: '#666'}}>
            Explorez nos plans d'abonnement pour accéder à tous nos contenus premium.
          </p>
        </Box>
      ) : (
        <Box>
          <p><strong>Plan:</strong> {userSub.plan?.name || userSub.planId || '—'}</p>
          <p><strong>Statut:</strong> <span style={{
            color: userSub.status === 'active' ? '#28a745' : '#dc3545',
            fontWeight: 'bold'
          }}>{userSub.status || '—'}</span></p>
          <p><strong>Fin période:</strong> {userSub.currentPeriodEnd ? new Date(userSub.currentPeriodEnd).toLocaleString('fr-FR') : '—'}</p>
          {userSub.cancelAtPeriodEnd && (
            <p style={{color: '#ffc107', fontWeight: 'bold'}}>
              ⚠️ Abonnement annulé - Se terminera à la fin de la période
            </p>
          )}
          <div style={{marginTop:12, display:'flex', gap:8, flexWrap: 'wrap'}}>
            {userSub.status === 'active' && userSub.cancelAtPeriodEnd && (
              <button 
                disabled={processing} 
                onClick={handleResume}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                {processing ? 'Traitement...' : 'Réactiver'}
              </button>
            )}
            {userSub.status === 'active' && !userSub.cancelAtPeriodEnd && (
              <button 
                disabled={processing} 
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                {processing ? 'Traitement...' : 'Annuler l\'abonnement'}
              </button>
            )}
          </div>
        </Box>
      )}
    </Container>
  );
}
