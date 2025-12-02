import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import SubscribeButton from '../components/SubscribeButton';
import { toast } from 'react-toastify';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
  Divider
} from "@nextui-org/react";
import {
  IconCheck,
  IconStar,
  IconDiamond,
  IconRocket,
  IconShieldCheck
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api.get('/api/subscriptions/plans')
      .then(res => {
        if (mounted) {
          const plansData = res.data?.plans || res.data || [];
          const normalizedPlans = plansData.map(plan => ({
            ...plan,
            _id: plan._id || plan.id,
            id: plan.id || plan._id,
            name: plan.name || 'Plan',
            description: plan.description || '',
            priceMonthly: plan.priceMonthly || 0,
            currency: plan.currency || 'TND',
            interval: plan.interval || null,
            features: Array.isArray(plan.features) ? plan.features : []
          }));
          setPlans(normalizedPlans);
        }
      })
      .catch(err => {
        console.error('❌ Erreur récupération plans:', err);
        toast.error('Impossible de récupérer les offres.');
        if (mounted) setPlans([]);
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  const formatPrice = (price, currency) => {
    // Fix for TND: Divide by 1000 for milimes
    // For other currencies (like USD/EUR), usually divide by 100 for cents
    const divisor = currency === 'TND' ? 1000 : 100;
    const value = price / divisor;

    // Format: 3 DT instead of 3.000 DT if it's a whole number
    const formattedValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(3);

    return `${formattedValue} ${currency}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" label="Chargement des offres..." color="primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Chip color="primary" variant="flat" className="mb-4 font-semibold">
              Premium
            </Chip>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
              Choisissez votre plan
            </h1>
            <p className="text-xl text-default-500 max-w-2xl mx-auto">
              Débloquez tout votre potentiel avec nos offres adaptées à vos besoins.
              Accès illimité, parcours personnalisés et bien plus encore.
            </p>
          </motion.div>
        </div>

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className="text-center text-default-500 py-20">
            Aucun plan disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-start">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                index={index}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}

        <div className="mt-20 text-center">
          <p className="text-default-400 text-sm">
            Paiement sécurisé via Konnect. Annulation possible à tout moment.
          </p>
          <Button
            variant="light"
            className="mt-4"
            onPress={() => navigate('/dashboard')}
          >
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, index, formatPrice }) {
  const isPopular = plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('pro');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="h-full"
    >
      <Card
        className={`h-full border-none transition-all duration-300 hover:-translate-y-2 ${isPopular
          ? 'bg-gradient-to-b from-blue-600 to-violet-700 text-white shadow-2xl shadow-blue-500/30'
          : 'bg-white dark:bg-slate-800 shadow-xl hover:shadow-2xl'
          }`}
      >
        <CardHeader className="flex flex-col items-start p-8 pb-0">
          {isPopular && (
            <Chip
              className="absolute top-4 right-4 bg-white/20 border-white/30 text-white font-bold backdrop-blur-md"
              variant="flat"
              size="sm"
              startContent={<IconStar size={12} className="text-yellow-300" />}
            >
              POPULAIRE
            </Chip>
          )}

          <div className={`p-3 rounded-xl mb-4 ${isPopular ? 'bg-white/10' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
            {isPopular ? <IconDiamond size={32} className="text-white" /> : <IconRocket size={32} className="text-blue-600 dark:text-blue-400" />}
          </div>

          <h3 className={`text-2xl font-bold ${isPopular ? 'text-white' : 'text-default-900'}`}>
            {plan.name}
          </h3>
          <p className={`mt-2 text-sm ${isPopular ? 'text-white/80' : 'text-default-500'}`}>
            {plan.description || 'L\'offre idéale pour commencer'}
          </p>
        </CardHeader>

        <CardBody className="p-8 pt-6 flex flex-col gap-6">
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-default-900'}`}>
              {plan.priceMonthly > 0 ? formatPrice(plan.priceMonthly, plan.currency) : 'Gratuit'}
            </span>
            {plan.priceMonthly > 0 && plan.interval && (
              <span className={`text-sm ${isPopular ? 'text-white/70' : 'text-default-400'}`}>
                / {plan.interval === 'month' ? 'mois' : plan.interval === 'year' ? 'an' : plan.interval}
              </span>
            )}
          </div>

          <Divider className={isPopular ? 'bg-white/20' : ''} />

          <ul className="flex flex-col gap-3">
            {plan.features && plan.features.length > 0 ? (
              plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`mt-1 p-0.5 rounded-full ${isPopular ? 'bg-white/20 text-white' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
                    <IconCheck size={12} stroke={3} />
                  </div>
                  <span className={`text-sm ${isPopular ? 'text-white/90' : 'text-default-600'}`}>
                    {feature}
                  </span>
                </li>
              ))
            ) : (
              <li className={`text-sm italic ${isPopular ? 'text-white/60' : 'text-default-400'}`}>
                Aucun avantage listé
              </li>
            )}
          </ul>

          <div className="mt-auto pt-4">
            <div className={isPopular ? 'brightness-110' : ''}>
              <SubscribeButton
                plan={plan}
                returnUrl={`${window.location.origin}/payments/konnect-return`}
                customClass={`w-full font-bold py-6 ${isPopular ? 'bg-white text-blue-600 hover:bg-white/90' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              />
            </div>
            {isPopular && (
              <div className="flex justify-center items-center gap-2 mt-4 text-xs text-white/60">
                <IconShieldCheck size={14} />
                <span>Garantie satisfait ou remboursé</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
