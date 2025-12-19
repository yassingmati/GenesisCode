import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Switch, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import PromoCodeModal from '../PromoCodeModal';
import { IconCreditCard, IconHistory, IconLock, IconLockOpen, IconCheck } from '@tabler/icons-react';

export default function PaymentControlWidget({ childId }) {
    const [plans, setPlans] = useState([]);
    const [showPlans, setShowPlans] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [history, setHistory] = useState([]);
    const [allowPurchases, setAllowPurchases] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://codegenesis-backend.onrender.com';

                // 1. Fetch Subscription
                try {
                    const subResponse = await fetch(`${API_BASE_URL}/api/subscriptions/user/${childId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (subResponse.ok) {
                        const subData = await subResponse.json();
                        const subs = subData.subscriptions || (Array.isArray(subData) ? subData : [subData]);

                        // Filter active ones
                        const activeSubs = subs.filter(s => s.status === 'active' || s.status === 'trialing');

                        setSubscription(activeSubs.length > 0 ? activeSubs : null);
                    } else {
                        setSubscription(null);
                    }
                } catch (e) {
                    console.error("Fetch subs error", e);
                    setSubscription(null);
                }

                // 2. Fetch History
                try {
                    const historyResponse = await fetch(`${API_BASE_URL}/api/payments/history/${childId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (historyResponse.ok) {
                        const historyData = await historyResponse.json();
                        setHistory(historyData);
                    } else {
                        setHistory([]);
                    }
                } catch (e) {
                    setHistory([]);
                }

                // 3. Fetch Settings
                const savedSettings = localStorage.getItem(`payment_settings_${childId}`);
                if (savedSettings) {
                    setAllowPurchases(JSON.parse(savedSettings).allowPurchases);
                }

            } catch (error) {
                console.error("Error fetching payment data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (childId) {
            loadData();
        }
    }, [childId]);

    const loadPlans = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
            const response = await fetch(`${API_BASE_URL}/api/subscriptions/plans`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPlans(data.plans || []);
                setShowPlans(true);
            }
        } catch (error) {
            console.error("Error loading plans:", error);
            alert("Erreur lors du chargement des plans");
        }
    };



    const [showPromoModal, setShowPromoModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    // Removed duplicate states: promoCode, promoError, promoSuccess, appliedDiscount

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setShowPromoModal(true);
    };

    const confirmSubscription = async (validatedPromoCode) => {
        if (!selectedPlan) return;
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

            const response = await fetch(`${API_BASE_URL}/api/subscriptions/subscribe`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    planId: selectedPlan._id || selectedPlan.id,
                    childId,
                    promoCode: validatedPromoCode || null,
                    returnUrl: window.location.href
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.paymentUrl) {
                    window.location.href = data.paymentUrl;
                } else {
                    alert('Abonnement activé avec succès !');
                    setShowPlans(false);
                    setShowPromoModal(false);
                    window.location.reload();
                }
            } else {
                alert(data.message || 'Erreur lors de la souscription');
                setShowPromoModal(false); // Close on error to retry? Or keep open? User preference usually to retry.
            }
        } catch (error) {
            console.error("Error subscribing:", error);
            alert("Erreur lors de la souscription");
        } finally {
            setProcessing(false);
        }
    };

    const togglePurchases = (value) => {
        setAllowPurchases(value);
        localStorage.setItem(`payment_settings_${childId}`, JSON.stringify({ allowPurchases: value }));
    };

    // Calculation helper
    // Removed getFinalPrice as it's now handled by PromoCodeModal

    return (
        <div className="space-y-6">
            {/* Subscriptions Card */}
            <Card className="border-none bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/20">
                <CardBody className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <IconCreditCard /> Abonnements Actifs
                        </h3>
                        <Button
                            size="sm"
                            className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/30"
                            onPress={loadPlans}
                        >
                            Ajouter / Changer
                        </Button>
                    </div>

                    {Array.isArray(subscription) && subscription.length > 0 ? (
                        <div className="space-y-4">
                            {subscription.map((sub, idx) => (
                                <div key={sub._id || idx} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10 flex justify-between items-center">
                                    <div>
                                        <p className="text-lg font-bold text-white">{sub.plan?.name || sub.categoryPlan?.name || 'Plan Inconnu'}</p>
                                        <div className="text-sm text-purple-100 flex gap-4 mt-1">
                                            <span>Prix: {sub.plan?.priceMonthly ? `${(sub.plan.priceMonthly / 1000).toFixed(0)} DT` : 'Gratuit'}</span>
                                            <span>Renouvellement: {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '-'}</span>
                                        </div>
                                    </div>
                                    <Chip
                                        color={sub.status === 'active' ? "success" : "warning"}
                                        variant="solid"
                                        classNames={{ content: "font-bold" }}
                                    >
                                        {sub.status.toUpperCase()}
                                    </Chip>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-purple-100 font-medium mb-1">Aucun abonnement actif</p>
                            <p className="text-sm text-purple-200">Votre enfant utilise le plan Gratuit par défaut.</p>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Controls & History Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Controls */}
                <Card className="lg:col-span-1">
                    <CardHeader className="font-bold text-lg px-6 py-4">
                        Contrôle des Achats
                    </CardHeader>
                    <CardBody className="px-6 py-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2 text-gray-700">
                                {allowPurchases ? <IconLockOpen size={20} className="text-green-500" /> : <IconLock size={20} className="text-red-500" />}
                                <span>Autoriser les achats</span>
                            </div>
                            <Switch
                                isSelected={allowPurchases}
                                onValueChange={togglePurchases}
                                color="success"
                            />
                        </div>
                        <p className="text-sm text-gray-500">
                            Si désactivé, votre enfant ne pourra effectuer aucun achat in-app sans votre approbation.
                        </p>
                    </CardBody>
                </Card>

                {/* History */}
                <Card className="lg:col-span-2">
                    <CardHeader className="font-bold text-lg px-6 py-4 flex items-center gap-2">
                        <IconHistory size={20} /> Historique des Transactions
                    </CardHeader>
                    <CardBody>
                        {/* Desktop Table */}
                        <div className="hidden md:block">
                            <Table aria-label="Historique des paiements" removeWrapper>
                                <TableHeader>
                                    <TableColumn>DATE</TableColumn>
                                    <TableColumn>DESCRIPTION</TableColumn>
                                    <TableColumn>MONTANT</TableColumn>
                                    <TableColumn>STATUT</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {history.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="font-bold">{item.amount}</TableCell>
                                            <TableCell>
                                                <Chip size="sm" color="success" variant="flat">
                                                    {item.status}
                                                </Chip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {history.map((item) => (
                                <div key={item.id} className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-medium text-gray-800 dark:text-gray-200">{item.description}</div>
                                        <Chip size="sm" color="success" variant="flat" className="h-6 text-xs">
                                            {item.status}
                                        </Chip>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                                        <span className="font-bold text-lg text-gray-900 dark:text-white">{item.amount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {history.length === 0 && (
                            <div className="text-center py-4 text-gray-500">Aucune transaction récente.</div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Plans List Modal */}
            <Modal
                isOpen={showPlans}
                onOpenChange={setShowPlans}
                size="4xl"
                scrollBehavior="inside"
                backdrop="blur"
                classNames={{
                    base: "bg-slate-900/95 dark:bg-slate-900/95 text-white border border-white/10 shadow-2xl",
                    header: "border-b border-white/10",
                    body: "p-6",
                    closeButton: "hover:bg-white/10 active:bg-white/20 text-white"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Choisir un forfait d'apprentissage
                                </h2>
                                <p className="text-sm text-gray-400 font-normal">
                                    Débloquez l'accès complet aux parcours et exercices.
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {plans.map((plan, index) => {
                                        const isPopular = index === 1; // Arbitrary highlight for design
                                        const price = plan.priceMonthly ? (plan.priceMonthly / 1000).toLocaleString('fr-TN', { minimumFractionDigits: 0 }) : '0';

                                        return (
                                            <Card
                                                key={plan._id || plan.id}
                                                isPressable
                                                onPress={() => handleSelectPlan(plan)}
                                                className={`
                                                    border-2 transition-all duration-300 relative overflow-visible group
                                                    ${isPopular
                                                        ? 'bg-gradient-to-b from-indigo-900/50 to-slate-900/50 border-indigo-500 shadow-indigo-500/20 shadow-xl scale-[1.02]'
                                                        : 'bg-slate-800/50 border-gray-700 hover:border-indigo-400/50 hover:bg-slate-800'}
                                                `}
                                            >
                                                {isPopular && (
                                                    <Chip
                                                        className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 font-bold uppercase tracking-wider text-[10px]"
                                                        color="primary"
                                                        variant="shadow"
                                                    >
                                                        Recommandé
                                                    </Chip>
                                                )}

                                                <CardBody className="p-6 text-center relative z-10">
                                                    {/* Glow effect */}
                                                    <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                                    <h3 className={`text-xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-gray-200'}`}>
                                                        {plan.name}
                                                    </h3>

                                                    <div className="my-6">
                                                        <div className="flex items-end justify-center gap-1">
                                                            <span className="text-4xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                                                                {price}
                                                            </span>
                                                            <span className="text-lg font-bold text-indigo-400 mb-1">DT</span>
                                                        </div>
                                                        <span className="text-sm text-gray-500">/ mois</span>
                                                    </div>

                                                    <div className="space-y-3 mb-8 text-left">
                                                        {plan.features?.map((feature, i) => (
                                                            <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                                                <div className="mt-1 min-w-[16px]">
                                                                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                                                        <IconCheck size={10} className="text-green-400" />
                                                                    </div>
                                                                </div>
                                                                <span className="opacity-90 leading-tight">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <Button
                                                        className={`w-full font-bold shadow-lg ${isPopular
                                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/20'
                                                            : 'bg-slate-700 text-white hover:bg-slate-600'
                                                            }`}
                                                        radius="full"
                                                        size="lg"
                                                        startContent={<IconCreditCard size={18} />}
                                                    >
                                                        Choisir ce plan
                                                    </Button>
                                                </CardBody>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Promo Code & Confirmation Modal (Shared Component) */}
            <PromoCodeModal
                isOpen={showPromoModal}
                onClose={() => setShowPromoModal(false)}
                onConfirm={confirmSubscription}
                planName={selectedPlan?.name || 'Abonnement'}
                planId={selectedPlan?._id || selectedPlan?.id}
                planPrice={selectedPlan?.priceMonthly || 0} // priceMonthly is usually in Millimes (30000)
                currency={'TND'}
                loading={processing}
            />
        </div>
    );
}
