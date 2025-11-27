
import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Switch } from "@nextui-org/react";
import { IconCreditCard, IconHistory, IconLock, IconLockOpen } from '@tabler/icons-react';

export default function PaymentControlWidget({ childId }) {
    const [plans, setPlans] = useState([]);
    const [showPlans, setShowPlans] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState({
        plan: 'Chargement...',
        status: 'active',
        nextBilling: '-',
        amount: '0€'
    });
    const [history, setHistory] = useState([]);
    const [allowPurchases, setAllowPurchases] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

                // 1. Fetch Subscription
                try {
                    const subResponse = await fetch(`${API_BASE_URL}/api/subscriptions/user/${childId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (subResponse.ok) {
                        const subData = await subResponse.json();
                        setSubscription(subData);
                    } else {
                        // Fallback mock if API fails or 404
                        setSubscription({
                            plan: 'Gratuit',
                            status: 'active',
                            nextBilling: '-',
                            amount: '0€'
                        });
                    }
                } catch (e) {
                    setSubscription({
                        plan: 'Gratuit',
                        status: 'active',
                        nextBilling: '-',
                        amount: '0€'
                    });
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

    const handleSubscribe = async (planId) => {
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
                    planId,
                    childId, // Pass childId to subscribe the child
                    returnUrl: window.location.href
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.paymentUrl) {
                    window.location.href = data.paymentUrl; // Redirect to payment
                } else {
                    alert('Abonnement activé avec succès !');
                    setShowPlans(false);
                    // Reload data
                    window.location.reload();
                }
            } else {
                alert(data.message || 'Erreur lors de la souscription');
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

    return (
        <div className="space-y-6">
            {/* Subscription Status Card */}
            <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
                <CardBody className="p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <IconCreditCard /> Abonnement Actuel
                            </h3>
                            <div className="space-y-1">
                                <p className="text-purple-100">Plan: <span className="font-semibold text-white">{subscription?.plan || 'Chargement...'}</span></p>
                                <p className="text-purple-100">Prochaine facture: {subscription?.nextBilling || '-'}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Chip
                                color="success"
                                variant="shadow"
                                classNames={{ content: "font-bold" }}
                            >
                                {subscription?.status?.toUpperCase() || 'INCONNU'}
                            </Chip>
                            <Button
                                size="sm"
                                className="bg-white/20 text-white hover:bg-white/30"
                                onPress={loadPlans}
                            >
                                Changer de plan
                            </Button>
                        </div>
                    </div>
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
                        {history.length === 0 && (
                            <div className="text-center py-4 text-gray-500">Aucune transaction récente.</div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Plans Modal */}
            {showPlans && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Choisir un abonnement</h2>
                            <Button isIconOnly variant="light" onPress={() => setShowPlans(false)}><IconLockOpen /></Button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            {plans.map(plan => (
                                <Card key={plan.id} className="border-2 hover:border-indigo-500 transition-colors cursor-pointer">
                                    <CardBody className="p-6 text-center">
                                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                        <div className="text-3xl font-bold text-indigo-600 mb-4">
                                            {plan.priceMonthly} {plan.currency}
                                            <span className="text-sm text-gray-500 font-normal">/{plan.interval}</span>
                                        </div>
                                        <p className="text-gray-600 mb-6 text-sm">{plan.description}</p>
                                        <ul className="text-left space-y-2 mb-6">
                                            {plan.features && plan.features.map((feature, i) => (
                                                <li key={i} className="text-sm flex items-center gap-2">
                                                    <span className="text-green-500">✓</span> {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            color="primary"
                                            className="w-full"
                                            isLoading={processing}
                                            onPress={() => handleSubscribe(plan.id)}
                                        >
                                            Choisir ce plan
                                        </Button>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

