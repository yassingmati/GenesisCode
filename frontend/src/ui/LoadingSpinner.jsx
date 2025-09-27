import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeStyles = {
    small: { width: 24, height: 24 },
    medium: { width: 48, height: 48 },
    large: { width: 64, height: 64 }
  };
  
  return (
    <div style={styles.container}>
      <div 
        style={{ 
          ...styles.spinner, 
          ...sizeStyles[size] 
        }} 
        aria-hidden="true" 
      />
      <span style={styles.srOnly}>Chargement en cours</span>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh'
  },
  spinner: {
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  }
};

export default LoadingSpinner;