// src/components/CategoryPaymentCard.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Card, CardBody, CardFooter, CardHeader, Button, Chip, Divider } from "@nextui-org/react";
import { IconCheck, IconPremiumRights, IconSparkles } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import CategoryPaymentService from '../services/categoryPaymentService';
import { useTranslation } from '../hooks/useTranslation';

const CategoryPaymentCard = ({
  categoryPlan,
  isSelected,
  onSelect,
  onPaymentInitiated,
  paymentHandler
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Determine if popular (based on name for now)
  const isPopular = categoryPlan.name?.toLowerCase().includes('avancé') || categoryPlan.name?.toLowerCase().includes('premium') || categoryPlan.name?.toLowerCase().includes('intermédiaire');

  const handlePayment = async () => {
    setLoading(true);

    try {
      const returnUrl = `${window.location.origin}/payment/success`;
      const cancelUrl = `${window.location.origin}/payment/cancel`;

      let result;
      if (paymentHandler) {
        result = await paymentHandler(categoryPlan);
      } else {
        result = await CategoryPaymentService.initCategoryPayment(
          categoryPlan.category._id || categoryPlan.category,
          returnUrl,
          cancelUrl
        );
      }

      if (result.success) {
        onPaymentInitiated && onPaymentInitiated(result);
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Erreur lors de l\'initialisation du paiement');
    } finally {
      setLoading(false);
    }
  };

  // Helper to translate features if they match known strings
  const translateFeature = (featureText) => {
    if (!featureText) return featureText;

    // Normalize string (trim, lowercase for comparison)
    const normalized = featureText.toLowerCase().trim();

    if (normalized.includes('illimité') || normalized.includes('unlimited')) return t('categoryPlans.features.unlimitedAccess');
    if (normalized.includes('interactif') || normalized.includes('interactive')) return t('categoryPlans.features.interactiveExercises');
    if (normalized.includes('progression') || normalized.includes('progress')) return t('categoryPlans.features.progressTracking');
    if (normalized.includes('support') || normalized.includes('prioritaire')) return t('categoryPlans.features.prioritySupport');

    return featureText;
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`h-full w-full max-w-sm ${isPopular ? 'md:-mt-4 md:mb-4 relative z-10' : ''}`}
    >
      <Card
        isPressable={!!onSelect}
        onPress={handleCardClick}
        className={`h-full w-full border transition-all duration-300 relative overflow-visible
          ${isPopular
            ? 'border-transparent bg-gradient-to-b from-gray-900 via-[#1a1f35] to-[#0f121e] dark:from-[#1e293b] dark:to-[#0f172a] shadow-[0_20px_50px_rgba(8,112,184,0.3)]'
            : 'border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/40 backdrop-blur-md hover:border-blue-300 dark:hover:border-blue-500/30 shadow-lg hover:shadow-xl'
          } 
          ${isSelected ? 'ring-2 ring-cyan-400' : ''}
        `}
        radius="lg"
      >
        {isPopular && (
          <>
            {/* Glowing Border Gradient */}
            <div className="absolute inset-0 rounded-lg p-[1px] bg-gradient-to-b from-cyan-400 to-blue-600 -z-10" />

            {/* Top Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
              <Chip
                startContent={<IconSparkles size={14} className="animate-pulse" />}
                variant="shadow"
                classNames={{
                  base: "bg-gradient-to-r from-cyan-500 to-blue-600 border-none shadow-cyan-500/50",
                  content: "text-white font-bold text-xs uppercase tracking-wider py-1 px-3"
                }}
              >
                {t('categoryPlans.popular') || "Recommandé"}
              </Chip>
            </div>
          </>
        )}

        <CardHeader className="flex flex-col items-center text-center gap-2 pt-10 pb-6 px-6 relative overflow-hidden">
          {/* Background Glow for Popular */}
          {isPopular && <div className="absolute top-0 inset-x-0 h-32 bg-cyan-500/10 blur-3xl rounded-full" />}

          <h3 className={`text-2xl font-bold ${isPopular ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
            {categoryPlan.name}
          </h3>

          <p className="text-sm font-medium opacity-80 min-h-[40px] max-w-[240px]">
            {categoryPlan.description}
          </p>

          <div className="mt-6 flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <span className={`text-5xl font-black tracking-tighter ${isPopular
                ? 'text-white drop-shadow-md'
                : 'text-slate-900 dark:text-white'
                }`}>
                {categoryPlan.price === 0 ? t('categoryPlans.free') : categoryPlan.price}
              </span>
              <span className={`text-lg font-semibold ${isPopular ? 'text-cyan-200' : 'text-slate-500 dark:text-slate-400'}`}>
                {categoryPlan.price === 0 ? '' : categoryPlan.currency || 'TND'}
              </span>
            </div>
            {categoryPlan.price > 0 && <span className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{t('categoryPlans.oneTimePayment')}</span>}
          </div>
        </CardHeader>

        <Divider className={`mx-6 w-auto opacity-50 ${isPopular ? 'bg-indigo-500/30' : 'bg-slate-200 dark:bg-slate-700'}`} />

        <CardBody className="px-8 py-8">
          <ul className="space-y-4">
            {categoryPlan.features && categoryPlan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className={`mt-0.5 min-w-[20px] h-[20px] rounded-full flex items-center justify-center ${isPopular
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                  <IconCheck size={12} stroke={3} />
                </div>
                <span className={`text-sm font-medium ${isPopular ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  {translateFeature(feature)}
                </span>
              </li>
            ))}
            {(!categoryPlan.features || categoryPlan.features.length === 0) && (
              <li className="text-slate-500 italic text-sm text-center">{t('categoryPlans.noFeatures' || "Aucune fonctionnalité listée")}</li>
            )}
          </ul>
        </CardBody>

        <CardFooter className="px-6 pb-8 pt-0 mt-auto">
          <Button
            isLoading={loading}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelect) {
                onSelect();
              } else {
                handlePayment();
              }
            }}
            className={`w-full font-bold text-medium py-7 shadow-lg transition-transform active:scale-95 ${isPopular
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 border border-t-white/20'
              : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-gray-100'
              }`}
            radius="full"
          >
            {loading ? t('categoryPlans.processing' || "Traitement...") : t('categoryPlans.buyNow' || "Choisir ce plan")}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CategoryPaymentCard;
