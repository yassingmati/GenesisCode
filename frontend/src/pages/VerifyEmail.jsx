// src/pages/VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message === 'Email vérifié avec succès') {
          setMessage('Votre email a bien été vérifié ! Redirection…');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setMessage(data.message || 'Erreur inconnue');
        }
      })
      .catch(() => setMessage('Impossible de contacter le serveur'));
  }, [token, navigate]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Vérification d'email</h1>
      <p>{message}</p>
    </div>
  );
}
