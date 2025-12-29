import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconCurrencyDollar,
  IconClock,
  IconUsers,
  IconCheck,
  IconX,
  IconPremiumRights
} from '@tabler/icons-react';
import { systemApi as api } from './components/common';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, CardHeader, CardFooter, Button, Input, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem, Switch, Textarea } from "@nextui-org/react";

const CategoryPlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [activeLang, setActiveLang] = useState('fr');

  const [formData, setFormData] = useState({
    categoryId: '',
    price: '',
    currency: 'TND',
    paymentType: 'one_time',
    accessDuration: 365,
    active: true,
    translations: {
      fr: { name: '', description: '' },
      en: { name: '', description: '' },
      ar: { name: '', description: '' }
    },
    features: [],
    order: 0
  });

  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalUsers: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, categoriesRes, statsRes] = await Promise.all([
        api.get('/admin/category-plans', {
          params: { page, limit: 9, search: debouncedSearch }
        }),
        api.get('/categories'),
        api.get('/admin/category-plans/stats')
      ]);

      setPlans(plansRes.data?.plans || []);
      setTotalPages(plansRes.data?.pagination?.pages || 1);
      setCategories(categoriesRes.data || []);
      setStats({
        totalPlans: statsRes.data?.stats?.totalPlans || 0,
        activePlans: statsRes.data?.stats?.activePlans || 0,
        totalUsers: statsRes.data?.stats?.totalUsers || 0
      });

    } catch (error) {
      console.error(error);
      toast.error('Erreur chargement données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      categoryId: '',
      price: '',
      currency: 'TND',
      paymentType: 'one_time',
      accessDuration: 365,
      active: true,
      translations: {
        fr: { name: '', description: '' },
        en: { name: '', description: '' },
        ar: { name: '', description: '' }
      },
      features: [],
      order: 0
    });
    setModalOpen(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      categoryId: plan.category?._id || plan.targetId?._id || plan.targetId,
      price: plan.priceMonthly || plan.price,
      currency: plan.currency,
      paymentType: plan.interval === 'month' ? 'monthly' : (plan.interval === 'year' ? 'yearly' : 'one_time'),
      accessDuration: plan.accessDuration || 365,
      active: plan.active,
      translations: plan.translations || {
        fr: { name: '', description: '' },
        en: { name: '', description: '' },
        ar: { name: '', description: '' }
      },
      features: plan.features || [],
      order: plan.order || 0
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingPlan) {
        await api.put(`/admin/category-plans/${editingPlan._id}`, formData);
        toast.success('Plan mis à jour');
      } else {
        await api.post('/admin/category-plans', formData);
        toast.success('Plan créé');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur sauvegarde');
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Supprimer le plan "${plan.translations?.fr?.name}" ?`)) return;
    try {
      await api.delete(`/admin/category-plans/${plan._id}`);
      toast.success('Plan supprimé');
      fetchData();
    } catch (error) {
      toast.error('Erreur suppression');
    }
  };

  const handleToggleStatus = async (plan) => {
    try {
      await api.patch(`/admin/category-plans/${plan._id}/toggle`, { active: !plan.active });
      toast.success(`Plan ${!plan.active ? 'activé' : 'désactivé'}`);
      fetchData();
    } catch (error) {
      toast.error('Erreur status');
    }
  };

  const updateTranslation = (lang, field, value) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: { ...prev.translations[lang], [field]: value }
      }
    }));
  };

  const getCategoryName = (plan) => {
    const cat = plan.category || plan.targetId;
    if (!cat) return 'Inconnue';
    return cat.translations?.fr?.name || cat.name || 'Sans nom';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-[1600px] mx-auto min-h-screen"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 tracking-tight mb-2 flex items-center gap-3">
            <IconPremiumRights className="text-cyan-500" size={36} />
            Plans de Catégories
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Gérez les abonnements et la monétisation.</p>
        </div>
        <div className="flex gap-2">
          <Button isIconOnly variant="flat" onPress={fetchData}>
            <IconRefresh size={20} />
          </Button>
          <Button
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
            size="lg"
            startContent={<IconPlus />}
            onPress={handleCreate}
          >
            Nouveau Plan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/80 dark:bg-[#1e293b]/50 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-xl rounded-2xl overflow-hidden group">
          <CardBody className="flex flex-row items-center gap-4 p-6 relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500"><IconCurrencyDollar size={80} /></div>
            <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400"><IconCurrencyDollar size={32} /></div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Plans Total</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.totalPlans}</h3>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/80 dark:bg-[#1e293b]/50 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-xl rounded-2xl overflow-hidden group">
          <CardBody className="flex flex-row items-center gap-4 p-6 relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500"><IconCheck size={80} /></div>
            <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"><IconCheck size={32} /></div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Plans Actifs</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.activePlans}</h3>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-white/80 dark:bg-[#1e293b]/50 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-xl rounded-2xl overflow-hidden group">
          <CardBody className="flex flex-row items-center gap-4 p-6 relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500"><IconUsers size={80} /></div>
            <div className="p-4 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400"><IconUsers size={32} /></div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Utilisateurs</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.totalUsers}</h3>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-8 relative max-w-md">
        <Input
          placeholder="Rechercher un plan..."
          startContent={<IconSearch className="text-gray-400" />}
          value={searchTerm}
          onValueChange={setSearchTerm}
          variant="bordered"
          classNames={{
            inputWrapper: "bg-white/80 dark:bg-white/5 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-sm"
          }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
          <IconCurrencyDollar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Aucun plan trouvé</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan._id} className="bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-white/5 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex justify-between items-start pb-0">
                <div>
                  <Chip size="sm" variant="flat" color="primary" className="mb-2">{getCategoryName(plan)}</Chip>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.translations?.fr?.name || plan.name}
                  </h3>
                </div>
                <Chip
                  size="sm"
                  color={plan.active ? "success" : "danger"}
                  variant="dot"
                  classNames={{ base: "border-none" }}
                >
                  {plan.active ? "Actif" : "Inactif"}
                </Chip>
              </CardHeader>
              <CardBody>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{plan.priceMonthly || plan.price}</span>
                  <span className="text-sm font-medium text-gray-500">{plan.currency}</span>
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Chip size="sm" variant="flat" startContent={<IconClock size={14} />}>
                    {plan.paymentType === 'monthly' ? 'Mensuel' : plan.paymentType === 'yearly' ? 'Annuel' : 'Unique'}
                  </Chip>
                  {plan.accessDuration && (
                    <Chip size="sm" variant="flat" startContent={<IconClock size={14} />}>
                      {plan.accessDuration} jours
                    </Chip>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 min-h-[4.5em]">
                  {plan.translations?.fr?.description || plan.description || 'Aucune description'}
                </p>
              </CardBody>
              <CardFooter className="gap-2 pt-0">
                <Button fullWidth variant="flat" color="default" onPress={() => handleEdit(plan)} startContent={<IconEdit size={16} />}>
                  Modifier
                </Button>
                <Button isIconOnly color="warning" variant="light" onPress={() => handleToggleStatus(plan)}>
                  {plan.active ? <IconX size={20} /> : <IconCheck size={20} />}
                </Button>
                <Button isIconOnly color="danger" variant="light" onPress={() => handleDelete(plan)}>
                  <IconTrash size={20} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onOpenChange={setModalOpen} size="3xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {editingPlan ? 'Modifier le Plan' : 'Nouveau Plan'}
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Catégorie"
                    placeholder="Sélectionner catégorie"
                    selectedKeys={formData.categoryId ? [formData.categoryId] : []}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    isDisabled={!!editingPlan}
                  >
                    {categories.map(cat => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.translations?.fr?.name || cat.name}</SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Type Paiement"
                    selectedKeys={[formData.paymentType]}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  >
                    <SelectItem key="one_time" value="one_time">Unique</SelectItem>
                    <SelectItem key="monthly" value="monthly">Mensuel</SelectItem>
                    <SelectItem key="yearly" value="yearly">Annuel</SelectItem>
                  </Select>
                  <Input
                    type="number"
                    label="Prix"
                    placeholder="0.00"
                    value={formData.price}
                    onValueChange={(v) => setFormData({ ...formData, price: v })}
                    endContent={<span className="text-default-400 text-small">{formData.currency}</span>}
                  />
                  <Select
                    label="Devise"
                    selectedKeys={[formData.currency]}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <SelectItem key="TND" value="TND">TND</SelectItem>
                    <SelectItem key="EUR" value="EUR">EUR</SelectItem>
                    <SelectItem key="USD" value="USD">USD</SelectItem>
                  </Select>
                  {formData.paymentType === 'one_time' && (
                    <Input
                      type="number"
                      label="Durée (jours)"
                      value={formData.accessDuration}
                      onValueChange={(v) => setFormData({ ...formData, accessDuration: parseInt(v) })}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 my-4">
                  <Switch isSelected={formData.active} onValueChange={(v) => setFormData({ ...formData, active: v })}>
                    Plan Actif
                  </Switch>
                </div>

                <div className="border-t border-gray-100 dark:border-white/10 pt-4">
                  <div className="flex gap-2 mb-4">
                    {['fr', 'en', 'ar'].map(lang => (
                      <Button
                        key={lang}
                        size="sm"
                        variant={activeLang === lang ? "solid" : "bordered"}
                        color={activeLang === lang ? "primary" : "default"}
                        onPress={() => setActiveLang(lang)}
                      >
                        {lang.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <Input
                      label={`Nom (${activeLang.toUpperCase()})`}
                      value={formData.translations[activeLang]?.name || ''}
                      onValueChange={(v) => updateTranslation(activeLang, 'name', v)}
                    />
                    <Textarea
                      label={`Description (${activeLang.toUpperCase()})`}
                      value={formData.translations[activeLang]?.description || ''}
                      onValueChange={(v) => updateTranslation(activeLang, 'description', v)}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Annuler</Button>
                <Button color="primary" onPress={handleSubmit}>Enregistrer</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button isIconOnly variant="flat" isDisabled={page === 1} onPress={() => setPage(p => p - 1)}>
            <IconChevronLeft />
          </Button>
          <span className="font-semibold text-gray-600 dark:text-gray-300">Page {page} / {totalPages}</span>
          <Button isIconOnly variant="flat" isDisabled={page === totalPages} onPress={() => setPage(p => p + 1)}>
            <IconChevronRight />
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryPlanManagement;