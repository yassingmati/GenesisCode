import React, { useEffect, useState } from 'react';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Select, SelectItem, User as NextUser } from "@nextui-org/react";
import { IconX, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { systemApi as api } from './components/common';

export default function AdminSubscriptionManagement() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [plans, setPlans] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditChange } = useDisclosure();

    // Form Data
    const [editData, setEditData] = useState(null);
    const [createData, setCreateData] = useState({ userId: '', planId: '', status: 'active', periodEnd: '' });

    useEffect(() => {
        fetchSubs();
        fetchHelpers();
    }, []);

    const fetchHelpers = async () => {
        try {
            const [plansRes, usersRes] = await Promise.all([
                api.get('/admin/plans'),
                api.get('/admin/users')
            ]);
            setPlans(plansRes.data.plans || []);
            setUsers(usersRes.data.users || []);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchSubs = async () => {
        try {
            const { data } = await api.get('/admin/subscriptions');
            setSubscriptions(Array.isArray(data.subscriptions) ? data.subscriptions : []);
        } catch (error) {
            toast.error("Erreur chargement abonnements");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (onClose) => {
        try {
            await api.post('/admin/subscriptions', createData);
            toast.success("Abonnement créé");
            fetchSubs();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur création");
        }
    };

    const handleUpdate = async (onClose) => {
        try {
            await api.put('/admin/subscriptions/status', {
                subscriptionId: editData._id,
                status: editData.status,
                currentPeriodEnd: editData.currentPeriodEnd
            });
            toast.success("Abonnement mis à jour");
            fetchSubs();
            onClose();
        } catch (error) {
            toast.error("Erreur mise à jour");
        }
    };

    const handleDelete = async (subId) => {
        if (!window.confirm("Supprimer DÉFINITIVEMENT cet abonnement ?")) return;
        try {
            await api.delete(`/admin/subscriptions/${subId}`);
            toast.success("Abonnement supprimé");
            fetchSubs();
        } catch (error) {
            toast.error("Erreur suppression");
        }
    }

    const openEdit = (sub) => {
        setEditData({
            _id: sub._id,
            status: sub.status,
            currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.split('T')[0] : ''
        });
        onEditOpen();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestion Abonnements</h1>
                <Button color="primary" startContent={<IconPlus />} onPress={onCreateOpen}>
                    Nouvel Abonnement
                </Button>
            </div>

            <Card>
                <Table aria-label="Abonnements Actifs">
                    <TableHeader>
                        <TableColumn>UTILISATEUR</TableColumn>
                        <TableColumn>PLAN</TableColumn>
                        <TableColumn>STATUT</TableColumn>
                        <TableColumn>EXPIRATION</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="Aucun abonnement actif" isLoading={loading}>
                        {subscriptions.map(sub => (
                            <TableRow key={sub._id}>
                                <TableCell>
                                    <NextUser
                                        name={`${sub.user?.firstName || 'Inconnu'} ${sub.user?.lastName || ''}`}
                                        description={sub.user?.email}
                                    />
                                </TableCell>
                                <TableCell>{sub.plan?.name || sub.plan}</TableCell>
                                <TableCell>
                                    <Chip size="sm" color={sub.status === 'active' ? 'success' : sub.status === 'expired' ? 'danger' : 'warning'}>
                                        {sub.status}
                                    </Chip>
                                </TableCell>
                                <TableCell>{new Date(sub.currentPeriodEnd).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button isIconOnly size="sm" variant="light" onPress={() => openEdit(sub)}>
                                            <IconEdit size={16} />
                                        </Button>
                                        <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => handleDelete(sub._id)}>
                                            <IconTrash size={16} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* CREATE MODAL */}
            <Modal isOpen={isCreateOpen} onOpenChange={onCreateChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Créer Abonnement</ModalHeader>
                            <ModalBody>
                                <Select
                                    label="Utilisateur"
                                    placeholder="Choisir un utilisateur"
                                    onChange={(e) => setCreateData({ ...createData, userId: e.target.value })}
                                >
                                    {users.map(u => (
                                        <SelectItem key={u._id} value={u._id} textValue={u.email}>
                                            {u.firstName} {u.lastName} ({u.email})
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Plan"
                                    placeholder="Choisir un plan"
                                    onChange={(e) => setCreateData({ ...createData, planId: e.target.value })}
                                >
                                    {plans.map(p => (
                                        <SelectItem key={p._id} value={p._id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Statut Initial"
                                    defaultSelectedKeys={['active']}
                                    onChange={(e) => setCreateData({ ...createData, status: e.target.value })}
                                >
                                    <SelectItem key="active" value="active">Actif</SelectItem>
                                    <SelectItem key="pending" value="pending">En attente</SelectItem>
                                    <SelectItem key="gift" value="active">Cadeau (Actif)</SelectItem>
                                </Select>
                                <Input
                                    type="date"
                                    label="Date d'expiration (Optionnel)"
                                    value={createData.periodEnd}
                                    onValueChange={v => setCreateData({ ...createData, periodEnd: v })}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Annuler</Button>
                                <Button color="primary" onPress={() => handleCreate(onClose)}>Créer</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* EDIT MODAL */}
            <Modal isOpen={isEditOpen} onOpenChange={onEditChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Modifier Abonnement</ModalHeader>
                            <ModalBody>
                                {editData && (
                                    <>
                                        <Select
                                            label="Statut"
                                            selectedKeys={[editData.status]}
                                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                        >
                                            <SelectItem key="active" value="active">Actif</SelectItem>
                                            <SelectItem key="pending" value="pending">En attente</SelectItem>
                                            <SelectItem key="canceled" value="canceled">Annulé</SelectItem>
                                            <SelectItem key="expired" value="expired">Expiré</SelectItem>
                                        </Select>
                                        <Input
                                            type="date"
                                            label="Nouvelle date d'expiration"
                                            value={editData.currentPeriodEnd}
                                            onValueChange={v => setEditData({ ...editData, currentPeriodEnd: v })}
                                        />
                                    </>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Annuler</Button>
                                <Button color="primary" onPress={() => handleUpdate(onClose)}>Sauvegarder</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
