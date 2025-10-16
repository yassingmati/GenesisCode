// src/components/LoadingSpinner.jsx
import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24px 24px 0 0;
  }
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 126, 234, 0.1);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

const LoadingText = styled.div`
  font-size: 1.1rem;
  color: #495057;
  font-weight: 500;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 0.5rem;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

export default function LoadingSpinner({ message = 'Chargement...' }) {
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>{message}</LoadingText>
      <LoadingDots>
        <Dot delay={0} />
        <Dot delay={0.2} />
        <Dot delay={0.4} />
      </LoadingDots>
    </LoadingContainer>
  );
}










