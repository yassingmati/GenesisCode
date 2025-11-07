// src/pages/parent/InviteChild.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import { getApiUrl } from '../../utils/apiConfig';

const Container = styled.div`
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #6c757d;
  text-align: center;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #495057;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  &.error {
    border-color: #dc3545;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: #007bff;
    color: white;

    &:hover:not(:disabled) {
      background: #0056b3;
    }

    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: #6c757d;
    color: white;

    &:hover {
      background: #545b62;
    }
  }
`;

const InfoBox = styled.div`
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const InfoTitle = styled.h4`
  color: #0066cc;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
`;

const InfoText = styled.p`
  color: #004499;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

export default function InviteChild() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    childEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.childEmail.trim()) {
      setError('L\'email de l\'enfant est requis');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.childEmail)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : getApiUrl(''));
      const response = await fetch(`${API_BASE_URL}/api/parent/invite-child`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'invitation');
      }

      setSuccess(`Invitation envoyée avec succès à ${formData.childEmail}`);
      setFormData({ childEmail: '' });
      
      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        window.location.href = '/parent/dashboard';
      }, 2000);

    } catch (error) {
      console.error('Erreur invitation:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/parent/dashboard';
  };

  return (
    <Container>
      <Card>
        <Title>Inviter un enfant</Title>
        <Subtitle>
          Ajoutez votre enfant à votre compte parent pour suivre ses progrès et gérer ses paramètres.
        </Subtitle>

        <InfoBox>
          <InfoTitle>💡 Comment ça marche ?</InfoTitle>
          <InfoText>
            Entrez l'email de votre enfant. Il recevra une invitation par email et pourra accepter 
            de partager ses données avec vous. Une fois acceptée, vous pourrez suivre ses progrès 
            et configurer les contrôles parentaux.
          </InfoText>
        </InfoBox>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="childEmail">Email de l'enfant *</Label>
            <Input
              type="email"
              id="childEmail"
              name="childEmail"
              value={formData.childEmail}
              onChange={handleChange}
              placeholder="enfant@exemple.com"
              className={error ? 'error' : ''}
              disabled={loading}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
          </FormGroup>

          <ButtonGroup>
            <Button 
              type="button" 
              className="secondary" 
              onClick={handleCancel}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="primary" 
              disabled={loading}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
            </Button>
          </ButtonGroup>
        </Form>
      </Card>
    </Container>
  );
}
