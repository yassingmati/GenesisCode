import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { api, pickTitle, inputStyle, selectStyle, textareaStyle } from '../components/common';
import { Grid, Card, CardTitle, CardMeta, CardActions, IconButton, EmptyState, Tiny } from '../styles';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';
import { ActionPrimary } from '../styles';

export default function LevelsPanel({ onOpenCreate }) {
  const [paths, setPaths] = useState([]);
  const [levels, setLevels] = useState([]);
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
    order: 1
  });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    fetchPaths();
  }, []);

  useEffect(() => {
    if (selectedPath) {
      fetchLevels(selectedPath);
    } else {
      setLevels([]);
    }
    setPage(1);
  }, [selectedPath]);

  useEffect(() => {
    if (onOpenCreate) {
      onOpenCreate(() => openCreate());
    }
  }, [onOpenCreate, selectedPath, levels]);

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

  const openCreate = () => {
    setEditing(null);
    setForm({
      path: selectedPath || '',
      fr_title: '', en_title: '', ar_title: '',
      fr_content: '', en_content: '', ar_content: '',
      order: levels.length + 1 || 1
    });
    setModalOpen(true);
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
      if (editing) {
        await api.put(`/levels/${editing._id}`, payload);
        toast.success('Niveau mis à jour');
      } else {
        await api.post('/levels', payload);
        toast.success('Niveau créé');
      }
      setModalOpen(false);
      fetchLevels(form.path);
    } catch (err) {
      console.error(err);
      toast.error('Erreur sauvegarde');
    }
  };

  const startEdit = (level) => {
    setEditing(level);
    setForm({
      path: level.path || form.path,
      fr_title: level.translations?.fr?.title || '',
      en_title: level.translations?.en?.title || '',
      ar_title: level.translations?.ar?.title || '',
      fr_content: level.translations?.fr?.content || '',
      en_content: level.translations?.en?.content || '',
      ar_content: level.translations?.ar?.content || '',
      order: level.order || 1
    });
    setModalOpen(true);
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
        </div>
      </FormModal>

      <ConfirmDialog 
        open={confirm.open} 
        title="Supprimer niveau" 
        message="Voulez-vous supprimer ce niveau ?"
        onCancel={() => setConfirm({ open: false, id: null })} 
        onConfirm={confirmDelete} 
      />
    </>
  );
}
