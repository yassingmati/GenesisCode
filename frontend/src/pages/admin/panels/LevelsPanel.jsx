import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  Card, CardHeader, CardBody, CardFooter,
  Button, Input, Skeleton,
  Chip, Select, SelectItem, Textarea,
  Progress, Link
} from "@nextui-org/react";
import { IconEdit, IconTrash, IconPlus, IconVideo, IconFileText, IconEye, IconX } from '@tabler/icons-react';
import axios from 'axios';
import { api, pickTitle } from '../components/common';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';

// Helper to get API URL
const getApiUrl = (path) => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://codegenesis-backend.onrender.com'
      : 'https://codegenesis-backend.onrender.com');
  return `${baseUrl}${path}`;
};

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

  useEffect(() => {
    return () => {
      Object.values(videoPreviews).forEach(url => url && URL.revokeObjectURL(url));
      Object.values(pdfPreviews).forEach(url => url && URL.revokeObjectURL(url));
    };
  }, [videoPreviews, pdfPreviews]);

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
      order: levels.length + 1 || 1,
      videoFiles: { fr: null, en: null, ar: null },
      pdfFiles: { fr: null, en: null, ar: null }
    });
    setVideoPreviews({ fr: null, en: null, ar: null });
    setPdfPreviews({ fr: null, en: null, ar: null });
    setModalOpen(true);
  };

  const setMediaFile = (mediaType, lang, file) => {
    const mediaKey = mediaType === 'video' ? 'videoFiles' : 'pdfFiles';

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
      order: level.order || 1,
      videoFiles: { fr: null, en: null, ar: null },
      pdfFiles: { fr: null, en: null, ar: null }
    });

    const newVideoPreviews = {};
    const newPdfPreviews = {};

    for (const lang of ['fr', 'en', 'ar']) {
      if (level.videos?.[lang]) {
        const vUrl = level.videos[lang];
        newVideoPreviews[lang] = vUrl.startsWith('http') ? vUrl : `${API_BASE_URL}${vUrl}`;
      }
      if (level.pdfs?.[lang]) {
        const pUrl = level.pdfs[lang];
        newPdfPreviews[lang] = pUrl.startsWith('http') ? pUrl : `${API_BASE_URL}${pUrl}`;
      }
    }

    setVideoPreviews(newVideoPreviews);
    setPdfPreviews(newPdfPreviews);
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

  const MediaBadge = ({ lang, hasMedia, onPreview, onDelete, mediaType = 'video' }) => {
    const icon = mediaType === 'video' ? <IconVideo size={14} /> : <IconFileText size={14} />;
    if (!hasMedia) return <span className="text-tiny text-default-400 ml-2">{lang.toUpperCase()}</span>;

    return (
      <Chip
        size="sm"
        variant="flat"
        color="primary"
        startContent={icon}
        className="ml-2"
        endContent={
          <div className="flex gap-1 ml-1">
            <button onClick={() => onPreview?.(lang)} className="text-primary hover:text-primary-600">
              <IconEye size={14} />
            </button>
            <button onClick={() => onDelete?.(lang)} className="text-danger hover:text-danger-600">
              <IconTrash size={14} />
            </button>
          </div>
        }
      >
        {lang.toUpperCase()}
      </Chip>
    );
  };

  const MediaField = ({ lang, previewUrl, onChange, uploading, progress, mediaType = 'video' }) => {
    const accept = mediaType === 'video' ? 'video/*' : '.pdf';
    const icon = mediaType === 'video' ? <IconVideo size={16} /> : <IconFileText size={16} />;

    return (
      <div className="mb-4 p-3 border rounded-lg bg-default-50">
        <div className="flex items-center gap-2 mb-2 text-small font-semibold">
          {icon} {mediaType === 'video' ? 'Vidéo' : 'PDF'} ({lang.toUpperCase()})
        </div>
        <input
          type="file"
          accept={accept}
          onChange={e => onChange(e.target.files?.[0] || null)}
          className="block w-full text-sm text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        {uploading ? (
          <div className="mt-2">
            <Progress size="sm" value={progress || 0} color="primary" showValueLabel={true} label="Upload..." />
          </div>
        ) : previewUrl ? (
          <div className="mt-2">
            {mediaType === 'video' ? (
              <video src={previewUrl} controls className="w-full rounded-lg max-h-[200px]" />
            ) : (
              <div className="flex items-center gap-2 p-2 bg-white rounded border">
                <IconFileText size={16} />
                <Link href={previewUrl} isExternal showAnchorIcon>
                  Voir le PDF
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="flex gap-4 flex-1">
          <Select
            placeholder="Choisir un parcours"
            selectedKeys={selectedPath ? [selectedPath] : []}
            onChange={e => { setSelectedPath(e.target.value); setPage(1); }}
            className="max-w-xs"
            size="sm"
          >
            {paths.map(path => (
              <SelectItem key={path._id} value={path._id}>
                {pickTitle(path)}
              </SelectItem>
            ))}
          </Select>
          <SearchBar
            value={query}
            onChange={v => { setQuery(v); setPage(1); }}
            placeholder="Rechercher niveaux..."
          />
        </div>
        <Button color="primary" startContent={<IconPlus size={18} />} onPress={() => openCreate()}>
          Nouveau niveau
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-[140px]">
                <Skeleton className="rounded-lg">
                  <div className="h-full rounded-lg bg-default-300"></div>
                </Skeleton>
              </Card>
            ))}
          </div>
        ) : pagedLevels.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagedLevels.map(level => (
                <Card key={level._id} className="h-full">
                  <CardHeader className="flex justify-between items-start pb-0">
                    <div className="flex flex-col">
                      <h4 className="text-md font-bold">{pickTitle(level) || `Niveau ${level.order}`}</h4>
                      <p className="text-small text-default-500">
                        {(level.translations?.fr?.content || '').substring(0, 80)}
                        {(level.translations?.fr?.content || '').length > 80 ? '...' : ''}
                      </p>
                    </div>
                    <Chip size="sm" variant="flat" color="secondary">
                      Ordre {level.order}
                    </Chip>
                  </CardHeader>
                  <CardBody className="py-2">
                    <div className="flex flex-wrap gap-2 justify-end mt-2">
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
                  </CardBody>
                  <CardFooter className="justify-end gap-2 pt-0">
                    <Button isIconOnly size="sm" variant="light" onPress={() => startEdit(level)}>
                      <IconEdit size={18} />
                    </Button>
                    <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => askDelete(level._id)}>
                      <IconTrash size={18} />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-small text-default-400">
                Affichage {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredLevels.length)} / {filteredLevels.length}
              </span>
              <Pagination
                page={page}
                pages={pages}
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(pages, p + 1))}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Aucun niveau</h3>
            <p className="text-default-500 mb-4">Sélectionne un parcours pour afficher ses niveaux.</p>
            <Button color="primary" startContent={<IconPlus size={18} />} onPress={() => openCreate()}>
              Créer un niveau
            </Button>
          </div>
        )}
      </div>

      <FormModal
        open={modalOpen}
        title={editing ? 'Éditer niveau' : 'Nouveau niveau'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="flat" color="default" onPress={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              Sauvegarder
            </Button>
          </div>
        }
        width={900}
      >
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Parcours"
            placeholder="Sélectionner"
            selectedKeys={form.path ? [form.path] : []}
            onChange={e => setForm(f => ({ ...f, path: e.target.value }))}
          >
            {paths.map(path => (
              <SelectItem key={path._id} value={path._id}>
                {pickTitle(path)}
              </SelectItem>
            ))}
          </Select>

          <Input
            type="number"
            label="Ordre"
            value={form.order}
            onValueChange={v => setForm(f => ({ ...f, order: +v }))}
          />

          <Input
            label="Titre (Français)"
            value={form.fr_title}
            onValueChange={v => setForm(f => ({ ...f, fr_title: v }))}
          />
          <Input
            label="Titre (Anglais)"
            value={form.en_title}
            onValueChange={v => setForm(f => ({ ...f, en_title: v }))}
          />
          <Input
            label="Titre (Arabe)"
            value={form.ar_title}
            onValueChange={v => setForm(f => ({ ...f, ar_title: v }))}
          />

          <div className="col-span-2">
            <Textarea
              label="Contenu (Français)"
              value={form.fr_content}
              onValueChange={v => setForm(f => ({ ...f, fr_content: v }))}
            />
          </div>

          <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {['fr', 'en', 'ar'].map(lang => (
              <div key={lang} className="border p-2 rounded-lg">
                <h5 className="font-bold mb-2 text-center uppercase">{lang} Media</h5>
                <MediaField
                  lang={lang}
                  mediaType="video"
                  previewUrl={videoPreviews[lang]}
                  uploading={uploading.videos[lang]}
                  progress={progress.videos[lang]}
                  onChange={file => setMediaFile('video', lang, file)}
                />
                <MediaField
                  lang={lang}
                  mediaType="pdf"
                  previewUrl={pdfPreviews[lang]}
                  uploading={uploading.pdfs[lang]}
                  progress={progress.pdfs[lang]}
                  onChange={file => setMediaFile('pdf', lang, file)}
                />
              </div>
            ))}
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
        title="Supprimer média"
        message={`Voulez-vous vraiment supprimer ce ${deleteMediaConfirm.mediaType === 'video' ? 'vidéo' : 'PDF'} ?`}
        onCancel={() => setDeleteMediaConfirm({ open: false, levelId: null, lang: null, mediaType: null })}
        onConfirm={confirmDeleteMedia}
      />
    </>
  );
}
