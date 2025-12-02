import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Select,
    SelectItem
} from "@nextui-org/react";
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { format } from 'date-fns';

export default function PromoCodesPanel() {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expirationDate: '',
        maxUsage: '',
        active: true
    });

    const loadPromoCodes = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/promo-codes');
            setPromoCodes(res.data.promoCodes);
        } catch (err) {
            console.error('Erreur chargement codes promo:', err);
            toast.error('Erreur chargement codes promo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPromoCodes();
    }, []);

    const handleSubmit = async (onClose) => {
        try {
            await api.post('/admin/promo-codes', formData);
            toast.success('Code promo créé avec succès');
            loadPromoCodes();
            onClose();
            setFormData({
                code: '',
                discountType: 'percentage',
                discountValue: '',
                expirationDate: '',
                maxUsage: '',
                active: true
            });
        } catch (err) {
            console.error('Erreur création code promo:', err);
            toast.error(err.response?.data?.message || 'Erreur lors de la création');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Codes Promo</h2>
                <Button color="primary" onPress={onOpen}>
                    Nouveau Code
                </Button>
            </div>

            <Card>
                <Table aria-label="Liste des codes promo">
                    <TableHeader>
                        <TableColumn>CODE</TableColumn>
                        <TableColumn>TYPE</TableColumn>
                        <TableColumn>VALEUR</TableColumn>
                        <TableColumn>EXPIRATION</TableColumn>
                        <TableColumn>USAGE</TableColumn>
                        <TableColumn>STATUT</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="Aucun code promo trouvé.">
                        {promoCodes.map((promo) => (
                            <TableRow key={promo._id}>
                                <TableCell className="font-bold">{promo.code}</TableCell>
                                <TableCell>
                                    {promo.type === 'percentage' ? 'Pourcentage' : 'Montant Fixe'}
                                </TableCell>
                                <TableCell>
                                    {promo.type === 'percentage' ? `${promo.value}%` : `${promo.value} TND`}
                                </TableCell>
                                <TableCell>
                                    {promo.expiresAt ? format(new Date(promo.expiresAt), 'dd/MM/yyyy') : 'Illimité'}
                                </TableCell>
                                <TableCell>
                                    {promo.usedCount} / {promo.maxUses || '∞'}
                                </TableCell>
                                <TableCell>
                                    <Chip color={promo.active ? 'success' : 'danger'} size="sm">
                                        {promo.active ? 'Actif' : 'Inactif'}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <Button size="sm" color="danger" variant="light">
                                        Désactiver
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Créer un Code Promo</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Code"
                                    placeholder="EX: PROMO2025"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                />
                                <div className="flex gap-4">
                                    <Select
                                        label="Type de réduction"
                                        selectedKeys={[formData.discountType]}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <SelectItem key="percentage" value="percentage">Pourcentage (%)</SelectItem>
                                        <SelectItem key="fixed_amount" value="fixed_amount">Montant Fixe (TND)</SelectItem>
                                    </Select>
                                    <Input
                                        type="number"
                                        label="Valeur"
                                        placeholder="Ex: 20"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    />
                                </div>
                                <Input
                                    type="date"
                                    label="Date d'expiration (Optionnel)"
                                    value={formData.expirationDate}
                                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                />
                                <Input
                                    type="number"
                                    label="Usage Max (Optionnel)"
                                    placeholder="Laisser vide pour illimité"
                                    value={formData.maxUsage}
                                    onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Annuler
                                </Button>
                                <Button color="primary" onPress={() => handleSubmit(onClose)}>
                                    Créer
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
