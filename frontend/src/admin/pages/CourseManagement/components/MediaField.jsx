import React from 'react';

export default function MediaField({ lang, file, previewUrl, onChange, uploading, progress, mediaType = 'video' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, color: '#223' }}>{mediaType.toUpperCase()} {lang.toUpperCase()}</label>
      {previewUrl && (
        <div style={{ marginBottom: 4 }}>
          {mediaType === 'video' ? (
            <video src={previewUrl} controls style={{ width: '100%', maxHeight: 80, borderRadius: 6 }} />
          ) : (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">Voir PDF</a>
          )}
        </div>
      )}
      <input 
        type="file" 
        accept={mediaType === 'video' ? 'video/*' : 'application/pdf'} 
        onChange={e => onChange(e.target.files[0])} 
        style={{ fontSize: 13 }}
      />
      {uploading && (
        <div style={{ fontSize: 12, color: '#2b49ee' }}>Upload... {progress || 0}%</div>
      )}
    </div>
  );
}
