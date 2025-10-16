// src/components/Toast.jsx
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Toast = styled.div`
  background: ${props => {
    switch (props.type) {
      case 'success': return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
      case 'error': return 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)';
      case 'warning': return 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
      case 'info': return 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)';
      default: return 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
    }
  }};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 300px;
  max-width: 400px;
  animation: ${props => props.isVisible ? slideIn : slideOut} 0.3s ease-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    min-width: 280px;
    max-width: calc(100vw - 40px);
  }
`;

const ToastHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ToastTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToastClose = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ToastMessage = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
`;

const ToastProgress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  width: ${props => props.progress}%;
  transition: width linear;
  transition-duration: ${props => props.duration}ms;
`;

export default function ToastComponent({ toasts, onRemove }) {
  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          isVisible={toast.isVisible}
        >
          <ToastHeader>
            <ToastTitle>
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
              {toast.title}
            </ToastTitle>
            <ToastClose onClick={() => onRemove(toast.id)}>
              ×
            </ToastClose>
          </ToastHeader>
          <ToastMessage>{toast.message}</ToastMessage>
          {toast.duration > 0 && (
            <ToastProgress
              progress={toast.progress}
              duration={toast.duration}
            />
          )}
        </Toast>
      ))}
    </ToastContainer>
  );
}

// Hook pour gérer les toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      isVisible: true,
      progress: 100,
      duration: toast.duration || 5000,
      ...toast
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove après la durée spécifiée
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id 
          ? { ...toast, isVisible: false }
          : toast
      )
    );

    // Supprimer complètement après l'animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  };

  const success = (message, title = 'Succès') => 
    addToast({ type: 'success', message, title });

  const error = (message, title = 'Erreur') => 
    addToast({ type: 'error', message, title });

  const warning = (message, title = 'Attention') => 
    addToast({ type: 'warning', message, title });

  const info = (message, title = 'Information') => 
    addToast({ type: 'info', message, title });

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};










