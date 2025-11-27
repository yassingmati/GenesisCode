import React, { useState, useEffect } from 'react';
import {
    getTaskTemplates,
    createTaskTemplate,
    updateTaskTemplate,
    deleteTaskTemplate,
    assignTasks,
    getAssignedTasks,
    deleteAssignedTask
} from '../../services/taskService';
import { getAllUsers } from '../../services/userService';

const TaskManagement = () => {
    // States
    const [templates, setTemplates] = useState([]);
    const [students, setStudents] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    // const [showAssignedTasks, setShowAssignedTasks] = useState(false); // Removed in favor of tabs
    const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'assigned'
    const [currentTemplate, setCurrentTemplate] = useState(null);

    // Search & Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        recurrence: { type: 'daily' },
        metrics: [],
        target: {
            exercises_submitted: 0,
            levels_completed: 0,
            hours_spent: 0
        },
        active: true
    });

    const [assignData, setAssignData] = useState({
        templateId: '',
        childIds: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        autoRenew: false
    });

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tpls, usrs] = await Promise.all([
                getTaskTemplates(),
                getAllUsers()
            ]);
            setTemplates(tpls);
            const studentList = usrs.filter(u => u.userType === 'student');
            setStudents(studentList);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedTasks = async () => {
        try {
            const tasks = await getAssignedTasks();
            setAssignedTasks(tasks);
        } catch (error) {
            console.error("Error fetching assigned tasks:", error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche assignée ?')) {
            return;
        }

        try {
            await deleteAssignedTask(taskId);
            fetchAssignedTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce modèle ? Cela n\'affectera pas les tâches déjà assignées.')) {
            return;
        }

        try {
            await deleteTaskTemplate(templateId);
            fetchData();
        } catch (error) {
            console.error("Error deleting template:", error);
            alert('Erreur lors de la suppression du modèle');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('target.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                target: { ...prev.target, [field]: Number(value) }
            }));
        } else if (name === 'recurrenceType') {
            setFormData(prev => ({ ...prev, recurrence: { type: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMetricToggle = (metric) => {
        setFormData(prev => {
            const metrics = prev.metrics.includes(metric)
                ? prev.metrics.filter(m => m !== metric)
                : [...prev.metrics, metric];
            return { ...prev, metrics };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentTemplate) {
                await updateTaskTemplate(currentTemplate._id, formData);
            } else {
                await createTaskTemplate(formData);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error("Error saving template:", error);
        }
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        try {
            await assignTasks(assignData);
            setShowAssignModal(false);
            alert('Tâches assignées avec succès!');
        } catch (error) {
            console.error("Error assigning tasks:", error);
            alert('Erreur lors de l\'assignation');
        }
    };

    const openModal = (template = null) => {
        if (template) {
            setCurrentTemplate(template);
            setFormData({
                title: template.title,
                description: template.description,
                recurrence: template.recurrence,
                metrics: template.metrics,
                target: template.target,
                active: template.active
            });
        } else {
            setCurrentTemplate(null);
            setFormData({
                title: '',
                description: '',
                recurrence: { type: 'daily' },
                metrics: [],
                target: { exercises_submitted: 0, levels_completed: 0, hours_spent: 0 },
                active: true
            });
        }
        setShowModal(true);
    };

    const openAssignModal = (template) => {
        setAssignData(prev => ({
            ...prev,
            templateId: template._id,
            childIds: [],
            autoRenew: false
        }));
        setShowAssignModal(true);
    };

    const handleViewAssignedTasks = () => {
        fetchAssignedTasks();
        // setShowAssignedTasks(true); // Removed
    };

    const handleSelectAllStudents = () => {
        if (assignData.childIds.length === students.length) {
            setAssignData(prev => ({ ...prev, childIds: [] }));
        } else {
            setAssignData(prev => ({ ...prev, childIds: students.map(s => s._id) }));
        }
    };

    // Filter assigned tasks
    const filteredAssignedTasks = assignedTasks.filter(task => {
        const matchesSearch = (
            (task.templateId?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.childId?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.childId?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header & Tabs */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Gestion des Tâches</h1>
                    {activeTab === 'templates' && (
                        <button
                            onClick={() => openModal()}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center gap-2 font-medium"
                        >
                            <span className="text-xl">+</span> Créer un Modèle
                        </button>
                    )}
                </div>

                <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'templates'
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        📑 Modèles de Tâches
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('assigned');
                            fetchAssignedTasks();
                        }}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'assigned'
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        📋 Tâches Assignées
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'templates' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Titre</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Récurrence</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Objectifs</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {templates.map(tpl => (
                                    <tr key={tpl._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{tpl.title}</div>
                                            <div className="text-gray-500 text-xs mt-1 line-clamp-1">{tpl.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${tpl.recurrence.type === 'daily'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                : 'bg-purple-50 text-purple-700 border border-purple-100'
                                                }`}>
                                                {tpl.recurrence.type === 'daily' ? 'Quotidien' : 'Mensuel'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {tpl.metrics && tpl.metrics.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {tpl.metrics.map(m => (
                                                        <span key={m} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200" title={`${m.replace(/_/g, ' ')}: ${tpl.target[m]}`}>
                                                            {m.replace(/_/g, ' ')}: <b>{tpl.target[m]}</b>
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Aucun</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {tpl.active ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 font-medium">Actif</span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 font-medium">Inactif</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openAssignModal(tpl)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Assigner"
                                                >
                                                    ➕
                                                </button>
                                                <button
                                                    onClick={() => openModal(tpl)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTemplate(tpl._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Search & Filter Bar */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                        <div className="relative flex-1 min-w-[200px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Rechercher une tâche ou un étudiant..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Statut:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="all">Tous</option>
                                <option value="active">En cours</option>
                                <option value="completed">Terminé</option>
                                <option value="pending">En attente</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {filteredAssignedTasks.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-6xl mb-4">
                                    {assignedTasks.length === 0 ? '📋' : '🔍'}
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    {assignedTasks.length === 0 ? 'Aucune tâche assignée' : 'Aucun résultat'}
                                </h3>
                                <p className="text-gray-500">
                                    {assignedTasks.length === 0
                                        ? 'Assignez des modèles aux étudiants pour les voir apparaître ici.'
                                        : 'Aucune tâche ne correspond à vos critères de recherche.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tâche</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Étudiant</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Période</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredAssignedTasks.map(task => (
                                            <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900">{task.templateId?.title || 'Tâche supprimée'}</div>
                                                    {task.autoRenew && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-purple-600 mt-1 bg-purple-50 px-2 py-0.5 rounded-full w-fit">
                                                            🔄 Auto-renew
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-gray-600">
                                                    {task.childId ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                                {task.childId.firstName[0]}
                                                            </div>
                                                            {task.childId.firstName} {task.childId.lastName}
                                                        </div>
                                                    ) : 'Étudiant inconnu'}
                                                </td>
                                                <td className="p-4 text-gray-600 text-sm">
                                                    {new Date(task.periodStart).toLocaleDateString('fr-FR')} - {new Date(task.periodEnd).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        task.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {task.status === 'completed' ? 'Terminé' :
                                                            task.status === 'active' ? 'En cours' :
                                                                'En attente'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteTask(task._id)}
                                                        className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Supprimer l'assignation"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">
                            {currentTemplate ? 'Modifier le Modèle' : 'Nouveau Modèle'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Ex: Exercices de Mathématiques"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    rows="3"
                                    placeholder="Description de la tâche..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type de récurrence</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, recurrence: { type: 'daily' } }))}
                                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${formData.recurrence.type === 'daily'
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        Quotidien
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, recurrence: { type: 'monthly' } }))}
                                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${formData.recurrence.type === 'monthly'
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        Mensuel
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Métriques à suivre</label>
                                <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    {['exercises_submitted', 'levels_completed', 'hours_spent'].map(metric => (
                                        <label key={metric} className="flex items-center p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.metrics.includes(metric)}
                                                onChange={() => handleMetricToggle(metric)}
                                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                            />
                                            <span className="ml-3 text-sm text-gray-700 capitalize">{metric.replace(/_/g, ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Exercices</label>
                                    <input
                                        type="number"
                                        name="target.exercises_submitted"
                                        value={formData.target.exercises_submitted}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Niveaux</label>
                                    <input
                                        type="number"
                                        name="target.levels_completed"
                                        value={formData.target.levels_completed}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Heures</label>
                                    <input
                                        type="number"
                                        name="target.hours_spent"
                                        value={formData.target.hours_spent}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        min="0"
                                        step="0.5"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">Modèle Actif</span>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-sm transition-all hover:shadow"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Assigner une Tâche</h2>
                        <form onSubmit={handleAssignSubmit} className="space-y-5">
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Sélectionner les Étudiants
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleSelectAllStudents}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        {assignData.childIds.length === students.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                    </button>
                                </div>
                                <select
                                    multiple
                                    className="w-full border border-gray-300 rounded-xl p-3 h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={assignData.childIds}
                                    onChange={(e) => {
                                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                                        setAssignData(prev => ({ ...prev, childIds: selected }));
                                    }}
                                >
                                    {students.map(s => (
                                        <option key={s._id} value={s._id}>
                                            {s.firstName} {s.lastName} ({s.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1.5">Maintenez Ctrl/Cmd pour sélectionner plusieurs étudiants</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de début</label>
                                    <input
                                        type="date"
                                        value={assignData.startDate}
                                        onChange={(e) => setAssignData(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de fin</label>
                                    <input
                                        type="date"
                                        value={assignData.endDate}
                                        onChange={(e) => setAssignData(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                <label className="flex items-start cursor-pointer">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            id="autoRenew"
                                            checked={assignData.autoRenew}
                                            onChange={(e) => setAssignData(prev => ({ ...prev, autoRenew: e.target.checked }))}
                                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 mt-0.5"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="autoRenew" className="font-medium text-gray-700">Renouvellement automatique</label>
                                        <p className="text-gray-500 mt-0.5 text-xs">
                                            La tâche se renouvellera chaque jour jusqu'à suppression manuelle.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-sm transition-all hover:shadow"
                                >
                                    Assigner les Tâches
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskManagement;
