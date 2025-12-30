import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem, Textarea } from "@nextui-org/react";
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { systemApi as api } from './components/common';

export default function PlansManagement() {
    const [plans, setPlans] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [editingPlan, setEditingPlan] = useState(null);

    const [formData, setFormData] = useState({
        _id: '',
        name: '',
        description: '',
        priceMonthly: 0,
        currency: 'TND',
        interval: 'month',
        type: 'global',
        targetId: '', // For Category or Path ID
        features: ''
    });

    useEffect(() => {
        fetchPlans();
        fetchMetadata();
    }, []);

    const fetchPlans = async () => {
        try {
            const { data } = await api.get('/admin/plans');
            if (data.success) setPlans(data.plans);
        } catch (error) {
            toast.error("Impossible de charger les plans");
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            // Need public or admin endpoints
            const [catsRes, pathsRes] = await Promise.all([
                api.get('/admin/categories'), // Use admin endpoint
                api.get('/courses/paths')      // Use courses endpoint
            ]).catch(() => [null, null]);

            if (catsRes && catsRes.data && Array.isArray(catsRes.data.categories)) {
                setCategories(catsRes.data.categories);
            } else if (catsRes && Array.isArray(catsRes.data)) {
                // Fallback in case endpoint format changes
                setCategories(catsRes.data);
            } else {
                setCategories([]);
            }

            if (pathsRes && Array.isArray(pathsRes.data)) {
                setPaths(pathsRes.data);
            } else {
                setPaths([]);
            }
        } catch (e) {
            console.log("Error loading metadata", e);
            setCategories([]);
            setPaths([]);
        }
    };

    const handleOpen = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                _id: plan._id,
                name: plan.name,
                description: plan.description,
                priceMonthly: plan.priceMonthly,
                currency: plan.currency,
                interval: plan.interval || 'month',
                type: plan.type || 'global',
                targetId: plan.targetId || '',
                features: plan.features.join('\n')
            });
        } else {
            setEditingPlan(null);
            setFormData({
                _id: '',
                name: '',
                description: '',
                priceMonthly: 0,
                currency: 'TND',
                interval: 'month',
                type: 'global',
                targetId: '',
                features: ''
            });
        }
        onOpen();
    };

    const handleSubmit = async (onClose) => {
        try {
            const payload = {
                ...formData,
                features: formData.features.split('\n').filter(f => f.trim() !== '')
            };

            if (editingPlan) {
                await api.put(`/admin/plans/${editingPlan._id}`, payload);
                toast.success("Plan mis à jour");
            } else {
                await api.post('/admin/plans', payload);
                toast.success("Plan créé");
            }
            fetchPlans();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer ce plan ?")) return;
        try {
            await api.delete(`/admin/plans/${id}`);
            toast.success("Plan supprimé");
            fetchPlans();
        } catch (error) {
            toast.error("Erreur suppression");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Gestion des Plans</h1>
                    <p className="text-gray-500">Configurer les offres d'abonnement</p>
                </div>
                <Button color="primary" startContent={<IconPlus />} onPress={() => handleOpen()}>
                    Nouveau Plan
                </Button>
            </div>

            <Card>
                <Table aria-label="Plans">
                    <TableHeader>
                        <TableColumn>ID</TableColumn>
                        <TableColumn>NOM</TableColumn>
                        <TableColumn>PRIX</TableColumn>
                        <TableColumn>TYPE</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="Aucun plan trouvé" isLoading={loading}>
                        {plans.map((plan) => (
                            <TableRow key={plan._id}>
                                <TableCell className="font-mono text-xs">{plan._id}</TableCell>
                                <TableCell>
                                    <span className="font-bold">{plan.name}</span>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{plan.description}</div>
                                </TableCell>
                                <TableCell>
                                    {(plan.priceMonthly / 1000).toFixed(2)} {plan.currency}
                                    <span className="text-xs text-gray-400">/{plan.interval}</span>
                                </TableCell>
                                <TableCell>
                                    <Chip size="sm" color={plan.type === 'global' ? "primary" : "secondary"}>
                                        {plan.type}
                                        {plan.targetId && <span className="ml-1 text-[10px] opacity-70">({plan.targetId})</span>}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button isIconOnly size="sm" variant="light" onPress={() => handleOpen(plan)}>
                                            <IconEdit size={18} />
                                        </Button>
                                        <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => handleDelete(plan._id)}>
                                            <IconTrash size={18} />
                                        </Button>
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
                            <ModalHeader>{editingPlan ? "Modifier Plan" : "Créer Plan"}</ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="ID Unique (slug)"
                                        placeholder="ex: pro-monthly"
                                        value={formData._id}
                                        onValueChange={(v) => setFormData({ ...formData, _id: v })}
                                        isDisabled={!!editingPlan}
                                    />
                                    <Input
                                        label="Nom Affiché"
                                        placeholder="ex: Abonnement Pro"
                                        value={formData.name}
                                        onValueChange={(v) => setFormData({ ...formData, name: v })}
                                    />
                                    <Input
                                        type="number"
                                        label="Prix (en millimes)"
                                        placeholder="30000 = 30 TND"
                                        value={formData.priceMonthly}
                                        onValueChange={(v) => setFormData({ ...formData, priceMonthly: Number(v) })}
                                    />
                                    <Select
                                        label="Intervalle"
                                        selectedKeys={[formData.interval]}
                                        onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                                    >
                                        <SelectItem key="month" value="month">Mensuel</SelectItem>
                                        <SelectItem key="year" value="year">Annuel</SelectItem>
                                    </Select>

                                    <Select
                                        label="Type d'accès"
                                        selectedKeys={[formData.type]}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <SelectItem key="global" value="global">Global (Tout le site)</SelectItem>
                                        <SelectItem key="category" value="category">Par Catégorie</SelectItem>
                                        <SelectItem key="path" value="path">Par Parcours</SelectItem>
                                    </Select>

                                    {/* DYNAMIC TARGET SELECTOR */}
                                    {formData.type === 'category' && (
                                        <Select
                                            items={categories}
                                            label="Choisir la Catégorie"
                                            placeholder="Sélectionner..."
                                            selectedKeys={formData.targetId ? [formData.targetId] : []}
                                            onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                                        >
                                            {(cat) => (
                                                <SelectItem key={cat._id} textValue={cat.name || (cat.translations && cat.translations.fr && cat.translations.fr.name) || cat._id}>
                                                    {cat.name || (cat.translations && cat.translations.fr && cat.translations.fr.name) || cat._id}
                                                </SelectItem>
                                            )}
                                        </Select>
                                    )}

                                    {formData.type === 'path' && (
                                        <Select
                                            items={paths}
                                            label="Choisir le Parcours"
                                            placeholder="Sélectionner..."
                                            selectedKeys={formData.targetId ? [formData.targetId] : []}
                                            onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                                        >
                                            {(p) => (
                                                <SelectItem key={p._id} textValue={p.name || (p.translations && p.translations.fr && p.translations.fr.name) || p._id}>
                                                    {p.name || (p.translations && p.translations.fr && p.translations.fr.name) || p._id}
                                                </SelectItem>
                                            )}
                                        </Select>
                                    )}

                                    <div className="col-span-2">
                                        <Textarea
                                            label="Fonctionnalités (une par ligne)"
                                            placeholder="- Accès illimité&#10;- Support priorité"
                                            value={formData.features}
                                            onValueChange={(v) => setFormData({ ...formData, features: v })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Textarea
                                            label="Description"
                                            value={formData.description}
                                            onValueChange={(v) => setFormData({ ...formData, description: v })}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>Annuler</Button>
                                <Button color="primary" onPress={() => handleSubmit(onClose)}>Sauvegarder</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
