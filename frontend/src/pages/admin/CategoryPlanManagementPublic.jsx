import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FiEdit,
    FiTrash2,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiChevronLeft,
    FiChevronRight,
    FiDollarSign,
    FiClock,
    FiUsers,
    FiCheckCircle,
    FiXCircle,
    FiX
} from 'react-icons/fi';
import axios from 'axios';

// Configuration API - SANS AUTHENTIFICATION pour test
const API_BASE = 'https://codegenesis-backend.onrender.com';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Intercepteur pour l'authentification - DÉSACTIVÉ pour test
api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const CategoryPlanManagementPublic = () => {
    const [plans, setPlans] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    // États pour pagination et recherche
    const [page, setPage] = useState(1);
    const [limit] = useState(9);
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

    // Debounce search
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
        setError(null);
        try {
            const [plansRes, categoriesRes, statsRes] = await Promise.all([
                api.get('/api/admin/test-category-plans', {
                    params: { page, limit, search: debouncedSearch }
                }),
                api.get('/api/categories'),
                api.get('/api/admin/test-category-plans/stats')
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
            console.error('❌ Erreur lors du chargement:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement des données');
            toast.error('Erreur lors du chargement des données');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            if (editingPlan) {
                await api.put(`/api/admin/test-category-plans/${editingPlan._id}`, formData);
                toast.success('Plan mis à jour avec succès');
            } else {
                await api.post('/api/admin/test-category-plans', formData);
                toast.success('Plan créé avec succès');
            }

            setModalOpen(false);
            fetchData();

        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
            toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleDelete = async (plan) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le plan "${plan.translations?.fr?.name || plan.name || 'Sans nom'}" ?`)) {
            return;
        }

        try {
            await api.delete(`/api/admin/test-category-plans/${plan._id}`);
            toast.success('Plan supprimé avec succès');
            fetchData();
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const handleToggleStatus = async (plan) => {
        try {
            await api.patch(`/api/admin/test-category-plans/${plan._id}/toggle`, {
                active: !plan.active
            });
            toast.success(`Plan ${!plan.active ? 'activé' : 'désactivé'} avec succès`);
            fetchData();
        } catch (error) {
            console.error('❌ Erreur lors du changement de statut:', error);
            toast.error('Erreur lors du changement de statut');
        }
    };

    const updateTranslation = (lang, field, value) => {
        setFormData(prev => ({
            ...prev,
            translations: {
                ...prev.translations,
                [lang]: {
                    ...prev.translations[lang],
                    [field]: value
                }
            }
        }));
    };

    const getCategoryName = (plan) => {
        const cat = plan.category || plan.targetId;
        if (!cat) return 'Catégorie inconnue';
        return cat.translations?.fr?.name || cat.name || 'Catégorie sans nom';
    };

    const getPaymentTypeLabel = (plan) => {
        if (plan.interval === 'month' || plan.paymentType === 'monthly') return 'Mensuel';
        if (plan.interval === 'year' || plan.paymentType === 'yearly') return 'Annuel';
        return 'Achat unique';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Plans de Catégories
                            </h1>
                            <p className="text-slate-600 mt-2">Gérez les plans d'abonnement pour vos catégories</p>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
                        >
                            <FiPlus className="text-xl" />
                            Nouveau Plan
                        </button>
                    </div>

                    {/* Search & Controls */}
                    <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                            <input
                                type="text"
                                placeholder="Rechercher un plan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 font-medium"
                        >
                            <FiRefreshCw className="text-lg" />
                            Actualiser
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <FiDollarSign className="text-2xl" />
                            </div>
                            <span className="text-4xl font-bold">{stats.totalPlans}</span>
                        </div>
                        <p className="text-blue-100 font-medium">Plans Total</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <FiCheckCircle className="text-2xl" />
                            </div>
                            <span className="text-4xl font-bold">{stats.activePlans}</span>
                        </div>
                        <p className="text-green-100 font-medium">Plans Actifs</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <FiUsers className="text-2xl" />
                            </div>
                            <span className="text-4xl font-bold">{stats.totalUsers}</span>
                        </div>
                        <p className="text-purple-100 font-medium">Utilisateurs</p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
                        <FiXCircle className="text-xl flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                        <p className="text-slate-600 font-medium">Chargement des plans...</p>
                    </div>
                ) : plans.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiDollarSign className="text-4xl text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Aucun plan trouvé</h3>
                        <p className="text-slate-600 mb-6">Créez votre premier plan ou modifiez vos critères de recherche.</p>
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                        >
                            <FiPlus />
                            Créer un plan
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Plans Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {plans.map((plan) => (
                                <div
                                    key={plan._id}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-slate-800 mb-1">
                                                {getCategoryName(plan)}
                                            </h3>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${plan.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {plan.active ? <FiCheckCircle /> : <FiXCircle />}
                                                {plan.active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-slate-900">
                                                {plan.priceMonthly || plan.price}
                                            </span>
                                            <span className="text-lg text-slate-600">{plan.currency}</span>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                                            <FiClock />
                                            {getPaymentTypeLabel(plan)}
                                            {!plan.interval && plan.accessDuration && ` (${plan.accessDuration}j)`}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                        {plan.translations?.fr?.description || plan.description || 'Aucune description'}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 py-3 border-t border-slate-100 mb-4">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                                            <FiUsers className="text-blue-500" />
                                            <span>{plan.activeUsersCount || 0} utilisateurs</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(plan)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all duration-200 font-medium"
                                        >
                                            <FiEdit />
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(plan)}
                                            className={`px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${plan.active
                                                ? 'bg-orange-50 hover:bg-orange-100 text-orange-600'
                                                : 'bg-green-50 hover:bg-green-100 text-green-600'
                                                }`}
                                            title={plan.active ? 'Désactiver' : 'Activer'}
                                        >
                                            {plan.active ? <FiXCircle /> : <FiCheckCircle />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan)}
                                            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-200"
                                            title="Supprimer"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
                                >
                                    <FiChevronLeft />
                                    Précédent
                                </button>
                                <span className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-sm">
                                    Page {page} sur {totalPages}
                                </span>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
                                >
                                    Suivant
                                    <FiChevronRight />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {editingPlan ? 'Modifier le Plan' : 'Nouveau Plan'}
                            </h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200"
                            >
                                <FiX className="text-2xl text-slate-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Category Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Catégorie *
                                </label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                                    required
                                    disabled={!!editingPlan}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.translations?.fr?.name || category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price & Currency */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Prix *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Devise
                                    </label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option value="TND">TND</option>
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>

                            {/* Payment Type & Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Type de Paiement *
                                    </label>
                                    <select
                                        value={formData.paymentType}
                                        onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option value="one_time">Achat unique</option>
                                        <option value="monthly">Mensuel</option>
                                        <option value="yearly">Annuel</option>
                                    </select>
                                </div>
                                {formData.paymentType === 'one_time' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Durée d'accès (jours)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.accessDuration}
                                            onChange={(e) => setFormData(prev => ({ ...prev, accessDuration: parseInt(e.target.value) }))}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="active" className="text-sm font-semibold text-slate-700 cursor-pointer">
                                    Plan actif
                                </label>
                            </div>

                            {/* Language Tabs */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Traductions
                                </label>
                                <div className="flex gap-2 mb-4">
                                    {['fr', 'en', 'ar'].map(lang => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => setActiveLang(lang)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeLang === lang
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {lang.toUpperCase()}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">
                                            Nom ({activeLang.toUpperCase()})
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.translations[activeLang]?.name || ''}
                                            onChange={(e) => updateTranslation(activeLang, 'name', e.target.value)}
                                            placeholder="Nom du plan"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">
                                            Description ({activeLang.toUpperCase()})
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={formData.translations[activeLang]?.description || ''}
                                            onChange={(e) => updateTranslation(activeLang, 'description', e.target.value)}
                                            placeholder="Description du plan"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryPlanManagementPublic;
