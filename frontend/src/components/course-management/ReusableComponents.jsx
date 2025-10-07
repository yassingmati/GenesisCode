// src/components/course-management/ReusableComponents.jsx
import React from 'react';
import styled from 'styled-components';
import { FiSearch, FiChevronLeft, FiChevronRight, FiX, FiVideo, FiFileText, FiTrash2 } from 'react-icons/fi';

/* ===========================
   Styles réutilisables
   =========================== */
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-top: 16px;
`;

export const Card = styled.div`
  background: linear-gradient(180deg, #fff, #fbfdff);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid #f1f5ff;
  min-height: 95px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &:hover {
    box-shadow: 0 8px 30px rgba(36, 49, 88, 0.06);
    transform: translateY(-4px);
    transition: all 0.2s ease;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #112;
`;

export const CardMeta = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
`;

export const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

export const IconButton = styled.button`
  padding: 8px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ danger }) => danger ? '#fff5f6' : '#fbfdff'};
  color: ${({ danger }) => danger ? '#d23' : '#344'};
  border: 1px solid #f1f5ff;
`;

export const Tiny = styled.span`
  font-size: 0.85rem;
  color: #657;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 12px;
  background: #f1f5ff;
  color: #2b49ee;
  border: 1px solid #e6edff;
  margin-left: 6px;
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(12, 18, 34, 0.44);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
`;

export const Modal = styled.div`
  width: min(920px, calc(100% - 40px));
  max-height: 90vh;
  overflow: auto;
  border-radius: 12px;
  background: #fff;
  padding: 20px;
`;

export const ActionPrimary = styled.button`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 10px 14px;
  background: #2b49ee;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(43, 73, 238, 0.12);
  &:hover {
    transform: translateY(-1px);
  }
`;

/* ===========================
   Composants réutilisables
   =========================== */
export function SearchBar({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#fff', borderRadius: '10px', border: '1px solid #e9eef9' }}>
      <FiSearch />
      <input 
        placeholder={placeholder} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        style={{ border: 0, outline: 'none', minWidth: '220px', fontSize: '0.95rem', color: '#223', background: 'transparent' }}
      />
    </div>
  );
}

export function Pagination({ page, pages, onPrev, onNext }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button onClick={onPrev} disabled={page <= 1} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #eef2ff' }}>
        <FiChevronLeft />
      </button>
      <div style={{ fontSize: '13px' }}>
        Page <strong>{page}</strong> / {pages}
      </div>
      <button onClick={onNext} disabled={page >= pages} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #eef2ff' }}>
        <FiChevronRight />
      </button>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <Overlay role="dialog" aria-modal="true">
      <Modal style={{ width: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onCancel} aria-label="close" style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>
            <FiX />
          </button>
        </div>
        <p style={{ color: '#475569' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px' }}>
          <button onClick={onCancel} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e6edf9', background: '#fff' }}>
            Annuler
          </button>
          <button onClick={onConfirm} style={{ padding: '8px 12px', borderRadius: '8px', background: '#ef4444', color: '#fff', border: 0 }}>
            Supprimer
          </button>
        </div>
      </Modal>
    </Overlay>
  );
}

export function FormModal({ open, title, onClose, children, footer, width = 820 }) {
  if (!open) return null;
  return (
    <Overlay role="dialog" aria-modal="true">
      <Modal style={{ width: Math.min(width, 920) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} aria-label="close" style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>
            <FiX />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div style={{ marginTop: '18px' }}>{footer}</div>}
      </Modal>
    </Overlay>
  );
}

export function MediaBadge({ lang, hasMedia, onPreview, onDelete, mediaType = 'video' }) {
  const icon = mediaType === 'video' ? <FiVideo /> : <FiFileText />;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
      {hasMedia ? (
        <Badge>
          {icon} {lang.toUpperCase()}
          <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
            <button 
              title={`Prévisualiser ${lang}`} 
              onClick={() => onPreview?.(lang)} 
              style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#2b49ee' }}
            >
              {mediaType === 'video' ? <FiVideo /> : <FiFileText />}
            </button>
            <button 
              title={`Supprimer ${lang}`} 
              onClick={() => onDelete?.(lang)} 
              style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#d23' }}
            >
              <FiTrash2 />
            </button>
          </div>
        </Badge>
      ) : (
        <Tiny style={{ marginLeft: '6px', color: '#9aa' }}>{lang.toUpperCase()}</Tiny>
      )}
    </div>
  );
}

export function MediaField({ lang, file, previewUrl, onChange, uploading, progress, mediaType = 'video' }) {
  const accept = mediaType === 'video' ? 'video/*' : '.pdf';
  const icon = mediaType === 'video' ? <FiVideo /> : <FiFileText />;
  
  const inputStyle = {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #eef2ff',
    background: '#fff',
    width: '100%'
  };

  return (
    <div>
      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
        {mediaType === 'video' ? 'Vidéo' : 'PDF'} ({lang.toUpperCase()}) — optionnel
      </div>
      <input 
        type="file" 
        accept={accept} 
        onChange={e => onChange(e.target.files?.[0] || null)} 
        style={inputStyle}
      />
      {uploading ? (
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiLoader className="spin" /> Upload: {Math.round(progress || 0)}%
          </div>
          <div style={{ height: '6px', background: '#eef2ff', borderRadius: '6px', marginTop: '8px' }}>
            <div style={{ width: `${progress || 0}%`, height: '100%', background: '#2b49ee', borderRadius: '6px' }} />
          </div>
        </div>
      ) : previewUrl ? (
        <div style={{ marginTop: '8px' }}>
          {mediaType === 'video' ? (
            <video src={previewUrl} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '200px' }} />
          ) : (
            <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <FiFileText style={{ marginRight: '8px' }} />
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2b49ee' }}>
                Voir le PDF
              </a>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ===========================
   Helper functions
   =========================== */
export const pickTitle = (obj) => {
  if (!obj) return '';
  if (obj.translations) {
    return obj.translations.fr?.name || obj.translations.fr?.title || 
           obj.translations.en?.name || obj.translations.en?.title || 
           obj.translations.ar?.name || obj.translations.ar?.title || '';
  }
  return obj.name || obj.title || obj.question || '';
};

export const inputStyle = () => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eef2ff',
  background: '#fff',
  width: '100%'
});

export const selectStyle = () => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eef2ff',
  background: '#fff',
  minWidth: '140px'
});

export const textareaStyle = () => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eef2ff',
  background: '#fff',
  minHeight: '100px',
  width: '100%'
});