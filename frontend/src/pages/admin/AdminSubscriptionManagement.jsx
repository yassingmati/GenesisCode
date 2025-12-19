import React, { useEffect, useState } from 'react';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button } from "@nextui-org/react";
import { IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { api } from '../components/common';

export default function AdminSubscriptionManagement() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubs();
    }, []);

    const fetchSubs = async () => {
        try {
            const { data } = await api.get('/admin/subscriptions');
            // Assuming the controller returns the array directly or in a wrapper
            setSubscriptions(Array.isArray(data) ? data : (data.subscriptions || []));
        } catch (error) {
            toast.error("Erreur chargement abonnements");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (subId) => {
        if (!window.confirm("Annuler cet abonnement ?")) return;
        try {
            await api.post('/admin/subscriptions/cancel', { subscriptionId: subId });
            toast.success("Abonnement annulé");
            fetchSubs();
        } catch (error) {
            toast.error("Erreur annulation");
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Gestion Abonnements</h1>
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
                                    <div className="flex flex-col">
                                        <span className="font-bold">{sub.user?.firstName} {sub.user?.lastName}</span>
                                        <span className="text-xs text-gray-500">{sub.user?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{sub.plan?.name || sub.plan}</TableCell>
                                <TableCell>
                                    <Chip size="sm" color={sub.status === 'active' ? 'success' : 'warning'}>
                                        {sub.status}
                                    </Chip>
                                </TableCell>
                                <TableCell>{new Date(sub.currentPeriodEnd).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {sub.status === 'active' && (
                                        <Button size="sm" color="danger" variant="light" startContent={<IconX size={16} />} onPress={() => handleCancel(sub._id)}>
                                            Annuler
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
