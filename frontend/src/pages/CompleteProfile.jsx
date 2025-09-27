import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';

// --- Définition des Styles (CSS-in-JS) ---

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
`;

const ProfileCard = styled.div`
  background: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  box-sizing: border-box;
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 25px;
  h2 {
    color: #333;
    margin: 0;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  margin-bottom: 25px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background-color: #007bff;
  border-radius: 4px;
  transition: width 0.4s ease-in-out;
`;


const FormStep = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
  }
  
  input, select {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 16px;
    box-sizing: border-box;
    transition: border-color 0.3s, box-shadow 0.3s;

    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
    }
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: ${props => props.isSingle ? 'flex-end' : 'space-between'};
  margin-top: 30px;
`;

const Button = styled.button`
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NextButton = styled(Button)`
  background-color: #007bff;
  color: white;
  &:hover {
    background-color: #0056b3;
  }
`;

const ReturnButton = styled(Button)`
  background-color: #6c757d;
  color: white;
  margin-right: 10px;
  &:hover {
    background-color: #5a6268;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  margin-top: 20px;
`;

// --- Composant React ---

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const TOTAL_STEPS = 2;

const CompleteProfile = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'student'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && (!formData.firstName || !formData.lastName)) {
      setErrors({ general: "Veuillez remplir le nom et le prénom." });
      return;
    }
    setErrors({});
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const response = await axios.put(`${API_BASE_URL}/api/auth/profile/complete`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const user = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...user, ...response.data.user, isProfileComplete: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileContainer>
      <ProfileCard>
        <CardHeader>
          <h2>Compléter votre profil</h2>
        </CardHeader>
        
        <ProgressBarContainer>
           <ProgressBar progress={(step / TOTAL_STEPS) * 100} />
        </ProgressBarContainer>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <FormStep>
              <FormGroup>
                <label>Prénom</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </FormGroup>
              <FormGroup>
                <label>Nom</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </FormGroup>
              <NavigationButtons isSingle={true}>
                  <NextButton type="button" onClick={nextStep}>Suivant &rarr;</NextButton>
              </NavigationButtons>
            </FormStep>
          )}

          {step === 2 && (
            <FormStep>
              <FormGroup>
                <label>Téléphone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Optionnel" />
              </FormGroup>
              <FormGroup>
                <label>Vous êtes</label>
                <select name="userType" value={formData.userType} onChange={handleChange} required>
                  <option value="student">Étudiant</option>
                  <option value="parent">Parent</option>
                </select>
              </FormGroup>
              <NavigationButtons>
                <ReturnButton type="button" onClick={prevStep}>&larr; Retour</ReturnButton>
                <NextButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : 'Terminer'}
                </NextButton>
              </NavigationButtons>
            </FormStep>
          )}

          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
        </form>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default CompleteProfile;