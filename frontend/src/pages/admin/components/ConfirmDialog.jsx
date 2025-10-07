import React from 'react';

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(12, 18, 34, 0.44)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: 'min(400px, 90vw)',
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 8px 32px rgba(36,49,88,0.10)'
      }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
        <p style={{ color: '#6b7280', margin: '16px 0' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 8, background: '#fff', border: '1px solid #eef2ff' }}>
            Annuler
          </button>
          <button onClick={onConfirm} style={{ padding: '8px 12px', borderRadius: 8, background: '#d23', color: '#fff', border: 'none' }}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
