import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    User,
    Tooltip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@nextui-org/react";
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { format } from 'date-fns';
import { IconEye, IconTrash } from '@tabler/icons-react';

export default function UserManagementPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSubscriptions, setUserSubscriptions] = useState([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/users');
            setUsers(res.data.users);
        } catch (err) {
            console.error('Erreur chargement utilisateurs:', err);
            toast.error('Erreur chargement utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleViewSubscriptions = async (user) => {
        setSelectedUser(user);
        try {
            const res = await api.get(`/admin/subscriptions?search=${user.email}`);
            setUserSubscriptions(res.data.subscriptions);
            onOpen();
        } catch (err) {
            console.error('Erreur chargement abonnements:', err);
            toast.error('Impossible de charger les abonnements');
        }
    };

    const handleCancelSubscription = async (subscriptionId) => {
        if (!window.confirm('Annuler cet abonnement immédiatement ?')) return;

        try {
            await api.post('/admin/subscriptions/cancel', {
                subscriptionId,
                immediate: true
            });
            toast.success('Abonnement annulé');
            // Recharger la liste
            const res = await api.get(`/admin/subscriptions?search=${selectedUser.email}`);
            setUserSubscriptions(res.data.subscriptions);
        } catch (err) {
            console.error('Erreur annulation:', err);
            toast.error('Erreur lors de l\'annulation');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>

            <Card>
                <Table aria-label="Liste des utilisateurs">
                    <TableHeader>
                        <TableColumn>UTILISATEUR</TableColumn>
                        <TableColumn>ROLE</TableColumn>
                        <TableColumn>STATUT</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="Aucun utilisateur trouvé.">
                        {users.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>
                                    <User
                                        name={`${user.firstName} ${user.lastName}`}
                                        description={user.email}
                                        avatarProps={{ src: user.avatar }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip color={user.role === 'admin' ? 'warning' : 'default'} size="sm">
                                        {user.role}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <Chip color="success" size="sm" variant="dot">Actif</Chip>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Tooltip content="Voir abonnements">
                                            <Button isIconOnly size="sm" variant="light" onPress={() => handleViewSubscriptions(user)}>
                                                <IconEye size={20} />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Abonnements de {selectedUser?.firstName}</ModalHeader>
                            <ModalBody>
                                {userSubscriptions.length === 0 ? (
                                    <p className="text-gray-500">Aucun abonnement trouvé.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {userSubscriptions.map(sub => (
                                            <Card key={sub._id} className="p-4 border border-gray-200 shadow-none">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold">{sub.plan?.name}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            Expire le: {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'dd/MM/yyyy') : '-'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Chip color={sub.status === 'active' ? 'success' : 'danger'} size="sm">
                                                            {sub.status}
                                                        </Chip>
                                                        {sub.status === 'active' && (
                                                            <Button
                                                                size="sm"
                                                                color="danger"
                                                                variant="flat"
                                                                onPress={() => handleCancelSubscription(sub._id)}
                                                            >
                                                                Annuler
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={onClose}>Fermer</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
