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
    // Utiliser l'endpoint public /api/plans qui est accessible sans authentification
    api.get('/api/plans')
      .then(res => { 
        if (mounted) {
          const plansData = res.data?.plans || res.data || [];
          // Normaliser les plans pour gérer les différents formats (id vs _id)
          const normalizedPlans = plansData.map(plan => ({
            ...plan,
            _id: plan._id || plan.id,
            id: plan.id || plan._id
          }));
          setPlans(normalizedPlans);
        }
      })
      .catch(err => {
        console.error('plans fetch error', err);
        toast.error('Impossible de récupérer les offres.');
        if (mounted) setPlans([]);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <Container>
      <Title>Nos offres</Title>
      {loading ? <div>Chargement...</div> : (
        <Grid>
          {plans.map(p => (
            <Card key={p._id}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <h3 style={{margin:0}}>{p.name}</h3>
                  <div style={{color:'#777'}}>{p.description}</div>
                </div>
                <Price>
                  {p.priceMonthly ? `${(p.priceMonthly/100).toFixed(2)} ${p.currency || 'TND'}` : 'Gratuit'}
                </Price>
              </div>

              <Features>
                {Array.isArray(p.features) && p.features.length > 0 ? p.features.map((f,i) => <li key={i}>{f}</li>) : <li>Aucun avantage listé</li>}
              </Features>

              <div style={{marginTop:'auto', display:'flex', justifyContent:'flex-end'}}>
                <SubscribeButton planId={p._id} returnUrl={`${window.location.origin}/payments/konnect-return`} />
              </div>
            </Card>
          ))}
        </Grid>
      )}
    </Container>
  );
}
