// src/pages/CourseManagement.jsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { getApiUrl } from '../../utils/apiConfig';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiEdit, FiTrash2, FiPlus, FiX, FiSearch, FiChevronLeft,
  FiChevronRight, FiVideo, FiLoader, FiFileText, FiEye
} from 'react-icons/fi';

/* ===========================
   Styles
   =========================== */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f8ff 0%, #f8fafc 100%);
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color: #223;
`;

const Sidebar = styled.aside`
  width: 260px;
  min-width: 220px;
  background: #fff;
  border-right: 1px solid #eceef6;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(46, 54, 77, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
`;

const NavItem = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  border: 0;
  cursor: pointer;
  background: ${({ active }) => active ? '#f0f4ff' : 'transparent'};
  color: ${({ active }) => active ? '#2b49ee' : '#394867'};
  font-weight: 600;
  &:hover {
    background: #f7f9ff;
  }
`;

const Main = styled.main`
  flex: 1;
  padding: 28px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const Search = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e9eef9;
  input {
    border: 0;
    outline: none;
    min-width: 220px;
    font-size: 0.95rem;
    color: #223;
    background: transparent;
  }
`;

const ActionPrimary = styled.button`
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

const Panel = styled.section`
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 8px 28px rgba(36, 49, 88, 0.04);
  border: 1px solid #eef1ff;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-top: 16px;
`;

const Card = styled.div`
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

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #112;
`;

const CardMeta = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const IconButton = styled.button`
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

const Tiny = styled.span`
  font-size: 0.85rem;
  color: #657;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
`;

const Badge = styled.span`
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

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(12, 18, 34, 0.44);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
`;

const Modal = styled.div`
  width: min(920px, calc(100% - 40px));
  max-height: 90vh;
  overflow: auto;
  border-radius: 12px;
  background: #fff;
  padding: 20px;
`;

/* ===========================
   API client
   =========================== */
const api = axios.create({
  baseURL: getApiUrl('/api/courses'),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ===========================
   Helper functions
   =========================== */
const pickTitle = (obj) => {
  if (!obj) return '';
  if (obj.translations) {
    return obj.translations.fr?.name || obj.translations.fr?.title || 
           obj.translations.en?.name || obj.translations.en?.title || 
           obj.translations.ar?.name || obj.translations.ar?.title || '';
  }
  return obj.name || obj.title || obj.question || '';
};

const inputStyle = () => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eef2ff',
  background: '#fff',
  width: '100%'
});

const selectStyle = () => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eef2ff',
  background: '#fff',
  minWidth: '140px'
});

const textareaStyle = () => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eef2ff',
  background: '#fff',
  minHeight: '100px',
  width: '100%'
});

/* ===========================
   Reusable components
   =========================== */
function SearchBar({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <Search style={{ padding: '8px 12px' }}>
      <FiSearch />
      <input 
        placeholder={placeholder} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </Search>
  );
}

function Pagination({ page, pages, onPrev, onNext }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button onClick={onPrev} disabled={page <= 1} style={{ padding: '8px', borderRadius: '8px' }}>
        <FiChevronLeft />
      </button>
      <div style={{ fontSize: '13px' }}>
        Page <strong>{page}</strong> / {pages}
      </div>
      <button onClick={onNext} disabled={page >= pages} style={{ padding: '8px', borderRadius: '8px' }}>
        <FiChevronRight />
      </button>
    </div>
  );
}

function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
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

function FormModal({ open, title, onClose, children, footer, width = 820 }) {
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

function MediaBadge({ lang, hasMedia, onPreview, onDelete, mediaType = 'video' }) {
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
              <FiEye size={14} />
            </button>
            <button 
              title={`Supprimer ${lang}`} 
              onClick={() => onDelete?.(lang)} 
              style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#d23' }}
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </Badge>
      ) : (
        <Tiny style={{ marginLeft: '6px', color: '#9aa' }}>{lang.toUpperCase()}</Tiny>
      )}
    </div>
  );
}

function MediaField({ lang, file, previewUrl, onChange, uploading, progress, mediaType = 'video' }) {
  const accept = mediaType === 'video' ? 'video/*' : '.pdf';
  const icon = mediaType === 'video' ? <FiVideo /> : <FiFileText />;
  
  return (
    <div>
      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
        {mediaType === 'video' ? 'Vidéo' : 'PDF'} ({lang.toUpperCase()}) — optionnel
      </div>
      <input 
        type="file" 
        accept={accept} 
        onChange={e => onChange(e.target.files?.[0] || null)} 
        style={{ width: '100%', padding: '8px' }}
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
   Main Course Management Component
   =========================== */
export default function CourseManagement() {
  const [activePanel, setActivePanel] = useState('categories');
  
  const categoriesCreateRef = useRef(null);
  const pathsCreateRef = useRef(null);
  const levelsCreateRef = useRef(null);
  const exercisesCreateRef = useRef(null);

  const openCreateFor = (panel) => {
    switch (panel) {
      case 'categories': categoriesCreateRef.current?.(); break;
      case 'paths': pathsCreateRef.current?.(); break;
      case 'levels': levelsCreateRef.current?.(); break;
      case 'exercises': exercisesCreateRef.current?.(); break;
    }
  };

  return (
    <Page>
      <Sidebar>
        <Brand>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 8, 
            background: 'linear-gradient(135deg, #2b49ee, #6f8bff)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff', 
            fontWeight: 800 
          }}>
            CG
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Course Admin</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#667' }}>Gestion des parcours & contenu</p>
          </div>
        </Brand>

        <NavList aria-label="Sections">
          <NavItem active={activePanel === 'categories'} onClick={() => setActivePanel('categories')}>
            Catégories
          </NavItem>
          <NavItem active={activePanel === 'paths'} onClick={() => setActivePanel('paths')}>
            Parcours
          </NavItem>
          <NavItem active={activePanel === 'levels'} onClick={() => setActivePanel('levels')}>
            Niveaux
          </NavItem>
          <NavItem active={activePanel === 'exercises'} onClick={() => setActivePanel('exercises')}>
            Exercices
          </NavItem>
        </NavList>

        <div style={{ marginTop: 'auto', fontSize: 13, color: '#6b7280' }}>
          <Tiny>Astuce:</Tiny>
          <p style={{ margin: 6 }}>
            Utilise la recherche et les filtres pour trouver rapidement un élément. 
            Les edits s'ouvrent dans des modales.
          </p>
        </div>
      </Sidebar>

      <Main>
        <TopBar>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>
              {activePanel === 'categories' ? 'Catégories' : 
               activePanel === 'paths' ? 'Parcours' : 
               activePanel === 'levels' ? 'Niveaux' : 'Exercices'}
            </h2>
            <Tiny>Gérer le contenu de la plateforme</Tiny>
          </div>

          <Controls>
            <Search role="search">
              <FiSearch />
              <input placeholder="Rechercher par titre, question ou ID..." readOnly />
            </Search>

            <ActionPrimary onClick={() => openCreateFor(activePanel)}>
              <FiPlus /> Nouveau
            </ActionPrimary>
          </Controls>
        </TopBar>

        <Panel>
          {activePanel === 'categories' && (
            <CategoriesPanel onOpenCreate={fn => categoriesCreateRef.current = fn} />
          )}
          {activePanel === 'paths' && (
            <PathsPanel onOpenCreate={fn => pathsCreateRef.current = fn} />
          )}
          {activePanel === 'levels' && (
            <LevelsPanel onOpenCreate={fn => levelsCreateRef.current = fn} />
          )}
          {activePanel === 'exercises' && (
            <ExercisesPanel onOpenCreate={fn => exercisesCreateRef.current = fn} />
          )}
        </Panel>
      </Main>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </Page>
  );
}

/* ===========================
   Panel Components
   =========================== */

