// src/pages/CategoryPlans.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Spinner, Button } from "@nextui-org/react";
import { IconInfoCircle, IconAlertTriangle, IconRefresh, IconArrowLeft, IconShieldCheck, IconRocket, IconBooks } from '@tabler/icons-react';

import CategoryPaymentService from '../services/categoryPaymentService';
import CategoryPaymentCard from '../components/CategoryPaymentCard';
import Header from './dashboard/Header';
import PromoCodeModal from '../components/PromoCodeModal';
import { useTranslation } from '../hooks/useTranslation';

const CategoryPlans = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [searchParams] = useSearchParams();
  const categoryIdParam = searchParams.get('category');

  useEffect(() => {
    fetchCategoryPlans();
  }, [categoryIdParam, language]); // Re-fetch or re-process on language change might be needed if translations were separate, but here we handle it in render

  const fetchCategoryPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await CategoryPaymentService.getCategoryPlans();

      // Normaliser les plans pour gérer les différents formats
      const plansData = response?.plans || response || [];
      const normalizedPlans = plansData.map(plan => ({
        ...plan,
        id: plan.id || plan._id,
        _id: plan._id || plan.id,
        // S'assurer que les traductions sont disponibles
        translations: plan.translations || {
          fr: { name: plan.name || 'Plan', description: plan.description || '' },
          en: { name: plan.name || 'Plan', description: plan.description || '' },
          ar: { name: plan.name || 'Plan', description: plan.description || '' }
        }
      }));

      setPlans(normalizedPlans.filter(p => !categoryIdParam || p.category === categoryIdParam || p.categoryId === categoryIdParam));

    } catch (error) {
      console.error('Error fetching category plans:', error);
      const errorMessage = error?.message || 'Impossible de charger les plans de catégories';
      setError(errorMessage);
      toast.error(errorMessage);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowPromoModal(true);
  };

  const handlePromoConfirm = async (promoCode) => {
    if (!selectedPlan) return;

    try {
      setProcessingPayment(true);
      const result = await CategoryPaymentService.initCategoryPayment(
        selectedPlan.categoryId,
        window.location.href, // Return URL here? or specific success page
        window.location.href, // Cancel URL
        promoCode
      );

      handlePaymentInitiated(result);
      setShowPromoModal(false);

    } catch (err) {
      console.error("Payment init error", err);
      toast.error(err.message || "Erreur d'initialisation");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentInitiated = async (result) => {
    if (result.success) {
      if (result.freeAccess || result.alreadyHasAccess) {
        toast.success(result.alreadyHasAccess ? t('categoryPlans.alreadyHasAccess') : t('categoryPlans.freeAccessGranted'));
        // Actualiser la page pour refléter l'accès
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (result.paymentUrl) {
        toast.success(t('categoryPlans.redirecting'));
        // Rediriger vers Konnect
        window.location.href = result.paymentUrl;
      }
    }
  };

  // Dummy functions for Header functionality outside of dashboard layout
  const noop = () => { };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-white overflow-hidden relative selection:bg-cyan-500/30 transition-colors duration-300">

      {/* Background Ambience - Dark Mode */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-0 dark:opacity-100 transition-opacity duration-300">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute top-[20%] left-[10%] w-[100px] h-[100px] rounded-full bg-blue-500/10 blur-[50px]" />
      </div>

      {/* Background Ambience - Light Mode */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-100 dark:opacity-0 transition-opacity duration-300">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-200/40 blur-[150px]" />
      </div>

      {/* Helper component for gradient text */}
      <style>{`
        .text-gradient {
          background: linear-gradient(135deg, #22D3EE 0%, #3B82F6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        /* Gradient for light mode if needed */
        .light .text-gradient {
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Intégration du Header Global */}
      <div className="relative z-50">
        <Header
          toggleSidebar={noop}
          collapsed={false}
          toggleMobileMenu={noop}
          setActivePage={noop}
        />
      </div>

      <main className="container mx-auto px-6 pt-8 pb-20 relative z-10 max-w-7xl">

        <div className="mb-8">
          <Button
            variant="light"
            startContent={<IconArrowLeft />}
            onPress={() => navigate('/dashboard')}
            className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          >
            {t('categoryPlans.backToDashboard')}
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gray-900 dark:text-white">
            {t('categoryPlans.unlockPotential')} <span className="text-gradient">{t('categoryPlans.potential')}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('categoryPlans.choosePlan')}
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/50 px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <IconRocket className="text-cyan-600 dark:text-cyan-400" size={20} />
              <span className="text-gray-700 dark:text-slate-300 text-sm font-medium">{t('categoryPlans.immediateUnlock')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/50 px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <IconBooks className="text-blue-600 dark:text-blue-400" size={20} />
              <span className="text-gray-700 dark:text-slate-300 text-sm font-medium">{t('categoryPlans.completePaths')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/50 px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
              <IconShieldCheck className="text-indigo-600 dark:text-indigo-400" size={20} />
              <span className="text-gray-700 dark:text-slate-300 text-sm font-medium">{t('categoryPlans.securePayment')}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-gray-500 dark:text-slate-500 text-lg animate-pulse">{t('categoryPlans.loading')}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto bg-white dark:bg-slate-900/50 rounded-3xl border border-red-200 dark:border-red-900/30 shadow-lg dark:shadow-none">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
              <IconAlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('categoryPlans.error')}</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">{error}</p>
            <Button
              color="primary"
              variant="flat"
              startContent={<IconRefresh size={20} />}
              onPress={fetchCategoryPlans}
            >
              {t('categoryPlans.retry')}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center items-stretch">
              {plans.map((plan) => (
                <div key={plan.id} className="w-full flex justify-center h-full">
                  <CategoryPaymentCard
                    categoryPlan={plan}
                    isSelected={false}
                    onSelect={() => handlePlanSelect(plan)}
                    onPaymentInitiated={noop}
                  />
                </div>
              ))}
            </div>

            {plans.length === 0 && (
              <div className="text-center py-24 bg-white/40 dark:bg-slate-900/30 rounded-3xl border border-dashed border-gray-300 dark:border-slate-800 backdrop-blur-sm">
                <p className="text-xl text-gray-500 dark:text-slate-500">{t('categoryPlans.noPlans')}</p>
                <Button
                  className="mt-4"
                  variant="light"
                  color="primary"
                  onPress={() => navigate('/courses')}
                >
                  {t('categoryPlans.exploreOthers')}
                </Button>
              </div>
            )}
          </>
        )}

        <PromoCodeModal
          isOpen={showPromoModal}
          onClose={() => setShowPromoModal(false)}
          onConfirm={handlePromoConfirm}
          planName={selectedPlan?.name || 'Abonnement'}
          planId={selectedPlan?.id || selectedPlan?._id}
          planPrice={selectedPlan?.price ? selectedPlan.price * 1000 : 0}
          currency={selectedPlan?.currency || 'TND'}
          loading={processingPayment}
        />
      </main>
    </div>
  );
};

export default CategoryPlans;
