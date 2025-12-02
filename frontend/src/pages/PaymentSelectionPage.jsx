import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, Button, Input, Divider, Chip } from "@nextui-org/react";
import { IconBrandWhatsapp, IconCreditCard, IconMail, IconArrowLeft, IconCheck } from '@tabler/icons-react';
import ClientPageLayout from '../components/layout/ClientPageLayout';
import KonnectPaymentHandler from '../components/KonnectPaymentHandler';
import { toast } from 'react-toastify';

export default function PaymentSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { plan } = location.state || {};

    const [promoCode, setPromoCode] = useState('');
    const [isPromoApplied, setIsPromoApplied] = useState(false);
    const [showPaymentHandler, setShowPaymentHandler] = useState(false);

    if (!plan) {
        return (
            <ClientPageLayout>
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <h2 className="text-2xl font-bold mb-4">Aucun plan sélectionné</h2>
                    <Button color="primary" onPress={() => navigate('/plans')}>
                        Voir les plans
                    </Button>
                </div>
            </ClientPageLayout>
        );
    }

    const handleApplyPromo = () => {
        if (!promoCode.trim()) return;
        // Here we could validate the code via API if needed, 
        // but for now we'll just mark it as applied to proceed to payment init
        setIsPromoApplied(true);
        toast.success("Code promo enregistré ! Il sera appliqué au paiement.");
    };

    const handleStartOnlinePayment = () => {
        setShowPaymentHandler(true);
    };

    const handleWhatsAppRedirect = () => {
        const message = `Bonjour, je souhaite m'abonner au plan "${plan.name}" via Virement Postal.`;
        const url = `https://wa.me/21650180798?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <ClientPageLayout
            title="Choisissez votre mode de paiement"
            subtitle={`Abonnement: ${plan.name}`}
            backPath="/plans" // Or go back to previous context if possible
        >
            <div className="max-w-5xl mx-auto py-8">
                <Button
                    variant="light"
                    startContent={<IconArrowLeft />}
                    onPress={() => navigate(-1)}
                    className="mb-6"
                >
                    Retour
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Option 1: Virement Postal / WhatsApp */}
                    <Card className="p-4 border-2 border-transparent hover:border-primary/20 transition-all">
                        <CardHeader className="flex gap-3 pb-2">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                <IconMail size={32} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xl font-bold">Virement Postal</h3>
                                <p className="text-small text-default-500">Paiement hors ligne assisté</p>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody className="py-8 flex flex-col gap-6">
                            <div className="bg-default-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Comment ça marche ?</h4>
                                <ul className="list-disc list-inside space-y-2 text-default-600 text-sm">
                                    <li>Contactez-nous sur WhatsApp</li>
                                    <li>Recevez les coordonnées postales (CCP)</li>
                                    <li>Effectuez le virement</li>
                                    <li>Envoyez la preuve de paiement</li>
                                    <li>Votre compte sera activé manuellement</li>
                                </ul>
                            </div>

                            <div className="mt-auto">
                                <Button
                                    color="success"
                                    size="lg"
                                    className="w-full text-white font-semibold shadow-lg shadow-green-500/20"
                                    startContent={<IconBrandWhatsapp size={24} />}
                                    onPress={handleWhatsAppRedirect}
                                >
                                    Contacter sur WhatsApp
                                </Button>
                                <p className="text-center text-tiny text-default-400 mt-3">
                                    Numéro: +216 50 180 798
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Option 2: Carte Bancaire / Konnect */}
                    <Card className="p-4 border-2 border-primary border-opacity-50 shadow-xl shadow-primary/10">
                        <CardHeader className="flex gap-3 pb-2">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <IconCreditCard size={32} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xl font-bold">Carte Bancaire / eWallet</h3>
                                <p className="text-small text-default-500">Paiement sécurisé immédiat</p>
                            </div>
                            <Chip color="primary" variant="flat" className="ml-auto">Recommandé</Chip>
                        </CardHeader>
                        <Divider />
                        <CardBody className="py-8 flex flex-col gap-6">

                            {!showPaymentHandler ? (
                                <>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-default-50 p-4 rounded-lg">
                                            <span className="font-medium">Total à payer</span>
                                            <span className="text-2xl font-bold text-primary">
                                                {(plan.priceMonthly / 100).toFixed(2)} {plan.currency || 'TND'}
                                                <span className="text-sm font-normal text-default-500 ml-1">
                                                    /{plan.interval === 'year' ? 'an' : 'mois'}
                                                </span>
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Code Promo (Optionnel)</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="ENTREZ VOTRE CODE"
                                                    value={promoCode}
                                                    onValueChange={setPromoCode}
                                                    isDisabled={isPromoApplied}
                                                    size="lg"
                                                    startContent={<span className="text-default-400">🎟️</span>}
                                                />
                                                {/* Removed separate apply button to simplify flow, 
                            code is passed directly to handler */}
                                            </div>
                                            {promoCode && (
                                                <p className="text-tiny text-primary flex items-center gap-1">
                                                    <IconCheck size={12} /> Code prêt à être appliqué
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <Button
                                            color="primary"
                                            size="lg"
                                            className="w-full font-bold text-lg shadow-lg shadow-primary/20"
                                            endContent={<IconCreditCard />}
                                            onPress={handleStartOnlinePayment}
                                        >
                                            Payer avec Konnect
                                        </Button>
                                        <div className="flex justify-center gap-4 mt-4 opacity-60 grayscale hover:grayscale-0 transition-all">
                                            <img src="https://konnect.network/assets/img/logo.png" alt="Konnect" className="h-6 object-contain" />
                                            {/* Add other logos if available */}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="animate-in fade-in zoom-in duration-300">
                                    <div className="mb-4 flex justify-between items-center">
                                        <h4 className="font-semibold">Paiement en cours...</h4>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            color="danger"
                                            onPress={() => setShowPaymentHandler(false)}
                                        >
                                            Annuler
                                        </Button>
                                    </div>
                                    <KonnectPaymentHandler
                                        plan={plan}
                                        promoCode={promoCode}
                                        onSuccess={(data) => {
                                            toast.success("Paiement réussi !");
                                            navigate('/payment/success', { state: { data } });
                                        }}
                                        onError={(err) => {
                                            toast.error("Erreur de paiement: " + err.message);
                                        }}
                                        onCancel={() => {
                                            toast.info("Paiement annulé");
                                            setShowPaymentHandler(false);
                                        }}
                                    />
                                </div>
                            )}

                        </CardBody>
                    </Card>
                </div>
            </div>
        </ClientPageLayout>
    );
}