function CategoriesPanel({ onOpenCreate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ fr: '', en: '', ar: '', order: 0, type: 'classic' });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (onOpenCreate) {
      onOpenCreate(() => {
        setEditing(null);
        setForm({ fr: '', en: '', ar: '', order: 0, type: 'classic' });
        setModalOpen(true);
      });
    }
  }, [onOpenCreate]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Fetch both classic and specific categories to ensure admin sees all
      const [classicRes, specificRes] = await Promise.all([
        api.get('/categories?type=classic'),
        api.get('/categories?type=specific')
      ]);
      const classic = Array.isArray(classicRes?.data) ? classicRes.data : [];
      const specific = Array.isArray(specificRes?.data) ? specificRes.data : [];
      setCategories([...classic, ...specific]);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    let filtered = categories.filter(cat => {
      const name = pickTitle(cat).toLowerCase();
      return !q || name.includes(q) || String(cat._id).includes(q);
    });

    if (filterType) {
      filtered = filtered.filter(cat => cat.type === filterType);
    }

    return filtered;
  }, [categories, query, filterType]);

  const pages = Math.max(1, Math.ceil(filteredCategories.length / perPage));
  const pagedCategories = filteredCategories.slice((page - 1) * perPage, page * perPage);

  const handleSubmit = async () => {
    if (!form.fr?.trim() || !form.en?.trim() || !form.ar?.trim()) {
      toast.error('Remplis tous les noms (FR/EN/AR)');
      return;
    }

    try {
      const payload = {
        translations: {
          fr: { name: form.fr },
          en: { name: form.en },
          ar: { name: form.ar }
        },
        order: form.order,
        type: form.type
      };

      if (editing) {
        await api.put(`/categories/${editing._id}`, payload);
        toast.success('Catégorie mise à jour');
      } else {
        await api.post('/categories', payload);
        toast.success('Catégorie créée');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || 'Erreur sauvegarde');
    }
  };

  const startEdit = (category) => {
    setEditing(category);
    setForm({
      fr: category.translations?.fr?.name || '',
      en: category.translations?.en?.name || '',
      ar: category.translations?.ar?.name || '',
      order: category.order || 0,
      type: category.type || 'classic'
    });
    setModalOpen(true);
  };

  const askDelete = (id) => setConfirm({ open: true, id });
  const confirmDelete = async () => {
    try {
      await api.delete(`/categories/${confirm.id}`);
      toast.success('Catégorie supprimée');
      setConfirm({ open: false, id: null });
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error('Impossible de supprimer');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <SearchBar 
            value={query} 
            onChange={v => { setQuery(v); setPage(1); }} 
            placeholder="Rechercher catégories..." 
          />
          <select 
            value={filterType} 
            onChange={e => { setFilterType(e.target.value); setPage(1); }} 
            style={selectStyle()}
          >
            <option value="">Tous les types</option>
            <option value="classic">Classique</option>
            <option value="specific">Spécifique</option>
          </select>
        </div>
        <ActionPrimary onClick={() => setModalOpen(true)}>
          <FiPlus /> Nouvelle catégorie
        </ActionPrimary>
      </div>

      <div style={{ marginTop: '14px' }}>
        {loading ? (
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <div style={{ height: '18px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ height: '10px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '4px', width: '60%' }} />
              </Card>
            ))}
          </Grid>
        ) : pagedCategories.length ? (
          <>
            <Grid>
              {pagedCategories.map(cat => (
                <Card key={cat._id}>
                  <CardHeader>
                    <div>
                      <CardTitle>{pickTitle(cat) || 'Sans nom'}</CardTitle>
                      <CardMeta>
                        Ordre: {cat.order || 0}
                        <Badge style={{ 
                          background: cat.type === 'specific' ? '#f0fdf4' : '#f1f5ff',
                          color: cat.type === 'specific' ? '#047857' : '#2b49ee',
                          border: cat.type === 'specific' ? '1px solid #10b981' : '1px solid #e6edff'
                        }}>
                          {cat.type === 'specific' ? 'Spécifique' : 'Classique'}
                        </Badge>
                      </CardMeta>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Tiny>ID</Tiny>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {String(cat._id).slice(0, 8)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardActions>
                    <IconButton onClick={() => startEdit(cat)}>
                      <FiEdit />
                    </IconButton>
                    <IconButton danger onClick={() => askDelete(cat._id)}>
                      <FiTrash2 />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Grid>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tiny>
                Affichage {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredCategories.length)} / {filteredCategories.length}
              </Tiny>
              <Pagination 
                page={page} 
                pages={pages} 
                onPrev={() => setPage(p => Math.max(1, p - 1))} 
                onNext={() => setPage(p => Math.min(pages, p + 1))} 
              />
            </div>
          </>
        ) : (
          <EmptyState>
            <h3>Aucune catégorie</h3>
            <p>Crée la première catégorie pour démarrer.</p>
            <ActionPrimary onClick={() => setModalOpen(true)}>
              <FiPlus /> Nouvelle catégorie
            </ActionPrimary>
          </EmptyState>
        )}
      </div>

      <FormModal 
        open={modalOpen} 
        title={editing ? 'Éditer catégorie' : 'Nouvelle catégorie'} 
        onClose={() => setModalOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={() => setModalOpen(false)} style={{ padding: '8px 12px', borderRadius: '8px', background: '#fff', border: '1px solid #eef2ff' }}>
              Annuler
            </button>
            <ActionPrimary onClick={handleSubmit}>
              <FiPlus /> {editing ? 'Sauvegarder' : 'Créer'}
            </ActionPrimary>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Nom (Français)</div>
            <input 
              value={form.fr} 
              onChange={e => setForm(f => ({ ...f, fr: e.target.value }))} 
              required 
              style={inputStyle()} 
            />
          </label>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Nom (Anglais)</div>
            <input 
              value={form.en} 
              onChange={e => setForm(f => ({ ...f, en: e.target.value }))} 
              required 
              style={inputStyle()} 
            />
          </label>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Nom (Arabe)</div>
            <input 
              value={form.ar} 
              onChange={e => setForm(f => ({ ...f, ar: e.target.value }))} 
              required 
              style={inputStyle()} 
            />
          </label>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Ordre</div>
            <input 
              type="number" 
              value={form.order} 
              onChange={e => setForm(f => ({ ...f, order: +e.target.value }))} 
              style={inputStyle()} 
            />
          </label>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Type</div>
            <select 
              value={form.type} 
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))} 
              style={selectStyle()}
            >
              <option value="classic">Classique</option>
              <option value="specific">Spécifique</option>
            </select>
          </label>
        </div>
      </FormModal>

      <ConfirmDialog 
        open={confirm.open} 
        title="Confirmer suppression" 
        message="La suppression est définitive et supprimera tout le contenu lié. Continuer ?"
        onCancel={() => setConfirm({ open: false, id: null })} 
        onConfirm={confirmDelete} 
      />
    </>
  );
}

