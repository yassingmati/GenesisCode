import React, { useEffect, useState } from 'react';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button, Pagination } from "@nextui-org/react";
import { IconCreditCard, IconReceipt, IconTrendingUp, IconSearch } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { systemApi as api } from './components/common';
import { motion } from 'framer-motion';

export default function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Filter payments locally for search (since API pagination is strictly page-based here for now, 
    // ideally search should be backend-side, but let's filter current page for UX smoothness)
    const filteredPayments = payments.filter(p =>
        (p.user?.firstName && p.user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.user?.lastName && p.user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.user?.email && p.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.konnectPaymentId && p.konnectPaymentId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalRevenue = payments.reduce((acc, p) => p.status === 'completed' ? acc + (p.amount || 0) : acc, 0) / 1000;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 max-w-[1600px] mx-auto min-h-screen"
        >
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 tracking-tight mb-2 flex items-center gap-3">
                        <IconCreditCard className="text-emerald-500" size={36} />
                        Historique Paiements
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Suivi des transactions et revenus.</p>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 px-6 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-end">
                        <span className="text-xs uppercase font-bold text-emerald-600/70 dark:text-emerald-400/70 tracking-wider">Revenus (Page)</span>
                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">{totalRevenue.toFixed(2)} TND</span>
                    </div>
                </div>
            </div>

            <div className="mb-6 relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <IconSearch size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Rechercher une transaction..."
                    className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all shadow-sm backdrop-blur-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card className="bg-white/80 dark:bg-[#1e293b]/50 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl rounded-3xl overflow-hidden p-2">
                <Table
                    aria-label="Historique Paiements"
                    removeWrapper
                    classNames={{
                        th: "bg-gray-50/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs tracking-wider",
                        td: "py-4 group-data-[first=true]:first:before:rounded-none group-data-[first=true]:last:before:rounded-none",
                        table: "min-h-[400px]"
                    }}
                    bottomContent={
                        totalPages > 1 && (
                            <div className="flex w-full justify-center p-4">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="success"
                                    page={page}
                                    total={totalPages}
                                    onChange={(page) => setPage(page)}
                                    classNames={{
                                        cursor: "bg-emerald-500 shadow-emerald-500/20"
                                    }}
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
                        {filteredPayments.map((p) => (
                            <TableRow key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-default group">
                                <TableCell className="font-mono text-xs text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {p.konnectPaymentId || p._id}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-gray-900 dark:text-white">{p.user?.firstName} {p.user?.lastName}</span>
                                        <span className="text-xs text-gray-400">{p.user?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <Chip size="sm" variant="flat" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                                            {p.plan?.name || "Plan Inconnu"}
                                        </Chip>
                                        {p.plan?.type === 'CategoryPlan' && (
                                            <span className="text-[10px] text-purple-500 font-bold uppercase tracking-wider ml-1">
                                                Plan Spécifique
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        {(p.amount / 1000).toFixed(2)} {p.currency}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="sm"
                                        color={getStatusColor(p.status)}
                                        variant="dot"
                                        classNames={{
                                            base: "border-0 bg-transparent px-0 gap-2",
                                            dot: p.status === 'completed' ? "bg-emerald-500" : p.status === 'pending' ? "bg-amber-500" : "bg-red-500"
                                        }}
                                    >
                                        <span className={`capitalize font-medium ${p.status === 'completed' ? "text-emerald-600 dark:text-emerald-400" :
                                            p.status === 'pending' ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                                            }`}>
                                            {p.status}
                                        </span>
                                    </Chip>
                                </TableCell>
                                <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col">
                                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                                        <span className="text-gray-400 text-[10px]">{new Date(p.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </motion.div>
    );
}
