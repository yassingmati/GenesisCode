import React from 'react';

export default function FormModal({ open, title, onClose, children, footer, width = 820 }) {
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
        width: `min(${width}px, 96vw)`,
        maxHeight: '90vh',
        overflow: 'auto',
        borderRadius: 12,
        background: '#fff',
        padding: 24,
        boxShadow: '0 8px 32px rgba(36,49,88,0.10)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>&times;</button>
        </div>
        <div>{children}</div>
        {footer && <div style={{ marginTop: 18 }}>{footer}</div>}
      </div>
    </div>
  );
}
