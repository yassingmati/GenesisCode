import React from 'react';

export default function Pagination({ page, pages, onPrev, onNext }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button 
        onClick={onPrev} 
        disabled={page === 1}
        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff', background: '#fff', color: '#223', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
      >
        Précédent
      </button>
      <span style={{ minWidth: 48, textAlign: 'center' }}>{page} / {pages}</span>
      <button 
        onClick={onNext} 
        disabled={page === pages}
        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff', background: '#fff', color: '#223', cursor: page === pages ? 'not-allowed' : 'pointer' }}
      >
        Suivant
      </button>
    </div>
  );
}