function PathsPanel({ onOpenCreate }) {
  const [paths, setPaths] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    category: '', 
    fr_name: '', en_name: '', ar_name: '', 
    fr_description: '', en_description: '', ar_description: '', 
    order: 0 
  });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    fetchPaths();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (onOpenCreate) {
      onOpenCreate(() => {
        setEditing(null);
        setForm({ 
          category: '', 
          fr_name: '', en_name: '', ar_name: '', 
          fr_description: '', en_description: '', ar_description: '', 
          order: 0 
        });
        setModalOpen(true);
      });
    }
  }, [onOpenCreate]);

  const fetchPaths = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/paths');
      setPaths(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les parcours');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch both classic and specific categories for path assignment
      const [classicRes, specificRes] = await Promise.all([
        api.get('/categories?type=classic'),
        api.get('/categories?type=specific')
      ]);
      const classic = Array.isArray(classicRes?.data) ? classicRes.data : [];
      const specific = Array.isArray(specificRes?.data) ? specificRes.data : [];
      setCategories([...classic, ...specific]);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPaths = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    let filtered = paths.filter(path => {
      const name = pickTitle(path).toLowerCase();
      return !q || name.includes(q) || String(path._id).includes(q);
    });

    if (filterCategory) {
      filtered = filtered.filter(path => 
        String(path.category?._id || path.category) === String(filterCategory)
      );
    }

    return filtered;
  }, [paths, query, filterCategory]);

  const pages = Math.max(1, Math.ceil(filteredPaths.length / perPage));
  const pagedPaths = filteredPaths.slice((page - 1) * perPage, page * perPage);

  const handleSubmit = async () => {
    if (!form.category) {
      toast.error('Choisir une catégorie');
      return;
    }
    if (!form.fr_name?.trim()) {
      toast.error('Nom FR requis');
      return;
    }

    try {
      const payload = {
        category: form.category,
        translations: {
          fr: { name: form.fr_name, description: form.fr_description },
          en: { name: form.en_name, description: form.en_description },
          ar: { name: form.ar_name, description: form.ar_description }
        },
        order: form.order
      };

      if (editing) {
        await api.put(`/paths/${editing._id}`, payload);
        toast.success('Parcours mis à jour');
      } else {
        await api.post('/paths', payload);
        toast.success('Parcours créé');
      }
      setModalOpen(false);
      fetchPaths();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || 'Erreur sauvegarde');
    }
  };

  const startEdit = (path) => {
    setEditing(path);
    setForm({
      category: path.category?._id || path.category || '',
      fr_name: path.translations?.fr?.name || '',
      en_name: path.translations?.en?.name || '',
      ar_name: path.translations?.ar?.name || '',
      fr_description: path.translations?.fr?.description || '',
      en_description: path.translations?.en?.description || '',
      ar_description: path.translations?.ar?.description || '',
      order: path.order || 0
    });
    setModalOpen(true);
  };

  const askDelete = (id) => setConfirm({ open: true, id });
  const confirmDelete = async () => {
    try {
      await api.delete(`/paths/${confirm.id}`);
      toast.success('Parcours supprimé');
      setConfirm({ open: false, id: null });
      fetchPaths();
    } catch (err) {
      console.error(err);
      toast.error('Impossible de supprimer');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <SearchBar 
            value={query} 
            onChange={v => { setQuery(v); setPage(1); }} 
            placeholder="Rechercher parcours..." 
          />
          <select 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)} 
            style={selectStyle()}
          >
            <option value="">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {pickTitle(cat)}
              </option>
            ))}
          </select>
        </div>
        <ActionPrimary onClick={() => setModalOpen(true)}>
          <FiPlus /> Nouveau parcours
        </ActionPrimary>
      </div>

      <div style={{ marginTop: '16px' }}>
        {loading ? (
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <div style={{ height: '18px', background: '#f3f4f6', borderRadius: '4px' }} />
              </Card>
            ))}
          </Grid>
        ) : pagedPaths.length ? (
          <>
            <Grid>
              {pagedPaths.map(path => (
                <Card key={path._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <CardTitle>{pickTitle(path) || 'Sans nom'}</CardTitle>
                      <CardMeta>
                        {(path.translations?.fr?.description || '').substring(0, 70)}
                      </CardMeta>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Tiny>
                        {path.category?.translations?.fr?.name || path.category?._id || ''}
                      </Tiny>
                    </div>
                  </div>
                  <CardActions>
                    <IconButton onClick={() => startEdit(path)}>
                      <FiEdit />
                    </IconButton>
                    <IconButton danger onClick={() => askDelete(path._id)}>
                      <FiTrash2 />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Grid>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tiny>
                Affichage {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredPaths.length)} / {filteredPaths.length}
              </Tiny>
              <Pagination 
                page={page} 
                pages={pages} 
                onPrev={() => setPage(p => Math.max(1, p - 1))} 
                onNext={() => setPage(p => Math.min(pages, p + 1))} 
              />
            </div>
          </>
        ) : (
          <EmptyState>
            <h3>Aucun parcours</h3>
            <p>Crée ton premier parcours.</p>
            <ActionPrimary onClick={() => setModalOpen(true)}>
              <FiPlus /> Nouveau parcours
            </ActionPrimary>
          </EmptyState>
        )}
      </div>

      <FormModal 
        open={modalOpen} 
        title={editing ? 'Éditer parcours' : 'Nouveau parcours'} 
        onClose={() => setModalOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={() => setModalOpen(false)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #eef2ff' }}>
              Annuler
            </button>
            <ActionPrimary onClick={handleSubmit}>
              <FiPlus /> Sauvegarder
            </ActionPrimary>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Catégorie</div>
            <select 
              value={form.category} 
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))} 
              style={selectStyle()}
            >
              <option value="">Sélectionner</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {pickTitle(cat)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Ordre</div>
            <input 
              type="number" 
              value={form.order} 
              onChange={e => setForm(f => ({ ...f, order: +e.target.value }))} 
              style={inputStyle()} 
            />
          </label>

          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Nom (Français)</div>
            <input 
              value={form.fr_name} 
              onChange={e => setForm(f => ({ ...f, fr_name: e.target.value }))} 
              style={inputStyle()} 
            />
          </label>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Nom (Anglais)</div>
            <input 
              value={form.en_name} 
              onChange={e => setForm(f => ({ ...f, en_name: e.target.value }))} 
              style={inputStyle()} 
            />
          </label>

          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Nom (Arabe)</div>
            <input 
              value={form.ar_name} 
              onChange={e => setForm(f => ({ ...f, ar_name: e.target.value }))} 
              style={inputStyle()} 
            />
          </label>

          <label style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Description (Français)</div>
            <textarea 
              value={form.fr_description} 
              onChange={e => setForm(f => ({ ...f, fr_description: e.target.value }))} 
              style={textareaStyle()} 
            />
          </label>
        </div>
      </FormModal>

      <ConfirmDialog 
        open={confirm.open} 
        title="Supprimer parcours" 
        message="Voulez-vous vraiment supprimer ce parcours et son contenu ?"
        onCancel={() => setConfirm({ open: false, id: null })} 
        onConfirm={confirmDelete} 
      />
    </>
  );
}

