import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Card, CardBody, CardHeader,
    Button,
    Input,
    Textarea,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Select, SelectItem,
    Chip,
    Tooltip,
    User,
    Switch,
    Pagination,
    Divider,
    Tabs, Tab
} from "@nextui-org/react";
import {
    IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconSearch,
    IconCalendar, IconRefresh, IconUsers, IconListCheck, IconClipboardList
} from '@tabler/icons-react';

const TaskManagement = () => {
    // States
    const [templates, setTemplates] = useState([]);
    const [students, setStudents] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [activeTab, setActiveTab] = useState('templates');
    const [currentTemplate, setCurrentTemplate] = useState(null);

    // Search & Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Pagination
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

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
        fetchAssignedTasks();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tpls, usrs] = await Promise.all([
                getTaskTemplates(),
                getAllUsers()
            ]);
            setTemplates(tpls);
            const studentList = usrs.filter(u => u.userType === 'student' || u.role === 'student' || u.role === 'child');
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
            // Handle both array (legacy) and object (paginated) responses
            if (Array.isArray(tasks)) {
                setAssignedTasks(tasks);
            } else if (tasks && tasks.tasks && Array.isArray(tasks.tasks)) {
                setAssignedTasks(tasks.tasks);
            } else {
                setAssignedTasks([]);
            }
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
            // Default frequency to daily if missing
            const finalData = { ...formData };
            if (!finalData.recurrence.frequency) {
                finalData.recurrence.frequency = 'daily';
            }

            if (currentTemplate) {
                await updateTaskTemplate(currentTemplate._id, finalData);
            } else {
                await createTaskTemplate(finalData);
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
            fetchAssignedTasks(); // Refresh assigned tasks list
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
                recurrence: template.recurrence || { frequency: 'daily' },
                metrics: template.metrics || [],
                target: template.target || { exercises_submitted: 0, levels_completed: 0, hours_spent: 0 },
                active: template.active
            });
        } else {
            setCurrentTemplate(null);
            setFormData({
                title: '',
                description: '',
                recurrence: { frequency: 'daily' }, // Correct structure
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
            autoRenew: true // Default to auto-renew for daily tasks
        }));
        setShowAssignModal(true);
    };

    const handleSelectAllStudents = () => {
        if (assignData.childIds.length === students.length) {
            setAssignData(prev => ({ ...prev, childIds: [] }));
        } else {
            setAssignData(prev => ({ ...prev, childIds: students.map(s => s._id) }));
        }
    };

    // Filter assigned tasks
    const filteredAssignedTasks = useMemo(() => {
        return assignedTasks.filter(task => {
            const matchesSearch = (
                (task.templateId?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.childId?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.childId?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase())
            );

            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [assignedTasks, searchQuery, statusFilter]);

    // Pagination Logic for Assigned Tasks
    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredAssignedTasks.slice(start, end);
    }, [page, filteredAssignedTasks]);


    // NextUI Columns
    const templateColumns = [
        { name: "TITRE", uid: "title" },
        { name: "RÉCURRENCE", uid: "recurrence" },
        { name: "OBJECTIFS", uid: "targets" },
        { name: "STATUT", uid: "status" },
        { name: "ACTIONS", uid: "actions" },
    ];

    const assignedColumns = [
        { name: "TÂCHE", uid: "task" },
        { name: "ÉTUDIANT", uid: "student" },
        { name: "PÉRIODE", uid: "period" },
        { name: "STATUT", uid: "status" },
        { name: "ACTIONS", uid: "actions" },
    ];

    const renderTemplateCell = (tpl, columnKey) => {
        switch (columnKey) {
            case "title":
                return (
                    <div>
                        <p className="font-bold text-gray-800">{tpl.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{tpl.description}</p>
                    </div>
                );
            case "recurrence":
                const freq = tpl.recurrence?.frequency || tpl.recurrence?.type || 'daily';
                return (
                    <Chip size="sm" color={freq === 'daily' ? "primary" : "secondary"} variant="flat">
                        {freq === 'daily' ? 'Quotidien' : 'Mensuel'}
                    </Chip>
                );
            case "targets":
                return (
                    <div className="flex flex-wrap gap-1">
                        {tpl.metrics && tpl.metrics.length > 0 ? (
                            tpl.metrics.map(m => (
                                <Chip key={m} size="sm" variant="bordered" className="text-xs">
                                    {m.replace(/_/g, ' ')}: <b>{tpl.target[m]}</b>
                                </Chip>
                            ))
                        ) : (
                            <span className="text-gray-400 text-xs italic">Aucun</span>
                        )}
                    </div>
                );
            case "status":
                return tpl.active ? (
                    <Chip size="sm" color="success" variant="dot">Actif</Chip>
                ) : (
                    <Chip size="sm" color="danger" variant="dot">Inactif</Chip>
                );
            case "actions":
                return (
                    <div className="flex justify-end gap-2">
                        <Tooltip content="Assigner cette tâche">
                            <span
                                className="text-lg text-success cursor-pointer active:opacity-50"
                                onClick={() => openAssignModal(tpl)}
                            >
                                <IconPlus size={20} />
                            </span>
                        </Tooltip>
                        <Tooltip content="Modifier">
                            <span
                                className="text-lg text-primary cursor-pointer active:opacity-50"
                                onClick={() => openModal(tpl)}
                            >
                                <IconEdit size={20} />
                            </span>
                        </Tooltip>
                        <Tooltip content="Supprimer">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => handleDeleteTemplate(tpl._id)}
                            >
                                <IconTrash size={20} />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderAssignedCell = (task, columnKey) => {
        switch (columnKey) {
            case "task":
                return (
                    <div>
                        <p className="font-medium text-gray-900">{task.templateId?.title || 'Tâche supprimée'}</p>
                        {task.autoRenew && (
                            <Chip size="sm" variant="flat" color="secondary" className="mt-1 h-5 text-[10px]" startContent={<IconRefresh size={10} />}>
                                Auto-renew
                            </Chip>
                        )}
                    </div>
                );
            case "student":
                return task.childId ? (
                    <User
                        name={`${task.childId.firstName} ${task.childId.lastName}`}
                        description={task.childId.email}
                        avatarProps={{
                            src: task.childId.photo || `https://i.pravatar.cc/150?u=${task.childId._id}`,
                            size: "sm"
                        }}
                    />
                ) : (
                    <span className="text-gray-400 italic">Inconnu</span>
                );
            case "period":
                return (
                    <div className="text-xs text-gray-600">
                        <div className='flex items-center gap-1'><IconCalendar size={12} /> Du: {new Date(task.periodStart).toLocaleDateString('fr-FR')}</div>
                        <div className='flex items-center gap-1 pl-4'>Au: {new Date(task.periodEnd).toLocaleDateString('fr-FR')}</div>
                    </div>
                );
            case "status":
                return (
                    <Chip
                        size="sm"
                        color={task.status === 'completed' ? "success" : task.status === 'active' ? "primary" : "default"}
                        variant="flat"
                    >
                        {task.status === 'completed' ? 'Terminé' :
                            task.status === 'active' ? 'En cours' :
                                'En attente'}
                    </Chip>
                );
            case "actions":
                return (
                    <Tooltip content="Supprimer l'assignation">
                        <span
                            className="text-lg text-danger cursor-pointer active:opacity-50"
                            onClick={() => handleDeleteTask(task._id)}
                        >
                            <IconTrash size={18} />
                        </span>
                    </Tooltip>
                );
            default:
                return null;
        }
    };


    if (loading && templates.length === 0) return (
        <div className="flex justify-center items-center h-screen bg-gray-50/50 dark:bg-[#0f172a]">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 relative z-10"></div>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 max-w-[1600px] mx-auto min-h-screen"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 tracking-tight mb-2 flex items-center gap-3">
                        <IconClipboardList className="text-violet-500" size={36} />
                        Gestion des Tâches
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Gérez les modèles de tâches et assignez-les aux étudiants.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-white/80 dark:bg-[#1e293b]/50 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-xl rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                    <CardBody className="flex flex-row items-center gap-4 p-6 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
                            <IconClipboardList size={80} />
                        </div>
                        <div className="p-4 rounded-2xl bg-violet-500/20 text-violet-600 dark:text-violet-400">
                            <IconClipboardList size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Modèles Actifs</p>
                            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm">{templates.filter(t => t.active).length}</h3>
                        </div>
                    </CardBody>
                </Card>
                <Card className="bg-white/80 dark:bg-[#1e293b]/50 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-xl rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                    <CardBody className="flex flex-row items-center gap-4 p-6 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
                            <IconListCheck size={80} />
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            <IconListCheck size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tâches Assignées</p>
                            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm">{assignedTasks.length}</h3>
                        </div>
                    </CardBody>
                </Card>
                <Card className="bg-white/80 dark:bg-[#1e293b]/50 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-xl rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                    <CardBody className="flex flex-row items-center gap-4 p-6 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
                            <IconUsers size={80} />
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                            <IconUsers size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Étudiants</p>
                            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm">{students.length}</h3>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="flex flex-col gap-4">
                <Tabs
                    aria-label="Options"
                    selectedKey={activeTab}
                    onSelectionChange={setActiveTab}
                    color="primary"
                    variant="underlined"
                    classNames={{
                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                        cursor: "w-full bg-primary",
                        tab: "max-w-fit px-0 h-12",
                        tabContent: "group-data-[selected=true]:text-primary font-medium text-base"
                    }}
                >
                    <Tab key="templates" title={
                        <div className="flex items-center space-x-2">
                            <IconClipboardList />
                            <span>Modèles de Tâches</span>
                        </div>
                    }>
                        <Card className="shadow-sm border border-gray-100 mt-4">
                            <CardHeader className="flex justify-between items-center px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-800">Liste des Modèles</h3>
                                <Button
                                    color="primary"
                                    endContent={<IconPlus size={18} />}
                                    onPress={() => openModal()}
                                >
                                    Créer un Modèle
                                </Button>
                            </CardHeader>
                            <Divider />
                            <Table
                                aria-label="Table des modèles"
                                shadow="none"
                                removeWrapper
                            >
                                <TableHeader columns={templateColumns}>
                                    {(column) => (
                                        <TableColumn key={column.uid} align={column.uid === "actions" ? "end" : "start"}>
                                            {column.name}
                                        </TableColumn>
                                    )}
                                </TableHeader>
                                <TableBody items={templates}>
                                    {(item) => (
                                        <TableRow key={item._id}>
                                            {(columnKey) => <TableCell>{renderTemplateCell(item, columnKey)}</TableCell>}
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </Tab>

                    <Tab key="assigned" title={
                        <div className="flex items-center space-x-2">
                            <IconListCheck />
                            <span>Tâches Assignées</span>
                        </div>
                    }>
                        <Card className="shadow-sm border border-gray-100 mt-4">
                            <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-100">
                                <Input
                                    placeholder="Rechercher une tâche ou un étudiant..."
                                    value={searchQuery}
                                    onValueChange={setSearchQuery}
                                    startContent={<IconSearch size={18} className="text-default-400" />}
                                    className="max-w-md"
                                    size="sm"
                                    isClearable
                                />
                                <Select
                                    placeholder="Filter par statut"
                                    className="max-w-xs"
                                    size="sm"
                                    selectedKeys={[statusFilter]}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <SelectItem key="all" value="all">Tous</SelectItem>
                                    <SelectItem key="completed" value="completed" startContent={<IconCheck size={16} className="text-success" />}>Terminé</SelectItem>
                                    <SelectItem key="active" value="active" startContent={<IconRefresh size={16} className="text-primary" />}>En cours</SelectItem>
                                    <SelectItem key="pending" value="pending" startContent={<IconCalendar size={16} className="text-default-400" />}>En attente</SelectItem>
                                </Select>
                            </div>
                            <Table
                                aria-label="Table des tâches assignées"
                                shadow="none"
                                removeWrapper
                                bottomContent={
                                    <div className="flex w-full justify-center px-4 py-2">
                                        <Pagination
                                            isCompact
                                            showControls
                                            showShadow
                                            color="primary"
                                            page={page}
                                            total={Math.ceil(filteredAssignedTasks.length / rowsPerPage) || 1}
                                            onChange={(page) => setPage(page)}
                                        />
                                    </div>
                                }
                            >
                                <TableHeader columns={assignedColumns}>
                                    {(column) => (
                                        <TableColumn key={column.uid} align={column.uid === "actions" ? "end" : "start"}>
                                            {column.name}
                                        </TableColumn>
                                    )}
                                </TableHeader>
                                <TableBody items={items} emptyContent="Aucune tâche assignée trouvée.">
                                    {(item) => (
                                        <TableRow key={item._id}>
                                            {(columnKey) => <TableCell>{renderAssignedCell(item, columnKey)}</TableCell>}
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </Tab>
                </Tabs>
            </div>


            {/* Create/Edit Template Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                size="2xl"
                scrollBehavior="inside"
                backdrop="blur"
                className="light text-foreground"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {currentTemplate ? 'Modifier le Modèle' : 'Nouveau Modèle de Tâche'}
                            </ModalHeader>
                            <ModalBody>
                                <form id="templateForm" onSubmit={handleSubmit} className="space-y-6">
                                    <Input
                                        autoFocus
                                        label="Titre du modèle"
                                        placeholder="Ex: Exercices de Mathématiques"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        variant="bordered"
                                        isRequired
                                    />
                                    <Textarea
                                        label="Description"
                                        placeholder="Description détaillée de la tâche..."
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        variant="bordered"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            label="Type de récurrence"
                                            variant="bordered"
                                            selectedKeys={[formData.recurrence?.frequency || 'daily']}
                                            onChange={(e) => setFormData(prev => ({ ...prev, recurrence: { ...prev.recurrence, frequency: e.target.value } }))}
                                        >
                                            <SelectItem key="daily" value="daily" startContent={<IconRefresh size={18} />}>Quotidien</SelectItem>
                                            <SelectItem key="monthly" value="monthly" startContent={<IconCalendar size={18} />}>Mensuel</SelectItem>
                                        </Select>

                                        <div className="flex items-center px-2">
                                            <Switch
                                                isSelected={formData.active}
                                                onValueChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                                            >
                                                Modèle Actif
                                            </Switch>
                                        </div>
                                    </div>

                                    <Divider />

                                    <div>
                                        <p className="text-sm font-semibold mb-3">Métriques à suivre</p>
                                        <div className="flex flex-wrap gap-4 mb-4">
                                            {['exercises_submitted', 'levels_completed', 'hours_spent'].map(metric => (
                                                <Chip
                                                    key={metric}
                                                    variant={formData.metrics.includes(metric) ? "solid" : "bordered"}
                                                    color={formData.metrics.includes(metric) ? "primary" : "default"}
                                                    onClick={() => handleMetricToggle(metric)}
                                                    className="cursor-pointer select-none"
                                                    startContent={formData.metrics.includes(metric) ? <IconCheck size={14} /> : <IconPlus size={14} />}
                                                >
                                                    {metric.replace(/_/g, ' ')}
                                                </Chip>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
                                            <Input
                                                type="number"
                                                label="Exercices à soumettre"
                                                name="target.exercises_submitted"
                                                value={formData.target.exercises_submitted}
                                                onChange={handleInputChange}
                                                variant="bordered"
                                                min="0"
                                                isDisabled={!formData.metrics.includes('exercises_submitted')}
                                            />
                                            <Input
                                                type="number"
                                                label="Niveaux à compléter"
                                                name="target.levels_completed"
                                                value={formData.target.levels_completed}
                                                onChange={handleInputChange}
                                                variant="bordered"
                                                min="0"
                                                isDisabled={!formData.metrics.includes('levels_completed')}
                                            />
                                            <Input
                                                type="number"
                                                label="Heures à passer"
                                                name="target.hours_spent"
                                                value={formData.target.hours_spent}
                                                onChange={handleInputChange}
                                                variant="bordered"
                                                min="0"
                                                step="0.5"
                                                isDisabled={!formData.metrics.includes('hours_spent')}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Annuler
                                </Button>
                                <Button color="primary" type="submit" form="templateForm">
                                    Enregistrer
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>


            {/* Assign Modal */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                size="lg"
                backdrop="blur"
                className="light text-foreground"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Assigner une Tâche</ModalHeader>
                            <ModalBody>
                                <form id="assignForm" onSubmit={handleAssignSubmit} className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium">Sélectionner les Étudiants</p>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            color="primary"
                                            onPress={handleSelectAllStudents}
                                        >
                                            {assignData.childIds.length === students.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                        </Button>
                                    </div>

                                    <Select
                                        label="Étudiants"
                                        selectionMode="multiple"
                                        placeholder="Choisir des étudiants"
                                        selectedKeys={new Set(assignData.childIds)}
                                        onSelectionChange={(keys) => {
                                            setAssignData(prev => ({ ...prev, childIds: Array.from(keys) }));
                                        }}
                                        variant="bordered"
                                        classNames={{
                                            trigger: "min-h-unit-12 py-2"
                                        }}
                                        renderValue={(items) => {
                                            return (
                                                <div className="flex flex-wrap gap-2">
                                                    {items.map((item) => (
                                                        <Chip key={item.key} size="sm">{item.textValue}</Chip>
                                                    ))}
                                                </div>
                                            );
                                        }}
                                    >
                                        {students.map((student) => (
                                            <SelectItem key={student._id} textValue={`${student.firstName} ${student.lastName}`}>
                                                <div className="flex gap-2 items-center">
                                                    <User
                                                        name={`${student.firstName} ${student.lastName}`}
                                                        description={student.email}
                                                        avatarProps={{
                                                            size: "sm",
                                                            src: `https://i.pravatar.cc/150?u=${student._id}`
                                                        }}
                                                    />
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            type="date"
                                            label="Date de début"
                                            value={assignData.startDate}
                                            onChange={(e) => setAssignData(prev => ({ ...prev, startDate: e.target.value }))}
                                            variant="bordered"
                                        />
                                        <Input
                                            type="date"
                                            label="Date de fin"
                                            value={assignData.endDate}
                                            onChange={(e) => setAssignData(prev => ({ ...prev, endDate: e.target.value }))}
                                            variant="bordered"
                                        />
                                    </div>

                                    <Card className="bg-primary-50 border-primary-100 shadow-none">
                                        <CardBody>
                                            <Switch
                                                isSelected={assignData.autoRenew}
                                                onValueChange={(checked) => setAssignData(prev => ({ ...prev, autoRenew: checked }))}
                                                color="primary"
                                            >
                                                <div className="flex flex-col gap-1 ml-2">
                                                    <span className="text-sm font-medium">Renouvellement Automatique</span>
                                                    <span className="text-xs text-gray-500">La tâche se renouvellera chaque jour.</span>
                                                </div>
                                            </Switch>
                                        </CardBody>
                                    </Card>
                                </form>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Annuler
                                </Button>
                                <Button color="success" className="text-white" type="submit" form="assignForm">
                                    Assigner ({assignData.childIds.length})
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </motion.div>
    );
};

export default TaskManagement;
