import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  Card, CardHeader, CardBody, CardFooter,
  Button, Input, Skeleton,
  Chip, Select, SelectItem
} from "@nextui-org/react";
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { api, pickTitle } from '../components/common';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';

export default function CategoriesPanel({ onOpenCreate }) {
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
        type: form.type || 'classic'
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
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex gap-4 flex-1">
          <SearchBar
            value={query}
            onChange={v => { setQuery(v); setPage(1); }}
            placeholder="Rechercher catégories..."
          />
          <Select
            placeholder="Tous les types"
            selectedKeys={filterType ? [filterType] : []}
            onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="max-w-xs"
            size="sm"
          >
            <SelectItem key="classic" value="classic">Classique</SelectItem>
            <SelectItem key="specific" value="specific">Spécifique</SelectItem>
          </Select>
        </div>
        <Button
          color="primary"
          startContent={<IconPlus size={18} />}
          onPress={() => setModalOpen(true)}
        >
          Nouvelle catégorie
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl border border-gray-100 shadow-sm">
                <CardBody className="gap-3 p-5">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-xl mt-2" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : pagedCategories.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pagedCategories.map(cat => (
                <Card
                  key={cat._id}
                  className="group relative overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 rounded-2xl"
                >
                  {/* Decorative Gradient Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cat.type === 'specific' ? 'from-violet-500 to-fuchsia-500' : 'from-blue-500 to-cyan-500'
                    }`} />

                  <CardBody className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Chip
                          size="sm"
                          variant="flat"
                          classNames={{
                            base: cat.type === 'specific' ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-600",
                            content: "font-semibold"
                          }}
                        >
                          {cat.type === 'specific' ? 'Spécifique' : 'Classique'}
                        </Chip>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 font-mono text-xs font-bold border border-gray-100">
                        {cat.order}
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {pickTitle(cat) || 'Sans nom'}
                    </h4>

                    <div className="flex gap-2 text-xs text-gray-400 font-medium mb-6">
                      <span className="uppercase tracking-wider">ID: {String(cat._id).slice(-6)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <Button
                        size="md"
                        variant="flat"
                        color="primary"
                        startContent={<IconEdit size={18} />}
                        onPress={() => startEdit(cat)}
                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium rounded-xl"
                      >
                        Éditer
                      </Button>
                      <Button
                        size="md"
                        variant="light"
                        color="danger"
                        startContent={<IconTrash size={18} />}
                        onPress={() => askDelete(cat._id)}
                        className="text-red-500 hover:bg-red-50 font-medium rounded-xl"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">
                Affichage <span className="text-gray-900 font-bold">{(page - 1) * perPage + 1}</span> - <span className="text-gray-900 font-bold">{Math.min(page * perPage, filteredCategories.length)}</span> sur <span className="text-gray-900 font-bold">{filteredCategories.length}</span> résultats
              </p>
              <Pagination
                page={page}
                pages={pages}
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(pages, p + 1))}
              />
            </div>
          </>
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Aucune catégorie</h3>
              <p className="text-default-500 mb-4">Crée la première catégorie pour démarrer.</p>
              <Button
                color="primary"
                startContent={<IconPlus size={18} />}
                onPress={() => setModalOpen(true)}
              >
                Nouvelle catégorie
              </Button>
            </CardBody>
          </Card>
        )}
      </div>

      <FormModal
        open={modalOpen}
        title={editing ? 'Éditer catégorie' : 'Nouvelle catégorie'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="light" onPress={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button
              color="primary"
              startContent={<IconPlus size={18} />}
              onPress={handleSubmit}
            >
              {editing ? 'Sauvegarder' : 'Créer'}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Type"
            selectedKeys={form.type ? [form.type] : []}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          >
            <SelectItem key="classic" value="classic">Classique</SelectItem>
            <SelectItem key="specific" value="specific">Spécifique</SelectItem>
          </Select>

          <Input
            label="Ordre"
            type="number"
            value={String(form.order)}
            onValueChange={v => setForm(f => ({ ...f, order: +v }))}
            variant="bordered"
          />

          <Input
            label="Nom (Français)"
            value={form.fr}
            onValueChange={v => setForm(f => ({ ...f, fr: v }))}
            required
            variant="bordered"
          />
          <Input
            label="Nom (Anglais)"
            value={form.en}
            onValueChange={v => setForm(f => ({ ...f, en: v }))}
            required
            variant="bordered"
          />
          <Input
            label="Nom (Arabe)"
            value={form.ar}
            onValueChange={v => setForm(f => ({ ...f, ar: v }))}
            required
            variant="bordered"
          />
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