function LevelsPanel({ onOpenCreate }) {
  const [paths, setPaths] = useState([]);
  const [levels, setLevels] = useState([]);
   const [selectedLevel, setSelectedLevel] = useState(''); // Add this line
  const [exercises, setExercises] = useState([]); // Add this line
  const [loading, setLoading] = useState(false);

  const [selectedPath, setSelectedPath] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    path: '',
    fr_title: '', en_title: '', ar_title: '',
    fr_content: '', en_content: '', ar_content: '',
    order: 1,
    videoFiles: { fr: null, en: null, ar: null },
    pdfFiles: { fr: null, en: null, ar: null }
  });

  const [videoPreviews, setVideoPreviews] = useState({ fr: null, en: null, ar: null });
  const [pdfPreviews, setPdfPreviews] = useState({ fr: null, en: null, ar: null });
  const [uploading, setUploading] = useState({ videos: {}, pdfs: {} });
  const [progress, setProgress] = useState({ videos: {}, pdfs: {} });

  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [deleteMediaConfirm, setDeleteMediaConfirm] = useState({ 
    open: false, levelId: null, lang: null, mediaType: null 
  });

  const API_BASE_URL = getApiUrl('');

  useEffect(() => {
    fetchPaths();
  }, []);

  useEffect(() => {
    if (onOpenCreate) {
      onOpenCreate(() => openCreate());
    }
  }, [onOpenCreate, selectedPath, levels]);

  useEffect(() => {
    if (selectedPath) {
      fetchLevels(selectedPath);
    } else {
      setLevels([]);
      setSelectedLevel('');
      setExercises([]);
    }
  }, [selectedPath]);

  const fetchPaths = async () => {
    try {
      const { data } = await api.get('/paths');
      setPaths(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLevels = async (pathId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/paths/${pathId}/levels`);
      setLevels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les niveaux');
    } finally {
      setLoading(false);
    }
  };

  const filteredLevels = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    return levels.filter(level => {
      const title = pickTitle(level).toLowerCase();
      return !q || title.includes(q) || String(level._id).includes(q);
    });
  }, [levels, query]);

  const pages = Math.max(1, Math.ceil(filteredLevels.length / perPage));
  const pagedLevels = filteredLevels.slice((page - 1) * perPage, page * perPage);

  const setMediaFile = (mediaType, lang, file) => {
    const mediaKey = mediaType === 'video' ? 'videoFiles' : 'pdfFiles';
    const previewKey = mediaType === 'video' ? 'videoPreviews' : 'pdfPreviews';
    
    setForm(prev => ({ 
      ...prev, 
      [mediaKey]: { ...prev[mediaKey], [lang]: file } 
    }));

    if (file) {
      const url = URL.createObjectURL(file);
      if (mediaType === 'video') {
        setVideoPreviews(prev => ({ ...prev, [lang]: url }));
      } else {
        setPdfPreviews(prev => ({ ...prev, [lang]: url }));
      }
    } else {
      if (mediaType === 'video') {
        setVideoPreviews(prev => ({ ...prev, [lang]: null }));
      } else {
        setPdfPreviews(prev => ({ ...prev, [lang]: null }));
      }
    }
  };

  useEffect(() => {
    return () => {
      Object.values(videoPreviews).forEach(url => url && URL.revokeObjectURL(url));
      Object.values(pdfPreviews).forEach(url => url && URL.revokeObjectURL(url));
    };
  }, [videoPreviews, pdfPreviews]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      path: selectedPath || '',
      fr_title: '', en_title: '', ar_title: '',
      fr_content: '', en_content: '', ar_content: '',
      order: levels.length + 1 || 1,
      videoFiles: { fr: null, en: null, ar: null },
      pdfFiles: { fr: null, en: null, ar: null }
    });
    setVideoPreviews({ fr: null, en: null, ar: null });
    setPdfPreviews({ fr: null, en: null, ar: null });
    setModalOpen(true);
  };

  const uploadMedia = async (levelId, lang, file, mediaType) => {
    const endpoint = mediaType === 'video' ? 'video' : 'pdf';
    const url = getApiUrl(`/api/courses/levels/${levelId}/${endpoint}`);

    setUploading(prev => ({
      ...prev,
      [mediaType + 's']: { ...prev[mediaType + 's'], [lang]: true }
    }));
    
    setProgress(prev => ({
      ...prev,
      [mediaType + 's']: { ...prev[mediaType + 's'], [lang]: 0 }
    }));

    const formData = new FormData();
    formData.append(mediaType, file);
    formData.append('lang', lang);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        onUploadProgress: (evt) => {
          const percent = evt.total ? Math.round((evt.loaded * 100) / evt.total) : 0;
          setProgress(prev => ({
            ...prev,
            [mediaType + 's']: { ...prev[mediaType + 's'], [lang]: percent }
          }));
        }
      });
      toast.success(`${mediaType === 'video' ? 'Vidéo' : 'PDF'} ${lang.toUpperCase()} uploadé(e)`);
      return response;
    } catch (err) {
      console.error(err);
      toast.error(`Échec upload ${mediaType} ${lang.toUpperCase()}`);
      throw err;
    } finally {
      setUploading(prev => ({
        ...prev,
        [mediaType + 's']: { ...prev[mediaType + 's'], [lang]: false }
      }));
    }
  };

  const handleSubmit = async () => {
    if (!form.path) {
      toast.error('Sélectionner un parcours');
      return;
    }
    if (!form.fr_title?.trim()) {
      toast.error('Titre FR requis');
      return;
    }

    const payload = {
      path: form.path,
      translations: {
        fr: { title: form.fr_title, content: form.fr_content },
        en: { title: form.en_title, content: form.en_content },
        ar: { title: form.ar_title, content: form.ar_content }
      },
      order: form.order
    };

    try {
      let levelId = editing?._id;
      
      if (editing) {
        await api.put(`/levels/${editing._id}`, payload);
        toast.success('Niveau mis à jour');
      } else {
        const { data } = await api.post('/levels', payload);
        levelId = data?._id;
        toast.success('Niveau créé');
      }

      const uploadPromises = [];
      for (const lang of ['fr', 'en', 'ar']) {
        const videoFile = form.videoFiles?.[lang];
        const pdfFile = form.pdfFiles?.[lang];

        if (videoFile) {
          uploadPromises.push(uploadMedia(levelId, lang, videoFile, 'video'));
        }
        if (pdfFile) {
          uploadPromises.push(uploadMedia(levelId, lang, pdfFile, 'pdf'));
        }
      }

      await Promise.all(uploadPromises);

      setModalOpen(false);
      fetchLevels(form.path);
    } catch (err) {
      console.error(err);
      toast.error('Erreur sauvegarde');
    } finally {
      setUploading({ videos: {}, pdfs: {} });
      setProgress({ videos: {}, pdfs: {} });
    }
  };

  const startEdit = async (level) => {
    try {
      const { data } = await api.get(`/levels/${level._id}`);
      const fullLevel = data || level;
      
      setEditing(fullLevel);
      setForm({
        path: fullLevel.path || form.path,
        fr_title: fullLevel.translations?.fr?.title || '',
        en_title: fullLevel.translations?.en?.title || '',
        ar_title: fullLevel.translations?.ar?.title || '',
        fr_content: fullLevel.translations?.fr?.content || '',
        en_content: fullLevel.translations?.en?.content || '',
        ar_content: fullLevel.translations?.ar?.content || '',
        order: fullLevel.order || 1,
        videoFiles: { fr: null, en: null, ar: null },
        pdfFiles: { fr: null, en: null, ar: null }
      });

      const newVideoPreviews = {};
      const newPdfPreviews = {};
      
      for (const lang of ['fr', 'en', 'ar']) {
        if (fullLevel.videos?.[lang]) {
          newVideoPreviews[lang] = `${API_BASE_URL}${fullLevel.videos[lang]}`;
        }
        if (fullLevel.pdfs?.[lang]) {
          newPdfPreviews[lang] = `${API_BASE_URL}${fullLevel.pdfs[lang]}`;
        }
      }
      
      setVideoPreviews(newVideoPreviews);
      setPdfPreviews(newPdfPreviews);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de récupérer le niveau');
    }
  };

  const askDelete = (id) => setConfirm({ open: true, id });
  const confirmDelete = async () => {
    try {
      await api.delete(`/levels/${confirm.id}`);
      toast.success('Niveau supprimé');
      setConfirm({ open: false, id: null });
      fetchLevels(selectedPath);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de supprimer');
    }
  };

  const askDeleteMedia = (levelId, lang, mediaType) => {
    setDeleteMediaConfirm({ open: true, levelId, lang, mediaType });
  };

  const confirmDeleteMedia = async () => {
    const { levelId, lang, mediaType } = deleteMediaConfirm;
    if (!levelId || !lang || !mediaType) return;
    
    try {
      const endpoint = mediaType === 'video' ? 'video' : 'pdf';
      const token = localStorage.getItem('adminToken');

      await axios.delete(getApiUrl(`/api/courses/levels/${levelId}/${endpoint}?lang=${encodeURIComponent(lang)}`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      toast.success(`${mediaType === 'video' ? 'Vidéo' : 'PDF'} ${lang.toUpperCase()} supprimé(e)`);
      fetchLevels(selectedPath);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de supprimer le média');
    } finally {
      setDeleteMediaConfirm({ open: false, levelId: null, lang: null, mediaType: null });
    }
  };

  const previewMediaUrl = (levelId, lang, mediaType) => {
    const endpoint = mediaType === 'video' ? 'video' : 'pdf';
    const token = localStorage.getItem('adminToken');
    const url = new URL(getApiUrl(`/api/courses/levels/${levelId}/${endpoint}`));
    url.searchParams.set('lang', lang);
    if (token) url.searchParams.set('token', token);
    return url.toString();
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={selectedPath} 
            onChange={e => { setSelectedPath(e.target.value); setPage(1); }} 
            style={selectStyle()}
          >
            <option value="">Choisir un parcours</option>
            {paths.map(path => (
              <option key={path._id} value={path._id}>
                {pickTitle(path)}
              </option>
            ))}
          </select>
          <SearchBar 
            value={query} 
            onChange={v => { setQuery(v); setPage(1); }} 
            placeholder="Rechercher niveaux..." 
          />
        </div>
        <ActionPrimary onClick={() => openCreate()}>
          <FiPlus /> Nouveau niveau
        </ActionPrimary>
      </div>

      <div style={{ marginTop: '16px' }}>
        {loading ? (
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <div style={{ height: '18px', background: '#f3f4f6', borderRadius: '4px' }} />
              </Card>
            ))}
          </Grid>
        ) : pagedLevels.length ? (
          <>
            <Grid>
              {pagedLevels.map(level => (
                <Card key={level._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <CardTitle>{pickTitle(level) || `Niveau ${level.order}`}</CardTitle>
                      <CardMeta>
                        {(level.translations?.fr?.content || '').substring(0, 80)}
                      </CardMeta>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Tiny>Ordre {level.order}</Tiny>
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {['fr', 'en', 'ar'].map(lang => (
                          <React.Fragment key={lang}>
                            {level.videos?.[lang] && (
                              <MediaBadge 
                                lang={lang}
                                hasMedia={true}
                                onPreview={() => window.open(previewMediaUrl(level._id, lang, 'video'), '_blank')}
                                onDelete={() => askDeleteMedia(level._id, lang, 'video')}
                                mediaType="video"
                              />
                            )}
                            {level.pdfs?.[lang] && (
                              <MediaBadge 
                                lang={lang}
                                hasMedia={true}
                                onPreview={() => window.open(previewMediaUrl(level._id, lang, 'pdf'), '_blank')}
                                onDelete={() => askDeleteMedia(level._id, lang, 'pdf')}
                                mediaType="pdf"
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  <CardActions>
                    <IconButton onClick={() => startEdit(level)}>
                      <FiEdit />
                    </IconButton>
                    <IconButton danger onClick={() => askDelete(level._id)}>
                      <FiTrash2 />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Grid>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tiny>
                Affichage {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredLevels.length)} / {filteredLevels.length}
              </Tiny>
              <Pagination 
                page={page} 
                pages={pages} 
                onPrev={() => setPage(p => Math.max(1, p - 1))} 
                onNext={() => setPage(p => Math.min(pages, p + 1))} 
              />
            </div>
          </>
        ) : (
          <EmptyState>
            <h3>Aucun niveau</h3>
            <p>Sélectionne un parcours pour afficher ses niveaux.</p>
            <ActionPrimary onClick={() => openCreate()}>
              <FiPlus /> Créer un niveau
            </ActionPrimary>
          </EmptyState>
        )}
      </div>

      <FormModal 
        open={modalOpen} 
        title={editing ? 'Éditer niveau' : 'Nouveau niveau'} 
        onClose={() => setModalOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={() => setModalOpen(false)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #eef2ff' }}>
              Annuler
            </button>
            <ActionPrimary onClick={handleSubmit}>
              <FiPlus /> Sauvegarder
            </ActionPrimary>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Parcours</div>
            <select 
              value={form.path} 
              onChange={e => setForm(f => ({ ...f, path: e.target.value }))} 
              style={selectStyle()}
            >
              <option value="">Sélectionner</option>
              {paths.map(path => (
                <option key={path._id} value={path._id}>
                  {pickTitle(path)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Ordre</div>
            <input 
              type="number" 
              value={form.order} 
              onChange={e => setForm(f => ({ ...f, order: +e.target.value }))} 
              style={inputStyle()} 
            />
          </label>

          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Titre (Français)</div>
            <input 
              value={form.fr_title} 
              onChange={e => setForm(f => ({ ...f, fr_title: e.target.value }))} 
              style={inputStyle()} 
            />
          </label>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Titre (Anglais)</div>
            <input 
              value={form.en_title} 
              onChange={e => setForm(f => ({ ...f, en_title: e.target.value }))} 
              style={inputStyle()} 
            />
          </label>

          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Titre (Arabe)</div>
            <input 
              value={form.ar_title} 
              onChange={e => setForm(f => ({ ...f, ar_title: e.target.value }))} 
              style={inputStyle()} 
            />
          </label>

          <label style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Contenu (Français)</div>
            <textarea 
              value={form.fr_content} 
              onChange={e => setForm(f => ({ ...f, fr_content: e.target.value }))} 
              style={textareaStyle()} 
            />
          </label>

          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Contenu (Anglais)</div>
            <textarea 
              value={form.en_content} 
              onChange={e => setForm(f => ({ ...f, en_content: e.target.value }))} 
              style={textareaStyle()} 
            />
          </label>

          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Contenu (Arabe)</div>
            <textarea 
              value={form.ar_content} 
              onChange={e => setForm(f => ({ ...f, ar_content: e.target.value }))} 
              style={textareaStyle()} 
            />
          </label>

          <div style={{ gridColumn: '1 / -1' }}>
            <h4 style={{ margin: '16px 0 8px 0' }}>Vidéos</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {['fr', 'en', 'ar'].map(lang => (
                <MediaField
                  key={`video-${lang}`}
                  lang={lang}
                  file={form.videoFiles?.[lang]}
                  previewUrl={videoPreviews[lang]}
                  onChange={(file) => setMediaFile('video', lang, file)}
                  uploading={uploading.videos[lang]}
                  progress={progress.videos[lang]}
                  mediaType="video"
                />
              ))}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <h4 style={{ margin: '16px 0 8px 0' }}>PDFs</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {['fr', 'en', 'ar'].map(lang => (
                <MediaField
                  key={`pdf-${lang}`}
                  lang={lang}
                  file={form.pdfFiles?.[lang]}
                  previewUrl={pdfPreviews[lang]}
                  onChange={(file) => setMediaFile('pdf', lang, file)}
                  uploading={uploading.pdfs[lang]}
                  progress={progress.pdfs[lang]}
                  mediaType="pdf"
                />
              ))}
            </div>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog 
        open={confirm.open} 
        title="Supprimer niveau" 
        message="Voulez-vous supprimer ce niveau ?"
        onCancel={() => setConfirm({ open: false, id: null })} 
        onConfirm={confirmDelete} 
      />
      
      <ConfirmDialog 
        open={deleteMediaConfirm.open} 
        title={`Supprimer ${deleteMediaConfirm.mediaType === 'video' ? 'la vidéo' : 'le PDF'}`}
        message={`Confirmez-vous la suppression du ${deleteMediaConfirm.mediaType} ${deleteMediaConfirm.lang?.toUpperCase()} ?`}
        onCancel={() => setDeleteMediaConfirm({ open: false, levelId: null, lang: null, mediaType: null })} 
        onConfirm={confirmDeleteMedia} 
      />
    </>
  );
}

function ExercisesPanel({ onOpenCreate }) {
  const [paths, setPaths] = useState([]);
  const [levels, setLevels] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    level: '',
    type: 'QCM',
    fr_question: '', en_question: '', ar_question: '',
    fr_explanation: '', en_explanation: '', ar_explanation: '',
    options: ['', ''],
    solutions: [],
    elements: [],
    targets: [],
    testCases: [],
    blocks: [],
    codeSnippet: '',
    prompts: [],
    matches: []
  });

  const [confirm, setConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    fetchPaths();
  }, []);

  useEffect(() => {
    if (onOpenCreate) {
      onOpenCreate(() => openCreate());
    }
  }, [onOpenCreate, selectedLevel]);

  useEffect(() => {
    if (selectedPath) {
      fetchLevels(selectedPath);
    } else {
      setLevels([]);
      setSelectedLevel('');
      setExercises([]);
    }
  }, [selectedPath]);

  useEffect(() => {
    if (selectedLevel) {
      fetchExercises(selectedLevel);
    } else {
      setExercises([]);
    }
  }, [selectedLevel]);

  const fetchPaths = async () => {
    try {
      const { data } = await api.get('/paths');
      setPaths(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLevels = async (pathId) => {
    try {
      const { data } = await api.get(`/paths/${pathId}/levels`);
      setLevels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les niveaux');
    }
  };

  const fetchExercises = async (levelId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/levels/${levelId}/exercises`);
      setExercises(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les exercices');
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    return exercises.filter(exercise => {
      const question = pickTitle(exercise).toLowerCase();
      return !q || question.includes(q) || String(exercise._id).includes(q);
    });
  }, [exercises, query]);

  const pages = Math.max(1, Math.ceil(filteredExercises.length / perPage));
  const pagedExercises = filteredExercises.slice((page - 1) * perPage, page * perPage);

  const resetFormForType = (type) => {
    const baseForm = {
      level: selectedLevel || '',
      type: type,
      fr_question: '', en_question: '', ar_question: '',
      fr_explanation: '', en_explanation: '', ar_explanation: '',
      solutions: []
    };

    switch (type) {
      case 'QCM':
        return { ...baseForm, options: ['', ''] };
      case 'DragDrop':
        return { ...baseForm, elements: [], targets: [] };
      case 'Code':
        return { ...baseForm, testCases: [] };
      case 'TextInput':
        return { ...baseForm };
      case 'OrderBlocks':
        return { ...baseForm, blocks: [] };
      case 'FillInTheBlank':
      case 'SpotTheError':
        return { ...baseForm, codeSnippet: '' };
      case 'Matching':
        return { ...baseForm, prompts: [], matches: [] };
      default:
        return baseForm;
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(resetFormForType('QCM'));
    setModalOpen(true);
  };

  const startEdit = async (exercise) => {
    try {
      const { data } = await api.get(`/exercises/${exercise._id}`);
      setEditing(data);
      setForm({
        level: data.level,
        type: data.type,
        fr_question: data.translations?.fr?.question || '',
        en_question: data.translations?.en?.question || '',
        ar_question: data.translations?.ar?.question || '',
        fr_explanation: data.translations?.fr?.explanation || '',
        en_explanation: data.translations?.en?.explanation || '',
        ar_explanation: data.translations?.ar?.explanation || '',
        options: data.options?.length ? data.options : ['', ''],
        solutions: data.solutions || [],
        elements: data.elements || [],
        targets: data.targets || [],
        testCases: data.testCases || [],
        blocks: data.blocks || [],
        codeSnippet: data.codeSnippet || '',
        prompts: data.prompts || [],
        matches: data.matches || []
      });
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de récupérer l\'exercice');
    }
  };

  const handleSubmit = async () => {
    if (!form.level) {
      toast.error('Sélectionne un niveau');
      return;
    }
    if (!form.fr_question?.trim()) {
      toast.error('Question FR requise');
      return;
    }

    // Validation spécifique selon le type d'exercice
    if (form.type === 'QCM') {
      const validOptions = form.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        toast.error('QCM nécessite au moins 2 options');
        return;
      }
      if (form.solutions.length === 0) {
        toast.error('Sélectionne au moins une solution pour le QCM');
        return;
      }
    } else if (form.type === 'Code') {
      if (!form.testCases || form.testCases.length === 0) {
        toast.error('Code nécessite au moins un test case');
        return;
      }
    } else if (form.type === 'OrderBlocks') {
      if (!form.blocks || form.blocks.length < 2) {
        toast.error('OrderBlocks nécessite au moins 2 blocs');
        return;
      }
      if (form.solutions.length === 0) {
        toast.error('OrderBlocks nécessite des solutions');
        return;
      }
    } else if (form.type === 'FillInTheBlank' || form.type === 'SpotTheError') {
      if (!form.codeSnippet?.trim()) {
        toast.error('Code snippet requis');
        return;
      }
      if (form.solutions.length === 0) {
        toast.error('Solutions requises');
        return;
      }
    } else if (form.type === 'TextInput') {
      if (form.solutions.length === 0) {
        toast.error('Solutions requises pour TextInput');
        return;
      }
    } else if (form.type === 'Matching') {
      if (!form.prompts || form.prompts.length === 0) {
        toast.error('Matching nécessite des prompts');
        return;
      }
      if (!form.matches || form.matches.length === 0) {
        toast.error('Matching nécessite des matches');
        return;
      }
      if (form.solutions.length === 0) {
        toast.error('Matching nécessite des solutions');
        return;
      }
    }

    const payload = {
      level: form.level,
      type: form.type,
      translations: {
        fr: { question: form.fr_question, explanation: form.fr_explanation },
        en: { question: form.en_question, explanation: form.en_explanation },
        ar: { question: form.ar_question, explanation: form.ar_explanation }
      }
    };

    // Ajouter les champs spécifiques selon le type
    if (form.type === 'QCM') {
      payload.options = form.options.filter(opt => opt.trim() !== '');
      payload.solutions = form.solutions;
    } else if (form.type === 'DragDrop') {
      payload.elements = form.elements.filter(el => el.trim() !== '');
      payload.targets = form.targets.filter(t => t.trim() !== '');
      payload.solutions = form.solutions;
    } else if (form.type === 'Code') {
      payload.testCases = form.testCases.filter(tc => tc.input?.trim() && tc.expected?.trim());
    } else if (form.type === 'TextInput') {
      payload.solutions = form.solutions.filter(sol => sol.trim() !== '');
    } else if (form.type === 'OrderBlocks') {
      payload.blocks = form.blocks.filter(block => block.code?.trim());
      payload.solutions = form.solutions;
    } else if (form.type === 'FillInTheBlank' || form.type === 'SpotTheError') {
      payload.codeSnippet = form.codeSnippet;
      payload.solutions = form.solutions.filter(sol => sol.trim() !== '');
    } else if (form.type === 'Matching') {
      payload.prompts = form.prompts.filter(p => p.content?.trim());
      payload.matches = form.matches.filter(m => m.content?.trim());
      payload.solutions = form.solutions;
    }

    try {
      if (editing) {
        await api.put(`/exercises/${editing._id}`, payload);
        toast.success('Exercice mis à jour');
      } else {
        await api.post('/exercises', payload);
        toast.success('Exercice créé');
      }
      setModalOpen(false);
      fetchExercises(form.level);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || 'Erreur sauvegarde exercice');
    }
  };

  const addOption = () => setForm(f => ({ ...f, options: [...f.options, ''] }));
  const updateOption = (idx, value) => setForm(f => ({
    ...f,
    options: f.options.map((opt, i) => i === idx ? value : opt)
  }));
  const removeOption = (idx) => setForm(f => ({
    ...f,
    options: f.options.filter((_, i) => i !== idx),
    solutions: f.solutions.filter(s => s !== idx).map(s => s > idx ? s - 1 : s)
  }));
  const toggleSolution = (idx) => setForm(f => ({
    ...f,
    solutions: f.solutions.includes(idx) 
      ? f.solutions.filter(s => s !== idx)
      : [...f.solutions, idx]
  }));

  const addElement = () => setForm(f => ({ ...f, elements: [...f.elements, ''] }));
  const updateElement = (idx, value) => setForm(f => ({
    ...f,
    elements: f.elements.map((el, i) => i === idx ? value : el)
  }));
  const addTarget = () => setForm(f => ({ ...f, targets: [...f.targets, ''] }));
  const updateTarget = (idx, value) => setForm(f => ({
    ...f,
    targets: f.targets.map((t, i) => i === idx ? value : t)
  }));

  const addTestCase = () => setForm(f => ({
    ...f,
    testCases: [...f.testCases, { input: '', expected: '', points: 1 }]
  }));
  const updateTestCase = (idx, field, value) => setForm(f => ({
    ...f,
    testCases: f.testCases.map((tc, i) => 
      i === idx ? { ...tc, [field]: value } : tc
    )
  }));
  const removeTestCase = (idx) => setForm(f => ({
    ...f,
    testCases: f.testCases.filter((_, i) => i !== idx)
  }));

  const addBlock = () => setForm(f => ({
    ...f,
    blocks: [...f.blocks, { id: `block-${Date.now()}`, code: '' }]
  }));
  const updateBlock = (idx, field, value) => setForm(f => ({
    ...f,
    blocks: f.blocks.map((block, i) => 
      i === idx ? { ...block, [field]: value } : block
    )
  }));
  const removeBlock = (idx) => setForm(f => ({
    ...f,
    blocks: f.blocks.filter((_, i) => i !== idx)
  }));

  const addPrompt = () => setForm(f => ({
    ...f,
    prompts: [...f.prompts, { id: `prompt-${Date.now()}`, content: '' }]
  }));
  const updatePrompt = (idx, field, value) => setForm(f => ({
    ...f,
    prompts: f.prompts.map((prompt, i) => 
      i === idx ? { ...prompt, [field]: value } : prompt
    )
  }));
  const removePrompt = (idx) => setForm(f => ({
    ...f,
    prompts: f.prompts.filter((_, i) => i !== idx)
  }));

  const addMatch = () => setForm(f => ({
    ...f,
    matches: [...f.matches, { id: `match-${Date.now()}`, content: '' }]
  }));
  const updateMatch = (idx, field, value) => setForm(f => ({
    ...f,
    matches: f.matches.map((match, i) => 
      i === idx ? { ...match, [field]: value } : match
    )
  }));
  const removeMatch = (idx) => setForm(f => ({
    ...f,
    matches: f.matches.filter((_, i) => i !== idx)
  }));

  const askDelete = (id) => setConfirm({ open: true, id });
  const confirmDelete = async () => {
    try {
      await api.delete(`/exercises/${confirm.id}`);
      toast.success('Exercice supprimé');
      setConfirm({ open: false, id: null });
      fetchExercises(selectedLevel);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de supprimer');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={selectedPath} 
            onChange={e => setSelectedPath(e.target.value)} 
            style={selectStyle()}
          >
            <option value="">Sélectionner un parcours</option>
            {paths.map(path => (
              <option key={path._id} value={path._id}>
                {pickTitle(path)}
              </option>
            ))}
          </select>

          <select 
            value={selectedLevel} 
            onChange={e => setSelectedLevel(e.target.value)} 
            style={selectStyle()}
          >
            <option value="">Sélectionner un niveau</option>
            {levels.map(level => (
              <option key={level._id} value={level._id}>
                {pickTitle(level) || `Niveau ${level.order}`}
              </option>
            ))}
          </select>

          <SearchBar 
            value={query} 
            onChange={v => setQuery(v)} 
            placeholder="Rechercher exercices..." 
          />
        </div>
        <ActionPrimary onClick={() => openCreate()}>
          <FiPlus /> Nouvel exercice
        </ActionPrimary>
      </div>

      <div style={{ marginTop: '16px' }}>
        {loading ? (
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <div style={{ height: '18px', background: '#f3f4f6', borderRadius: '4px' }} />
              </Card>
            ))}
          </Grid>
        ) : pagedExercises.length ? (
          <>
            <Grid>
              {pagedExercises.map(exercise => (
                <Card key={exercise._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <CardTitle>{pickTitle(exercise) || 'Sans question'}</CardTitle>
                      <CardMeta>{exercise.type}</CardMeta>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Tiny>Niveau</Tiny>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {String(exercise._id).slice(0, 8)}
                      </div>
                    </div>
                  </div>
                  <CardActions>
                    <IconButton onClick={() => startEdit(exercise)}>
                      <FiEdit />
                    </IconButton>
                    <IconButton danger onClick={() => askDelete(exercise._id)}>
                      <FiTrash2 />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Grid>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tiny>
                Affichage {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredExercises.length)} / {filteredExercises.length}
              </Tiny>
              <Pagination 
                page={page} 
                pages={pages} 
                onPrev={() => setPage(p => Math.max(1, p - 1))} 
                onNext={() => setPage(p => Math.min(pages, p + 1))} 
              />
            </div>
          </>
        ) : (
          <EmptyState>
            <h3>Aucun exercice</h3>
            <p>Sélectionne un niveau pour commencer.</p>
            <ActionPrimary onClick={() => openCreate()}>
              <FiPlus /> Nouvel exercice
            </ActionPrimary>
          </EmptyState>
        )}
      </div>

      <FormModal 
        open={modalOpen} 
        title={editing ? 'Éditer exercice' : 'Nouvel exercice'} 
        onClose={() => setModalOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={() => setModalOpen(false)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #eef2ff' }}>
              Annuler
            </button>
            <ActionPrimary onClick={handleSubmit}>
              <FiPlus /> Sauvegarder
            </ActionPrimary>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Niveau</div>
            <select 
              value={form.level} 
              onChange={e => setForm(f => ({ ...f, level: e.target.value }))} 
              style={selectStyle()}
            >
              <option value="">Sélectionner un niveau</option>
              {levels.map(level => (
                <option key={level._id} value={level._id}>
                  {pickTitle(level) || `Niveau ${level.order}`}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Type</div>
            <select 
              value={form.type} 
              onChange={e => {
                const newType = e.target.value;
                const newForm = resetFormForType(newType);
                // Préserver les valeurs communes
                newForm.level = form.level;
                newForm.fr_question = form.fr_question;
                newForm.en_question = form.en_question;
                newForm.ar_question = form.ar_question;
                newForm.fr_explanation = form.fr_explanation;
                newForm.en_explanation = form.en_explanation;
                newForm.ar_explanation = form.ar_explanation;
                setForm(newForm);
              }} 
              style={selectStyle()}
            >
              <option value="QCM">QCM</option>
              <option value="TextInput">Réponse texte</option>
              <option value="DragDrop">Glisser-déposer</option>
              <option value="Code">Code</option>
              <option value="OrderBlocks">Ordre des blocs</option>
              <option value="FillInTheBlank">Remplir les trous</option>
              <option value="SpotTheError">Trouver l'erreur</option>
              <option value="Matching">Associations</option>
            </select>
          </label>

          <label style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Question (Français)</div>
            <textarea 
              value={form.fr_question} 
              onChange={e => setForm(f => ({ ...f, fr_question: e.target.value }))} 
              style={textareaStyle()} 
            />
          </label>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Question (Anglais)</div>
            <textarea 
              value={form.en_question} 
              onChange={e => setForm(f => ({ ...f, en_question: e.target.value }))} 
              style={textareaStyle()} 
            />
          </label>
          <label>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Question (Arabe)</div>
            <textarea 
              value={form.ar_question} 
              onChange={e => setForm(f => ({ ...f, ar_question: e.target.value }))} 
              style={textareaStyle()} 
            />
          </label>

          {form.type === 'QCM' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px' }}>Options (QCM)</div>
                <button onClick={addOption} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}>
                  Ajouter option
                </button>
              </div>
              {form.options.map((option, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <input 
                    value={option} 
                    onChange={e => updateOption(idx, e.target.value)} 
                    placeholder={`Option ${idx + 1}`}
                    style={inputStyle()} 
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <input 
                      type="checkbox" 
                      checked={form.solutions.includes(idx)} 
                      onChange={() => toggleSolution(idx)} 
                    />
                    Solution
                  </label>
                  {form.options.length > 2 && (
                    <button 
                      onClick={() => removeOption(idx)} 
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                    >
                      Suppr
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {form.type === 'DragDrop' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px' }}>Éléments</div>
                    <button onClick={addElement} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}>
                      Ajouter
                    </button>
                  </div>
                  {form.elements.map((element, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        value={element} 
                        onChange={e => updateElement(idx, e.target.value)} 
                        placeholder={`Élément ${idx + 1}`}
                        style={inputStyle()} 
                      />
                      <button 
                        onClick={() => setForm(f => ({ ...f, elements: f.elements.filter((_, i) => i !== idx) }))} 
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                      >
                        Suppr
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px' }}>Cibles</div>
                    <button onClick={addTarget} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}>
                      Ajouter
                    </button>
                  </div>
                  {form.targets.map((target, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        value={target} 
                        onChange={e => updateTarget(idx, e.target.value)} 
                        placeholder={`Cible ${idx + 1}`}
                        style={inputStyle()} 
                      />
                      <button 
                        onClick={() => setForm(f => ({ ...f, targets: f.targets.filter((_, i) => i !== idx) }))} 
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                      >
                        Suppr
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {form.type === 'Code' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px' }}>Test Cases</div>
                <button onClick={addTestCase} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}>
                  Ajouter test case
                </button>
              </div>
              {form.testCases.map((testCase, idx) => (
                <div key={idx} style={{ marginBottom: '12px', padding: '12px', border: '1px solid #eef2ff', borderRadius: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 40px', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      value={testCase.input} 
                      onChange={e => updateTestCase(idx, 'input', e.target.value)} 
                      placeholder="Input"
                      style={inputStyle()} 
                    />
                    <input 
                      value={testCase.expected} 
                      onChange={e => updateTestCase(idx, 'expected', e.target.value)} 
                      placeholder="Expected"
                      style={inputStyle()} 
                    />
                    <input 
                      type="number"
                      value={testCase.points} 
                      onChange={e => updateTestCase(idx, 'points', +e.target.value)} 
                      placeholder="Points"
                      style={inputStyle()} 
                    />
                    <button 
                      onClick={() => removeTestCase(idx)} 
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                    >
                      Suppr
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {form.type === 'Matching' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px' }}>Prompts</div>
                    <button onClick={addPrompt} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}>
                      Ajouter
                    </button>
                  </div>
                  {form.prompts.map((prompt, idx) => (
                    <div key={prompt.id} style={{ marginBottom: '8px', padding: '8px', border: '1px solid #eef2ff', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          value={prompt.id} 
                          onChange={e => updatePrompt(idx, 'id', e.target.value)} 
                          placeholder="ID"
                          style={{ ...inputStyle(), width: '80px' }} 
                        />
                        <input 
                          value={prompt.content} 
                          onChange={e => updatePrompt(idx, 'content', e.target.value)} 
                          placeholder="Contenu"
                          style={inputStyle()} 
                        />
                        <button 
                          onClick={() => removePrompt(idx)} 
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                        >
                          Suppr
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px' }}>Matches</div>
                    <button onClick={addMatch} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}>
                      Ajouter
                    </button>
                  </div>
                  {form.matches.map((match, idx) => (
                    <div key={match.id} style={{ marginBottom: '8px', padding: '8px', border: '1px solid #eef2ff', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          value={match.id} 
                          onChange={e => updateMatch(idx, 'id', e.target.value)} 
                          placeholder="ID"
                          style={{ ...inputStyle(), width: '80px' }} 
                        />
                        <input 
                          value={match.content} 
                          onChange={e => updateMatch(idx, 'content', e.target.value)} 
                          placeholder="Contenu"
                          style={inputStyle()} 
                        />
                        <button 
                          onClick={() => removeMatch(idx)} 
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                        >
                          Suppr
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {form.type === 'TextInput' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px' }}>Solutions (TextInput)</div>
                <button 
                  onClick={() => setForm(f => ({ ...f, solutions: [...f.solutions, ''] }))} 
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                >
                  Ajouter solution
                </button>
              </div>
              {form.solutions.map((solution, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    value={solution} 
                    onChange={e => {
                      const newSolutions = [...form.solutions];
                      newSolutions[idx] = e.target.value;
                      setForm(f => ({ ...f, solutions: newSolutions }));
                    }} 
                    placeholder={`Solution ${idx + 1}`}
                    style={inputStyle()} 
                  />
                  <button 
                    onClick={() => {
                      const newSolutions = form.solutions.filter((_, i) => i !== idx);
                      setForm(f => ({ ...f, solutions: newSolutions }));
                    }} 
                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                  >
                    Suppr
                  </button>
                </div>
              ))}
            </div>
          )}

          {(form.type === 'FillInTheBlank' || form.type === 'SpotTheError') && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label>
                <div style={{ fontSize: '13px', marginBottom: '6px' }}>Code Snippet</div>
                <textarea 
                  value={form.codeSnippet} 
                  onChange={e => setForm(f => ({ ...f, codeSnippet: e.target.value }))} 
                  placeholder="Collez le code ici..."
                  style={{ ...textareaStyle(), minHeight: '150px', fontFamily: 'monospace' }} 
                />
              </label>
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px' }}>Solutions</div>
                  <button 
                    onClick={() => setForm(f => ({ ...f, solutions: [...f.solutions, ''] }))} 
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                  >
                    Ajouter solution
                  </button>
                </div>
                {form.solutions.map((solution, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      value={solution} 
                      onChange={e => {
                        const newSolutions = [...form.solutions];
                        newSolutions[idx] = e.target.value;
                        setForm(f => ({ ...f, solutions: newSolutions }));
                      }} 
                      placeholder={`Solution ${idx + 1}`}
                      style={inputStyle()} 
                    />
                    <button 
                      onClick={() => {
                        const newSolutions = form.solutions.filter((_, i) => i !== idx);
                        setForm(f => ({ ...f, solutions: newSolutions }));
                      }} 
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                    >
                      Suppr
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.type === 'OrderBlocks' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px' }}>Blocs de code (à ordonner)</div>
                <button onClick={addBlock} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}>
                  Ajouter un bloc
                </button>
              </div>
              {form.blocks.map((block, idx) => (
                <div key={block.id} style={{ marginBottom: '12px', padding: '12px', border: '1px solid #eef2ff', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      value={block.id} 
                      onChange={e => updateBlock(idx, 'id', e.target.value)} 
                      placeholder="ID du bloc"
                      style={{ ...inputStyle(), width: '120px' }} 
                    />
                    <button 
                      onClick={() => removeBlock(idx)} 
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                    >
                      Supprimer
                    </button>
                  </div>
                  <textarea 
                    value={block.code} 
                    onChange={e => updateBlock(idx, 'code', e.target.value)} 
                    placeholder="Code du bloc"
                    style={{ ...textareaStyle(), minHeight: '80px', fontFamily: 'monospace' }} 
                  />
                </div>
              ))}
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px' }}>Ordre des solutions (IDs des blocs dans l'ordre correct)</div>
                  <button 
                    onClick={() => setForm(f => ({ ...f, solutions: [...f.solutions, ''] }))} 
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                  >
                    Ajouter solution
                  </button>
                </div>
                {form.solutions.map((solution, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      value={solution} 
                      onChange={e => {
                        const newSolutions = [...form.solutions];
                        newSolutions[idx] = e.target.value;
                        setForm(f => ({ ...f, solutions: newSolutions }));
                      }} 
                      placeholder={`Solution ${idx + 1} (ex: block1,block2,block3)`}
                      style={inputStyle()} 
                    />
                    <button 
                      onClick={() => {
                        const newSolutions = form.solutions.filter((_, i) => i !== idx);
                        setForm(f => ({ ...f, solutions: newSolutions }));
                      }} 
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eef2ff' }}
                    >
                      Suppr
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <label style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '13px', marginBottom: '6px' }}>Explication (Français)</div>
            <textarea 
              value={form.fr_explanation} 
              onChange={e => setForm(f => ({ ...f, fr_explanation: e.target.value }))} 
              style={textareaStyle()} 
            />
          </label>
        </div>
      </FormModal>

      <ConfirmDialog 
        open={confirm.open} 
        title="Supprimer exercice" 
        message="Voulez-vous vraiment supprimer cet exercice ?"
        onCancel={() => setConfirm({ open: false, id: null })} 
        onConfirm={confirmDelete} 
      />
    </>
  );
}