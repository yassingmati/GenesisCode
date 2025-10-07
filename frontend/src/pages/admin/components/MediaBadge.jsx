import React from 'react';

const langColors = {
  fr: '#2b49ee',
  en: '#10b981',
  ar: '#f59e42'
};

export default function MediaBadge({ lang, hasMedia, onPreview, onDelete, mediaType = 'video' }) {
  if (!hasMedia) return null;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 8px',
      borderRadius: 8,
      fontSize: 12,
      background: langColors[lang] || '#e6edff',
      color: '#fff',
      marginLeft: 6,
      cursor: 'pointer'
    }}>
      <span onClick={onPreview} title={`Voir le ${mediaType.toUpperCase()} ${lang.toUpperCase()}`}>{mediaType.toUpperCase()} {lang.toUpperCase()}</span>
      <span onClick={onDelete} title="Supprimer" style={{ marginLeft: 4, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>×</span>
    </span>
  );
}
