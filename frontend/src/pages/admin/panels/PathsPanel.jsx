import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  Card, CardHeader, CardBody, CardFooter,
  Button, Input, Skeleton,
  Chip, Select, SelectItem, Textarea
} from "@nextui-org/react";
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { api, pickTitle } from '../components/common';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';

export default function PathsPanel({ onOpenCreate }) {
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
        setForm({ category: '', fr_name: '', en_name: '', ar_name: '', fr_description: '', en_description: '', ar_description: '', order: 0 });
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
      const { data } = await api.get('/categories');
      setCategories(Array.isArray(data) ? data : []);
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
      filtered = filtered.filter(path => (path.category?._id || path.category) === filterCategory);
    }
    return filtered;
  }, [paths, query, filterCategory]);

  const pages = Math.max(1, Math.ceil(filteredPaths.length / perPage));
  const pagedPaths = filteredPaths.slice((page - 1) * perPage, page * perPage);

  const handleSubmit = async () => {
    if (!form.category) {
      toast.error('Sélectionne une catégorie');
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
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="flex gap-4 flex-1">
          <SearchBar 
            value={query} 
            onChange={v => { setQuery(v); setPage(1); }} 
            placeholder="Rechercher parcours..." 
          />
          <Select 
            placeholder="Toutes catégories"
            selectedKeys={filterCategory ? [filterCategory] : []}
            onChange={e => setFilterCategory(e.target.value)}
            className="max-w-xs"
            size="sm"
          >
            {categories.map(cat => (
              <SelectItem key={cat._id} value={cat._id}>
                {pickTitle(cat)}
              </SelectItem>
            ))}
          </Select>
        </div>
        <Button color="primary" startContent={<IconPlus size={18} />} onPress={() => setModalOpen(true)}>
          Nouveau parcours
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
        ) : pagedPaths.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagedPaths.map(path => (
                <Card key={path._id} className="h-full">
                  <CardHeader className="flex justify-between items-start pb-0">
                    <div className="flex flex-col">
                      <h4 className="text-md font-bold">{pickTitle(path) || 'Sans nom'}</h4>
                      <p className="text-small text-default-500">
                        {(path.translations?.fr?.description || '').substring(0, 70)}
                        {(path.translations?.fr?.description || '').length > 70 ? '...' : ''}
                      </p>
                    </div>
                    <Chip size="sm" variant="flat" color="secondary">
                      {path.category?.translations?.fr?.name || 'Catégorie'}
                    </Chip>
                  </CardHeader>
                  <CardBody className="py-2">
                    {/* Additional content can go here */}
                  </CardBody>
                  <CardFooter className="justify-end gap-2 pt-0">
                    <Button isIconOnly size="sm" variant="light" onPress={() => startEdit(path)}>
                      <IconEdit size={18} />
                    </Button>
                    <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => askDelete(path._id)}>
                      <IconTrash size={18} />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-small text-default-400">
                Affichage {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredPaths.length)} / {filteredPaths.length}
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
            <h3 className="text-lg font-semibold mb-2">Aucun parcours</h3>
            <p className="text-default-500 mb-4">Crée ton premier parcours pour commencer.</p>
            <Button color="primary" startContent={<IconPlus size={18} />} onPress={() => setModalOpen(true)}>
              Nouveau parcours
            </Button>
          </div>
        )}
      </div>

      <FormModal 
        open={modalOpen} 
        title={editing ? 'Éditer parcours' : 'Nouveau parcours'} 
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
      >
        <div className="grid grid-cols-2 gap-4">
          <Select 
            label="Catégorie" 
            placeholder="Sélectionner"
            selectedKeys={form.category ? [form.category] : []}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          >
            {categories.map(cat => (
              <SelectItem key={cat._id} value={cat._id}>
                {pickTitle(cat)}
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
            label="Nom (Français)" 
            value={form.fr_name} 
            onValueChange={v => setForm(f => ({ ...f, fr_name: v }))} 
          />
          <Input 
            label="Nom (Anglais)" 
            value={form.en_name} 
            onValueChange={v => setForm(f => ({ ...f, en_name: v }))} 
          />
          <Input 
            label="Nom (Arabe)" 
            value={form.ar_name} 
            onValueChange={v => setForm(f => ({ ...f, ar_name: v }))} 
          />

          <div className="col-span-2">
            <Textarea 
              label="Description (Français)" 
              value={form.fr_description} 
              onValueChange={v => setForm(f => ({ ...f, fr_description: v }))} 
            />
          </div>
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
