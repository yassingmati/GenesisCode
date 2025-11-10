// src/pages/Plans.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../utils/api';
import SubscribeButton from '../components/SubscribeButton';
import { toast } from 'react-toastify';

const Container = styled.div` padding: 2rem; `;
const Title = styled.h1` margin-bottom: 1rem; `;
const Grid = styled.div`
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(260px,1fr));
  gap:1rem;
`;
const Card = styled.div`
  background:white; padding:1.2rem; border-radius:12px; box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  display:flex; flex-direction:column; gap:0.6rem;
`;
const Price = styled.div` font-size:1.6rem; font-weight:700; `;
const Features = styled.ul` margin:0; padding-left:1rem; color:#555; `;

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // Utiliser l'endpoint /api/subscriptions/plans qui récupère les plans depuis MongoDB Atlas
    api.get('/api/subscriptions/plans')
      .then(res => { 
        if (mounted) {
          const plansData = res.data?.plans || res.data || [];
          console.log('📋 Plans récupérés depuis MongoDB Atlas:', plansData.length);
          // Normaliser les plans pour gérer les différents formats (id vs _id)
          const normalizedPlans = plansData.map(plan => ({
            ...plan,
            _id: plan._id || plan.id,
            id: plan.id || plan._id,
            // S'assurer que les champs sont bien définis
            name: plan.name || 'Plan',
            description: plan.description || '',
            priceMonthly: plan.priceMonthly || null,
            currency: plan.currency || 'TND',
            interval: plan.interval || null,
            features: Array.isArray(plan.features) ? plan.features : []
          }));
          setPlans(normalizedPlans);
          console.log('✅ Plans normalisés:', normalizedPlans.length);
        }
      })
      .catch(err => {
        console.error('❌ Erreur récupération plans:', err);
        toast.error('Impossible de récupérer les offres depuis MongoDB Atlas.');
        if (mounted) setPlans([]);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <Container>
      <Title>Nos offres</Title>
      {loading ? (
        <div style={{padding: '2rem', textAlign: 'center'}}>Chargement des plans depuis MongoDB Atlas...</div>
      ) : plans.length === 0 ? (
        <div style={{padding: '2rem', textAlign: 'center', color: '#777'}}>
          Aucun plan disponible pour le moment.
        </div>
      ) : (
        <Grid>
          {plans.map(p => (
            <Card key={p._id || p.id}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '0.5rem'}}>
                <div style={{flex: 1}}>
                  <h3 style={{margin:0, marginBottom: '0.25rem'}}>{p.name || 'Plan'}</h3>
                  <div style={{color:'#777', fontSize: '0.9rem'}}>{p.description || 'Aucune description'}</div>
                </div>
                <Price style={{textAlign: 'right', marginLeft: '1rem'}}>
                  {p.priceMonthly && p.priceMonthly > 0 
                    ? (
                      <>
                        <div style={{fontSize: '1.6rem', fontWeight: '700'}}>
                          {(p.priceMonthly/100).toFixed(2)} {p.currency || 'TND'}
                        </div>
                        {p.interval && (
                          <div style={{fontSize: '0.8rem', fontWeight: 'normal', color: '#777'}}>
                            / {p.interval === 'month' ? 'mois' : p.interval === 'year' ? 'an' : ''}
                          </div>
                        )}
                      </>
                    )
                    : (
                      <div style={{fontSize: '1.6rem', fontWeight: '700', color: '#28a745'}}>
                        Gratuit
                      </div>
                    )}
                </Price>
              </div>

              <Features style={{marginTop: '1rem', marginBottom: '1rem'}}>
                {Array.isArray(p.features) && p.features.length > 0 
                  ? p.features.map((f,i) => (
                      <li key={i} style={{marginBottom: '0.25rem'}}>{f}</li>
                    ))
                  : <li style={{color: '#999', fontStyle: 'italic'}}>Aucun avantage listé</li>
                }
              </Features>

              <div style={{marginTop:'auto', display:'flex', justifyContent:'flex-end', paddingTop: '1rem', borderTop: '1px solid #eee'}}>
                <SubscribeButton planId={p._id || p.id} returnUrl={`${window.location.origin}/payments/konnect-return`} />
              </div>
            </Card>
          ))}
        </Grid>
      )}
    </Container>
  );
}
