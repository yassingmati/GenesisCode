import React, { useEffect, useState } from 'react';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button, Pagination } from "@nextui-org/react";
import { IconCreditCard, IconReceipt } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { api } from '../components/common';

export default function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPayments();
    }, [page]);

    const fetchPayments = async () => {
        try {
            const { data } = await api.get(`/admin/payments/history?page=${page}&limit=20`);
            if (data.success) {
                setPayments(data.payments);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            toast.error("Impossible de charger l'historique");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'failed': return 'danger';
            default: return 'default';
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <IconCreditCard /> Historique des Paiements
            </h1>

            <Card>
                <Table aria-label="Historique Paiements" bottomContent={
                    totalPages > 1 && (
                        <div className="flex w-full justify-center">
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                page={page}
                                total={totalPages}
                                onChange={(page) => setPage(page)}
                            />
                        </div>
                    )
                }>
                    <TableHeader>
                        <TableColumn>ID TRANSACT.</TableColumn>
                        <TableColumn>UTILISATEUR</TableColumn>
                        <TableColumn>PLAN</TableColumn>
                        <TableColumn>MONTANT</TableColumn>
                        <TableColumn>STATUT</TableColumn>
                        <TableColumn>DATE</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="Aucun paiement trouvé" isLoading={loading}>
                        {payments.map((p) => (
                            <TableRow key={p._id}>
                                <TableCell className="font-mono text-xs text-gray-500">
                                    {p.konnectPaymentId || p._id}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{p.user?.firstName} {p.user?.lastName}</span>
                                        <span className="text-xs text-gray-400">{p.user?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{p.plan?.name || "Plan Inconnu"}</TableCell>
                                <TableCell className="font-bold">
                                    {(p.amount / 1000).toFixed(2)} {p.currency}
                                </TableCell>
                                <TableCell>
                                    <Chip size="sm" color={getStatusColor(p.status)} variant="flat">
                                        {p.status}
                                    </Chip>
                                </TableCell>
                                <TableCell className="text-xs">
                                    {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
