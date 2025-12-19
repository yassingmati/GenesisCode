import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Divider,
    Checkbox
} from "@nextui-org/react";
import { IconTicket } from '@tabler/icons-react';
import CategoryPaymentService from '../services/categoryPaymentService';

const PromoCodeModal = ({ isOpen, onClose, onConfirm, planName, planId, planPrice, currency, loading }) => {
    const [hasPromoCode, setHasPromoCode] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [validationStatus, setValidationStatus] = useState(null); // null, 'valid', 'invalid', 'loading'
    const [validationMessage, setValidationMessage] = useState('');
    const [discountDetails, setDiscountDetails] = useState(null);
    const [finalPrice, setFinalPrice] = useState(planPrice);

    useEffect(() => {
        if (!isOpen) {
            setHasPromoCode(false);
            setPromoCode('');
            setValidationStatus(null);
            setValidationMessage('');
            setDiscountDetails(null);
            setFinalPrice(planPrice);
        } else {
            setFinalPrice(planPrice);
        }
    }, [isOpen, planPrice]);

    const handleValidate = async () => {
        if (!promoCode.trim()) return;

        setValidationStatus('loading');
        try {
            const result = await CategoryPaymentService.validatePromoCode(promoCode, planId);
            if (result.isValid) {
                setValidationStatus('valid');
                setValidationMessage(result.details.description);
                setDiscountDetails(result.details);

                // Calculate new price locally for display
                let newPrice = planPrice;
                if (result.details.type === 'percentage') {
                    newPrice = planPrice - (planPrice * (result.details.value / 100));
                } else if (result.details.type === 'fixed_amount') {
                    newPrice = Math.max(0, planPrice - result.details.value);
                }
                setFinalPrice(Math.round(newPrice));

            } else {
                setValidationStatus('invalid');
                setValidationMessage(result.message || 'Code invalide');
                setDiscountDetails(null);
                setFinalPrice(planPrice);
            }
        } catch (err) {
            console.error('Validation error:', err);
            setValidationStatus('invalid');
            setValidationMessage('Erreur de validation: ' + (err.message || 'Unknown'));
            setFinalPrice(planPrice);
        }
    };

    const handlePromoChange = (val) => {
        setPromoCode(val);
        if (validationStatus) {
            setValidationStatus(null);
            setValidationMessage('');
            setFinalPrice(planPrice);
        }
    };

    const handleConfirm = () => {
        if (hasPromoCode && validationStatus !== 'valid') {
            return; // Block if checkbox is checked but code invalid
        }

        // Pass promo code only if checked
        onConfirm(hasPromoCode ? promoCode : null);
    };

    const formatPrice = (amount) => {
        // Amount is likely in millimes (e.g., 50000 = 50 TND)
        return (amount / 1000).toFixed(3);
    };

    const renderPriceDisplay = () => {
        return (
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl mb-6 flex justify-between items-center border border-gray-100 dark:border-slate-700">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Prix Total :</span>

                <div className="text-right">
                    {discountDetails ? (
                        <div className="flex flex-col items-end">
                            <span className="text-sm text-gray-400 line-through decoration-red-400 decoration-2">
                                {formatPrice(planPrice)} {currency}
                            </span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatPrice(finalPrice)} {currency}
                            </span>
                        </div>
                    ) : (
                        <span className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                            {formatPrice(planPrice || 0)} {currency || 'TND'}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            backdrop="blur"
            isDismissable={false}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h3 className="text-xl font-bold">Souscription à {planName}</h3>
                        </ModalHeader>
                        <Divider />
                        <ModalBody className="py-6">

                            {renderPriceDisplay()}

                            <div className="mb-4">
                                <Checkbox
                                    isSelected={hasPromoCode}
                                    onValueChange={setHasPromoCode}
                                    classNames={{
                                        label: "text-gray-700 dark:text-gray-300 font-medium",
                                        wrapper: "before:border-indigo-500"
                                    }}
                                >
                                    J'ai un code promo
                                </Checkbox>
                            </div>

                            {hasPromoCode && (
                                <div className="space-y-3 animate-appearance-in">
                                    <div className="flex gap-2 items-start">
                                        <Input
                                            label="Code Promotionnel"
                                            placeholder="Ex: PROMO2024"
                                            value={promoCode}
                                            onValueChange={handlePromoChange}
                                            variant="bordered"
                                            className="flex-1"
                                            errorMessage={validationStatus === 'invalid' ? validationMessage : ''}
                                            isInvalid={validationStatus === 'invalid'}
                                            color={validationStatus === 'valid' ? 'success' : 'default'}
                                            classNames={{
                                                inputWrapper: "border-gray-300 dark:border-gray-600",
                                            }}
                                            startContent={<IconTicket className="text-gray-400" size={18} />}
                                        />
                                        <Button
                                            isIconOnly={false}
                                            color="primary"
                                            variant="flat"
                                            className="h-[56px] px-4 font-medium"
                                            isLoading={validationStatus === 'loading'}
                                            onPress={handleValidate}
                                        >
                                            Appliquer
                                        </Button>
                                    </div>

                                    {validationStatus === 'valid' && (
                                        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-2 rounded mt-2 text-sm flex items-center gap-2">
                                            <span>✅</span> {validationMessage}
                                        </div>
                                    )}
                                </div>
                            )}

                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose} isDisabled={loading}>
                                Annuler
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleConfirm}
                                isLoading={loading}
                                isDisabled={hasPromoCode && validationStatus !== 'valid'}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold shadow-md"
                            >
                                Passer au paiement
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default PromoCodeModal;
