import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "@nextui-org/react";
import CategoryPaymentCard from '../CategoryPaymentCard';
import SubscriptionService from '../../services/subscriptionService';
import { toast } from 'react-toastify';
import PromoCodeModal from '../PromoCodeModal';

export default function CategoryPaymentModal({ isOpen, onClose, categoryId, categoryName }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadPlans();
        }
    }, [isOpen]);

    const loadPlans = async () => {
        try {
            setLoading(true);
            setError('');
            // Use SubscriptionService to get global plans as requested by user
            const plansData = await SubscriptionService.getPlans();

            // Filter plans by category
            // The API returns plans with 'targetId' for specific categories
            const filteredPlans = (plansData || []).filter(plan => {
                const planCat = plan.category?._id || plan.category;
                const planCatId = plan.categoryId;
                const planTargetId = plan.targetId;

                // Allow if:
                // 1. Explicit category field matches
                // 2. targetId matches AND type is category
                // 3. User wanted ONLY category plans, so we strictly check
                return (
                    planCat === categoryId ||
                    planCatId === categoryId ||
                    (planTargetId === categoryId && plan.type === 'category')
                );
            });

            // Normalize plans to match CategoryPaymentCard expected format
            const normalizedPlans = filteredPlans.map(plan => {
                const rawPrice = plan.priceMonthly !== undefined ? plan.priceMonthly : plan.price;
                // Normalize TND price from millimes to dinars if > 100 (assuming plans aren't < 1 TND)
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
                    rawPrice: rawPrice, // Store raw millimes for PromoCodeModal
                    currency: plan.currency || 'TND',
                    features: plan.features || [],
                    // Mock category object if needed by strict props, though we use custom handler now
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
            size="3xl"
            backdrop="blur"
            classNames={{
                body: "py-6",
                backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                header: "border-b-[1px] border-[#292f46]",
                footer: "border-t-[1px] border-[#292f46]",
                closeButton: "hover:bg-white/5 active:bg-white/10",
            }}
        >
            <ModalContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-2xl">
                {(close) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold dark:text-white">Débloquer {categoryName}</h2>
                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                Abonnez-vous pour accéder à tous les contenus de ce parcours
                            </p>
                        </ModalHeader>
                        <ModalBody>
                            {loading ? (
                                <div className="flex justify-center items-center h-48">
                                    <Spinner size="lg" color="primary" label="Chargement des abonnements..." />
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-500 py-8">{error}</div>
                            ) : plans.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Aucun plan disponible pour cette catégorie.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                                    {plans.map((plan) => (
                                        <CategoryPaymentCard
                                            key={plan.id}
                                            categoryPlan={plan}
                                            isSelected={selectedPlan?.id === plan.id}
                                            onSelect={() => handlePlanSelect(plan)}
                                            onPaymentInitiated={handlePaymentInitiated}
                                        />
                                    ))}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={close}>
                                Annuler
                            </Button>
                        </ModalFooter>

                        <PromoCodeModal
                            isOpen={showPromoModal}
                            onClose={() => setShowPromoModal(false)}
                            onConfirm={handlePromoConfirm}
                            planName={selectedPlan?.name || 'Abonnement'}
                            planId={selectedPlan?.id || selectedPlan?._id}
                            planPrice={selectedPlan?.rawPrice || 0} // Pass raw millimes
                            currency={selectedPlan?.currency || 'TND'}
                            loading={processingPayment}
                        />
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
