import React, { useEffect, useState } from 'react';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Select, SelectItem, User as NextUser, Tooltip, Pagination } from "@nextui-org/react";
import { IconX, IconPlus, IconEdit, IconTrash, IconPremiumRights, IconSearch, IconCheck, IconAlertCircle, IconCalendar, IconUser, IconCategory, IconShieldCheck, IconClock } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { systemApi as api } from './components/common';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSubscriptionManagement() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    // Modals
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditChange } = useDisclosure();

    // Form Data
    const [editData, setEditData] = useState(null);
    const [createData, setCreateData] = useState({
        userId: '',
        categoryId: '',
        accessType: 'purchase',
        status: 'active',
        expiresAt: ''
    });

    useEffect(() => {
        fetchSubs();
        fetchHelpers();
    }, []);

    const fetchHelpers = async () => {
        try {
            const [usersRes, categoriesRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/categories')
            ]);
            setUsers(usersRes.data.users || []);
            setCategories(categoriesRes.data.categories || []);
        } catch (error) {
            console.error('Error fetching helpers:', error);
            toast.error("Erreur lors du chargement des données");
        }
    }

    const fetchSubs = async () => {
        try {
            const { data } = await api.get('/admin/category-accesses');
            setSubscriptions(Array.isArray(data.accesses) ? data.accesses : []);
        } catch (error) {
            console.error(error);
            toast.error("Erreur chargement abonnements");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (onClose) => {
        try {
            await api.post('/admin/category-accesses', createData);
            toast.success("✅ Accès créé avec succès");
            fetchSubs();
            setCreateData({ userId: '', categoryId: '', accessType: 'purchase', status: 'active', expiresAt: '' });
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "❌ Erreur création");
        }
    };

    const handleUpdate = async (onClose) => {
        try {
            await api.put(`/admin/category-accesses/${editData._id}`, {
                status: editData.status,
                expiresAt: editData.expiresAt,
                accessType: editData.accessType
            });
            toast.success("✅ Accès mis à jour");
            fetchSubs();
            onClose();
        } catch (error) {
            toast.error("❌ Erreur mise à jour");
        }
    };

    const handleDelete = async (subId) => {
        if (!window.confirm("⚠️ Supprimer DÉFINITIVEMENT cet accès ?")) return;
        try {
            await api.delete(`/admin/category-accesses/${subId}`);
            toast.success("✅ Accès supprimé");
            fetchSubs();
        } catch (error) {
            toast.error("❌ Erreur suppression");
        }
    }

    const openEdit = (sub) => {
        setEditData({
            _id: sub._id,
            status: sub.status,
            expiresAt: sub.expiresAt ? sub.expiresAt.split('T')[0] : '',
            accessType: sub.accessType
        });
        onEditOpen();
    };

    // Filter and pagination
    const filteredSubs = subscriptions.filter(sub =>
        (sub.user?.email && sub.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.categoryName && sub.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const pages = Math.ceil(filteredSubs.length / rowsPerPage);
    const items = filteredSubs.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const getAccessTypeColor = (type) => {
        switch (type) {
            case 'free': return 'success';
            case 'purchase': return 'primary';
            case 'subscription': return 'secondary';
            case 'admin': return 'warning';
            default: return 'default';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'expired': return 'danger';
            case 'pending': return 'warning';
            case 'cancelled': return 'default';
            default: return 'default';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-8 max-w-[1920px] mx-auto min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
        >
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                                <IconPremiumRights className="text-white" size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                                    Gestion des Abonnements
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
                                    Gérez les accès par catégorie • {filteredSubs.length} accès total
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transition-all duration-300 font-bold text-base px-8 py-6"
                        size="lg"
                        startContent={<IconPlus size={22} strokeWidth={2.5} />}
                        onPress={onCreateOpen}
                        radius="lg"
                    >
                        Nouvel Accès
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <IconSearch className="text-gray-400" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher par email ou catégorie..."
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all shadow-lg hover:shadow-xl font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 shadow-lg">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">Actifs</p>
                                <p className="text-3xl font-black text-green-700 dark:text-green-300">
                                    {subscriptions.filter(s => s.status === 'active').length}
                                </p>
                            </div>
                            <IconShieldCheck className="text-green-500" size={40} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">Total</p>
                                <p className="text-3xl font-black text-blue-700 dark:text-blue-300">
                                    {subscriptions.length}
                                </p>
                            </div>
                            <IconCategory className="text-blue-500" size={40} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">En Attente</p>
                                <p className="text-3xl font-black text-amber-700 dark:text-amber-300">
                                    {subscriptions.filter(s => s.status === 'pending').length}
                                </p>
                            </div>
                            <IconClock className="text-amber-500" size={40} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-800 shadow-lg">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Expirés</p>
                                <p className="text-3xl font-black text-red-700 dark:text-red-300">
                                    {subscriptions.filter(s => s.status === 'expired').length}
                                </p>
                            </div>
                            <IconAlertCircle className="text-red-500" size={40} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Table Card */}
            <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-2xl rounded-3xl overflow-hidden">
                <Table
                    aria-label="Abonnements"
                    removeWrapper
                    bottomContent={
                        pages > 1 && (
                            <div className="flex w-full justify-center py-4">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="secondary"
                                    page={page}
                                    total={pages}
                                    onChange={(page) => setPage(page)}
                                />
                            </div>
                        )
                    }
                    classNames={{
                        th: "bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-rose-900/30 text-gray-800 dark:text-gray-200 font-black uppercase text-xs tracking-wider py-5 first:rounded-tl-2xl last:rounded-tr-2xl border-b-3 border-purple-200 dark:border-purple-800",
                        td: "py-6 border-b border-gray-100 dark:border-gray-800",
                        table: "min-h-[500px]"
                    }}
                >
                    <TableHeader>
                        <TableColumn>
                            <div className="flex items-center gap-2">
                                <IconUser size={16} />
                                UTILISATEUR
                            </div>
                        </TableColumn>
                        <TableColumn>
                            <div className="flex items-center gap-2">
                                <IconCategory size={16} />
                                CATÉGORIE
                            </div>
                        </TableColumn>
                        <TableColumn>TYPE D'ACCÈS</TableColumn>
                        <TableColumn>STATUT</TableColumn>
                        <TableColumn>
                            <div className="flex items-center gap-2">
                                <IconCalendar size={16} />
                                ACHETÉ LE
                            </div>
                        </TableColumn>
                        <TableColumn>EXPIRATION</TableColumn>
                        <TableColumn align="center">ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="Aucun accès trouvé" isLoading={loading} loadingContent="Chargement...">
                        {items.map(sub => (
                            <TableRow
                                key={sub._id}
                                className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all duration-200 cursor-default group"
                            >
                                <TableCell>
                                    <NextUser
                                        name={
                                            <span className="font-bold text-gray-900 dark:text-white text-base">
                                                {sub.user?.firstName ? `${sub.user.firstName} ${sub.user.lastName || ''}` : (sub.user?.email || 'Utilisateur')}
                                            </span>
                                        }
                                        description={
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                                {sub.user?.email || 'No Email'}
                                            </span>
                                        }
                                        avatarProps={{
                                            className: "ring-4 ring-offset-2 ring-purple-500/30 dark:ring-purple-500/20 w-12 h-12",
                                            size: "lg"
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="lg"
                                        variant="flat"
                                        className="bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-rose-900/40 text-purple-800 dark:text-purple-200 font-bold border-2 border-purple-300 dark:border-purple-700 px-4 py-5"
                                    >
                                        {sub.categoryName || 'Inconnue'}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="md"
                                        color={getAccessTypeColor(sub.accessType)}
                                        variant="flat"
                                        className="font-bold capitalize"
                                    >
                                        {sub.accessType || 'N/A'}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="md"
                                        color={getStatusColor(sub.status)}
                                        variant="dot"
                                        className="font-bold capitalize"
                                    >
                                        {sub.status}
                                    </Chip>
                                </TableCell>
                                <TableCell className="text-gray-700 dark:text-gray-300 font-semibold">
                                    {sub.purchasedAt ? new Date(sub.purchasedAt).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    }) : '-'}
                                </TableCell>
                                <TableCell>
                                    {sub.expiresAt ? (
                                        <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                            {new Date(sub.expiresAt).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    ) : (
                                        <Chip color="success" variant="flat" className="font-bold">
                                            ∞ Illimité
                                        </Chip>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Tooltip content="Modifier" color="primary">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                color="primary"
                                                variant="flat"
                                                onPress={() => openEdit(sub)}
                                                className="font-bold"
                                            >
                                                <IconEdit size={18} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content="Supprimer" color="danger">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                                onPress={() => handleDelete(sub._id)}
                                            >
                                                <IconTrash size={18} />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* CREATE MODAL */}
            <Modal
                isOpen={isCreateOpen}
                onOpenChange={onCreateChange}
                size="2xl"
                backdrop="blur"
                classNames={{
                    backdrop: "bg-gradient-to-t from-purple-900/50 to-pink-900/50 backdrop-opacity-20",
                    base: "border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900",
                    header: "border-b-2 border-purple-100 dark:border-purple-900",
                    body: "py-6",
                    footer: "border-t-2 border-purple-100 dark:border-purple-900"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex gap-3 items-center text-2xl font-black">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                    <IconPlus size={24} className="text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Créer un Nouvel Accès
                                </span>
                            </ModalHeader>
                            <ModalBody className="gap-5">
                                <Select
                                    label="Utilisateur"
                                    placeholder="Sélectionner un utilisateur"
                                    selectedKeys={createData.userId ? [createData.userId] : []}
                                    onChange={(e) => setCreateData({ ...createData, userId: e.target.value })}
                                    variant="bordered"
                                    size="lg"
                                    startContent={<IconUser size={20} className="text-purple-500" />}
                                    classNames={{
                                        trigger: "border-2 hover:border-purple-500 data-[hover=true]:border-purple-500",
                                        label: "font-bold text-base"
                                    }}
                                >
                                    {users.map(u => (
                                        <SelectItem key={u._id} value={u._id} textValue={u.email}>
                                            <div className="flex flex-col">
                                                <span className="font-bold">{u.firstName} {u.lastName}</span>
                                                <span className="text-sm text-gray-500">{u.email}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Catégorie"
                                    placeholder="Sélectionner une catégorie"
                                    selectedKeys={createData.categoryId ? [createData.categoryId] : []}
                                    onChange={(e) => setCreateData({ ...createData, categoryId: e.target.value })}
                                    variant="bordered"
                                    size="lg"
                                    startContent={<IconCategory size={20} className="text-purple-500" />}
                                    classNames={{
                                        trigger: "border-2 hover:border-purple-500 data-[hover=true]:border-purple-500",
                                        label: "font-bold text-base"
                                    }}
                                >
                                    {categories.map(c => (
                                        <SelectItem key={c._id} value={c._id}>
                                            {c.translations?.fr?.name || c.translations?.en?.name || 'Catégorie'}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Type d'Accès"
                                        selectedKeys={[createData.accessType]}
                                        onChange={(e) => setCreateData({ ...createData, accessType: e.target.value })}
                                        variant="bordered"
                                        size="lg"
                                        classNames={{
                                            trigger: "border-2 hover:border-purple-500",
                                            label: "font-bold"
                                        }}
                                    >
                                        <SelectItem key="free" value="free">🎁 Gratuit</SelectItem>
                                        <SelectItem key="purchase" value="purchase">💳 Achat</SelectItem>
                                        <SelectItem key="subscription" value="subscription">🔄 Abonnement</SelectItem>
                                        <SelectItem key="admin" value="admin">👑 Admin</SelectItem>
                                    </Select>
                                    <Select
                                        label="Statut"
                                        selectedKeys={[createData.status]}
                                        onChange={(e) => setCreateData({ ...createData, status: e.target.value })}
                                        variant="bordered"
                                        size="lg"
                                        classNames={{
                                            trigger: "border-2 hover:border-purple-500",
                                            label: "font-bold"
                                        }}
                                    >
                                        <SelectItem key="active" value="active">✅ Actif</SelectItem>
                                        <SelectItem key="pending" value="pending">⏳ En attente</SelectItem>
                                        <SelectItem key="expired" value="expired">❌ Expiré</SelectItem>
                                        <SelectItem key="cancelled" value="cancelled">🚫 Annulé</SelectItem>
                                    </Select>
                                </div>
                                <Input
                                    type="date"
                                    label="Date d'expiration"
                                    placeholder="Laisser vide pour accès illimité"
                                    value={createData.expiresAt}
                                    onValueChange={v => setCreateData({ ...createData, expiresAt: v })}
                                    variant="bordered"
                                    size="lg"
                                    startContent={<IconCalendar size={20} className="text-purple-500" />}
                                    classNames={{
                                        inputWrapper: "border-2 hover:border-purple-500",
                                        label: "font-bold text-base"
                                    }}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    variant="light"
                                    onPress={onClose}
                                    size="lg"
                                    className="font-bold"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 font-bold"
                                    onPress={() => handleCreate(onClose)}
                                    startContent={<IconCheck size={20} />}
                                    size="lg"
                                >
                                    Créer l'Accès
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* EDIT MODAL */}
            <Modal
                isOpen={isEditOpen}
                onOpenChange={onEditChange}
                backdrop="blur"
                size="xl"
                classNames={{
                    backdrop: "bg-gradient-to-t from-blue-900/50 to-purple-900/50 backdrop-opacity-20",
                    base: "border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900",
                    header: "border-b-2 border-blue-100 dark:border-blue-900",
                    body: "py-6",
                    footer: "border-t-2 border-blue-100 dark:border-blue-900"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex gap-3 items-center text-2xl font-black">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                                    <IconEdit size={24} className="text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Modifier l'Accès
                                </span>
                            </ModalHeader>
                            <ModalBody className="gap-5">
                                {editData && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Select
                                                label="Type d'Accès"
                                                selectedKeys={[editData.accessType]}
                                                onChange={(e) => setEditData({ ...editData, accessType: e.target.value })}
                                                variant="bordered"
                                                size="lg"
                                                classNames={{
                                                    trigger: "border-2 hover:border-blue-500",
                                                    label: "font-bold"
                                                }}
                                            >
                                                <SelectItem key="free" value="free">🎁 Gratuit</SelectItem>
                                                <SelectItem key="purchase" value="purchase">💳 Achat</SelectItem>
                                                <SelectItem key="subscription" value="subscription">🔄 Abonnement</SelectItem>
                                                <SelectItem key="admin" value="admin">👑 Admin</SelectItem>
                                            </Select>
                                            <Select
                                                label="Statut"
                                                selectedKeys={[editData.status]}
                                                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                                variant="bordered"
                                                size="lg"
                                                classNames={{
                                                    trigger: "border-2 hover:border-blue-500",
                                                    label: "font-bold"
                                                }}
                                            >
                                                <SelectItem key="active" value="active">✅ Actif</SelectItem>
                                                <SelectItem key="pending" value="pending">⏳ En attente</SelectItem>
                                                <SelectItem key="cancelled" value="cancelled">🚫 Annulé</SelectItem>
                                                <SelectItem key="expired" value="expired">❌ Expiré</SelectItem>
                                            </Select>
                                        </div>
                                        <Input
                                            type="date"
                                            label="Nouvelle date d'expiration"
                                            value={editData.expiresAt}
                                            onValueChange={v => setEditData({ ...editData, expiresAt: v })}
                                            variant="bordered"
                                            size="lg"
                                            startContent={<IconCalendar size={20} className="text-blue-500" />}
                                            classNames={{
                                                inputWrapper: "border-2 hover:border-blue-500",
                                                label: "font-bold text-base"
                                            }}
                                        />
                                    </>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    variant="light"
                                    onPress={onClose}
                                    size="lg"
                                    className="font-bold"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={() => handleUpdate(onClose)}
                                    startContent={<IconCheck size={20} />}
                                    className="font-bold"
                                    size="lg"
                                >
                                    Sauvegarder
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </motion.div>
    );
}
