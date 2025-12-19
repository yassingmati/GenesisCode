// src/components/CategoryPaymentCard.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Card, CardBody, CardFooter, CardHeader, Button, Chip, Divider } from "@nextui-org/react";
import { IconCheck, IconPremiumRights, IconSparkles } from '@tabler/icons-react';
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

  // Déterminer si c'est le plan "populaire" (logique arbitraire ou basée sur le nom pour le design)
  const isPopular = categoryPlan.name?.toLowerCase().includes('avancé') || categoryPlan.name?.toLowerCase().includes('premium');

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

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <Card
      isPressable={!!onSelect}
      onPress={handleCardClick}
      className={`w-full max-w-sm border transition-all duration-300 h-full
        ${isPopular
          ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl'
          : 'border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md hover:border-cyan-500/30 dark:hover:border-white/20'
        } 
        ${isSelected ? 'ring-2 ring-cyan-400' : ''}
      `}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <Chip
            startContent={<IconSparkles size={14} />}
            variant="shadow"
            classNames={{
              base: "bg-gradient-to-r from-cyan-500 to-blue-600 border-none",
              content: "text-white font-semibold text-xs py-0.5 px-2"
            }}
          >
            {t('categoryPlans.popular')}
          </Chip>
        </div>
      )}

      <CardHeader className="flex flex-col items-start gap-2 pt-8 pb-4 px-6 relative overflow-hidden">
        {/* Abstract background shape */}
        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${isPopular ? 'bg-cyan-400' : 'bg-blue-400'
          }`} />

        <div className="flex justify-between items-start w-full z-10">
          <h3 className={`text-2xl font-bold ${isPopular ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
            {categoryPlan.name}
          </h3>
          {isPopular && <IconPremiumRights className="text-cyan-600 dark:text-cyan-400" size={28} />}
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-sm min-h-[40px] font-medium">
          {categoryPlan.description}
        </p>

        <div className="mt-4 flex items-baseline gap-1">
          <span className={`text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${isPopular ? 'from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500' : 'from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400'
            }`}>
            {categoryPlan.price === 0 ? t('categoryPlans.free') : categoryPlan.price}
          </span>
          <span className="text-slate-500 dark:text-slate-500 font-medium">
            {categoryPlan.price === 0 ? '' : categoryPlan.currency || 'TND'}
          </span>
        </div>
      </CardHeader>

      <Divider className="bg-slate-200 dark:bg-white/10 mx-6 w-auto" />

      <CardBody className="px-6 py-4">
        <ul className="space-y-3">
          {categoryPlan.features && categoryPlan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
              <div className={`mt-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center ${isPopular ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                <IconCheck size={12} stroke={3} />
              </div>
              <span className="text-sm font-medium">{feature}</span>
            </li>
          ))}
          {(!categoryPlan.features || categoryPlan.features.length === 0) && (
            <li className="text-slate-500 italic text-sm">{t('categoryPlans.noFeatures')}</li>
          )}
        </ul>
      </CardBody>

      <CardFooter className="px-6 pb-8 pt-4 mt-auto">
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
          className={`w-full font-bold text-base py-6 shadow-lg transition-all ${isPopular
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40'
              : 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 border border-transparent dark:border-white/5'
            }`}
          radius="lg"
        >
          {loading ? t('categoryPlans.processing') : t('categoryPlans.buyNow')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryPaymentCard;
