import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Spinner,
    Input,
    Avatar,
    Card,
    CardBody,
    Divider,
    Tabs,
    Tab
} from "@nextui-org/react";
import {
    IconUser,
    IconMail,
    IconPhone,
    IconShieldLock,
    IconHelp,
    IconCreditCard
} from '@tabler/icons-react';
import CategoryPaymentCard from '../CategoryPaymentCard';
import SubscriptionService from '../../services/subscriptionService';
import { toast } from 'react-toastify';
import PromoCodeModal from '../PromoCodeModal';
import { useTranslation } from '../../hooks/useTranslation';

export default function CategoryPaymentModal({ isOpen, onClose, categoryId, categoryName }) {
    const { t } = useTranslation();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    // User Profile State
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("plans");

    useEffect(() => {
        if (isOpen) {
            loadPlans();
            loadUserProfile();
        }
    }, [isOpen]);

    const loadUserProfile = () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (e) {
            console.error("Error loading user profile", e);
        }
    };

    const loadPlans = async () => {
        try {
            setLoading(true);
            setError('');
            // Use SubscriptionService to get global plans as requested by user
            const plansData = await SubscriptionService.getPlans();

            // Filter plans by category
            const filteredPlans = (plansData || []).filter(plan => {
                const planCat = plan.category?._id || plan.category;
                const planCatId = plan.categoryId;
                const planTargetId = plan.targetId;

                return (
                    planCat === categoryId ||
                    planCatId === categoryId ||
                    (planTargetId === categoryId && plan.type === 'category')
                );
            });

            // Normalize plans to match CategoryPaymentCard expected format
            const normalizedPlans = filteredPlans.map(plan => {
                const rawPrice = plan.priceMonthly !== undefined ? plan.priceMonthly : plan.price;
                const price = (plan.currency === 'TND' || !plan.currency) && rawPrice >= 100
                    ? (rawPrice / 1000).toFixed(3)
                    : rawPrice;

                return {
                    ...plan,
                    id: plan.id || plan._id,
                    _id: plan._id || plan.id,
                    name: plan.name || plan.translations?.fr?.name || 'Abonnement',
                    description: plan.description || plan.translations?.fr?.description || '',
                    price: price,
                    rawPrice: rawPrice,
                    currency: plan.currency || 'TND',
                    features: plan.features || [],
                    category: { _id: categoryId || 'global' }
                };
            });

            setPlans(normalizedPlans);
        } catch (err) {
            console.error('Error loading plans:', err);
            setError('Impossible de charger les plans.');
        } finally {
            setLoading(false);
        }
    };

    const handlePromoConfirm = async (promoCode) => {
        if (!selectedPlan) return;

        try {
            setProcessingPayment(true);
            const result = await SubscriptionService.subscribe(selectedPlan._id || selectedPlan.id, {
                promoCode
            });
            handlePaymentInitiated(result);
            setShowPromoModal(false);
        } catch (err) {
            console.error("Payment error", err);
            toast.error(err.message || "Erreur de paiement");
        } finally {
            setProcessingPayment(false);
        }
    };

    const handlePaymentInitiated = (result) => {
        if (result.success) {
            if (result.paymentUrl) {
                window.location.href = result.paymentUrl;
            } else {
                toast.success("Abonnement initié !");
                onClose();
            }
        }
    };

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setShowPromoModal(true);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="4xl"
            backdrop="blur"
            scrollBehavior="inside"
            classNames={{
                body: "py-0 px-0",
                backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                base: "border-[#292f46] bg-[#f8fafc] dark:bg-[#1a1c23] text-gray-700 dark:text-gray-300 mx-4 my-4 max-h-[90vh]",
                header: "border-b border-gray-200 dark:border-white/10 p-6 bg-white dark:bg-[#1a1c23]",
                footer: "border-t border-gray-200 dark:border-white/10 p-6 bg-white dark:bg-[#1a1c23]",
                closeButton: "hover:bg-gray-100 dark:hover:bg-white/10 active:bg-gray-200 dark:active:bg-white/20 top-6 right-6",
            }}
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
                                    <IconShieldLock className="text-white" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                        Débloquer {categoryName}
                                    </h2>
                                    <p className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                                        Accédez au contenu complet et suivez la progression
                                    </p>
                                </div>
                            </div>
                        </ModalHeader>

                        <ModalBody className="bg-gray-50/50 dark:bg-[#111318]">
                            <div className="flex flex-col lg:flex-row h-full">
                                {/* Sidebar / Profile Section */}
                                <div className="lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1c23]">
                                    <div className="flex items-center gap-2 mb-6 text-gray-800 dark:text-white font-bold text-lg">
                                        <IconUser size={20} className="text-indigo-500" />
                                        <span>Compte Parent</span>
                                    </div>

                                    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 border-none shadow-none mb-6">
                                        <CardBody className="gap-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar
                                                    src={user?.avatar}
                                                    name={user?.firstName?.[0]}
                                                    className="w-14 h-14 text-large ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#1a1c23]"
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">
                                                        {user?.firstName} {user?.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Parent / Tuteur</p>
                                                </div>
                                            </div>

                                            <Divider className="my-2 bg-indigo-200 dark:bg-indigo-900/30" />

                                            <div className="space-y-3">
                                                <Input
                                                    isReadOnly
                                                    label="Email"
                                                    size="sm"
                                                    variant="faded"
                                                    value={user?.email || ''}
                                                    startContent={<IconMail size={16} className="text-gray-400" />}
                                                    classNames={{
                                                        label: "text-gray-500 dark:text-gray-400",
                                                        inputWrapper: "bg-white dark:bg-slate-800"
                                                    }}
                                                />
                                                <Input
                                                    label="Téléphone"
                                                    size="sm"
                                                    variant="bordered"
                                                    placeholder="Ajouter un numéro"
                                                    defaultValue={user?.phone || ''}
                                                    startContent={<IconPhone size={16} className="text-gray-400" />}
                                                />
                                            </div>
                                        </CardBody>
                                    </Card>

                                    <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-800">
                                        <p className="font-semibold mb-1 text-gray-700 dark:text-gray-300">Information Importante</p>
                                        Les factures seront envoyées à l'adresse email associée à ce compte parent. Assurez-vous que vos informations sont à jour.
                                    </div>
                                </div>

                                {/* Main Content / Plans */}
                                <div className="lg:w-2/3 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2 text-gray-800 dark:text-white font-bold text-lg">
                                            <IconCreditCard size={20} className="text-indigo-500" />
                                            <span>Formules Disponibles</span>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex justify-center items-center h-48">
                                            <Spinner size="lg" color="primary" label="Chargement des offres..." />
                                        </div>
                                    ) : error ? (
                                        <div className="flex flex-col items-center justify-center h-48 text-center p-6 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                            <p className="text-red-500 font-medium mb-2">{error}</p>
                                            <Button size="sm" color="danger" variant="flat" onPress={loadPlans}>Réessayer</Button>
                                        </div>
                                    ) : plans.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                                            Aucun plan disponible pour cette catégorie.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {plans.map((plan) => (
                                                <div key={plan.id} className="transform transition-all duration-200 hover:translate-x-1">
                                                    <CategoryPaymentCard
                                                        categoryPlan={plan}
                                                        isSelected={selectedPlan?.id === plan.id}
                                                        onSelect={() => handlePlanSelect(plan)}
                                                        onPaymentInitiated={handlePaymentInitiated}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ModalBody>

                        <ModalFooter className="flex justify-between items-center sm:flex-row flex-col-reverse gap-4">
                            <div className="flex gap-4 w-full sm:w-auto justify-center">
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="text-gray-500"
                                    startContent={<IconHelp size={18} />}
                                    onClick={() => window.open('mailto:support@codegenesis.com')}
                                >
                                    Support
                                </Button>
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="text-gray-500"
                                    onClick={() => window.open('mailto:contact@codegenesis.com')}
                                >
                                    Contact
                                </Button>
                            </div>
                            <Button
                                color="danger"
                                variant="light"
                                onPress={close}
                                className="font-medium"
                            >
                                Annuler
                            </Button>
                        </ModalFooter>

                        <PromoCodeModal
                            isOpen={showPromoModal}
                            onClose={() => setShowPromoModal(false)}
                            onConfirm={handlePromoConfirm}
                            planName={selectedPlan?.name || 'Abonnement'}
                            planId={selectedPlan?.id || selectedPlan?._id}
                            planPrice={selectedPlan?.rawPrice || 0}
                            currency={selectedPlan?.currency || 'TND'}
                            loading={processingPayment}
                        />
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
