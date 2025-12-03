import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPathsByCategory, getCategories } from '../../services/courseService';
import CategoryPaymentService from '../../services/categoryPaymentService';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
  Card, CardBody, CardFooter, Button, Chip, Spacer, Progress
} from "@nextui-org/react";
import { IconRoute, IconChevronRight, IconArrowLeft, IconLock, IconLockOpen, IconPremiumRights } from '@tabler/icons-react';

/**
 * SpecificCategoryPaths.jsx - Redesigned with NextUI and Shared Layout
 */

export default function SpecificCategoryPaths() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [paths, setPaths] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pathsData, categoriesData, accessHistory] = await Promise.all([
          getPathsByCategory(categoryId),
          getCategories('specific'),
          CategoryPaymentService.getUserAccessHistory().catch(() => ({ purchases: [] }))
        ]);

        setPaths(pathsData || []);
        const currentCategory = categoriesData?.find(cat => cat._id === categoryId);
        setCategory(currentCategory);

        // Check access
        const isUnlocked = accessHistory?.purchases?.some(
          p => (p.categoryId === categoryId || p.category === categoryId) && p.status === 'active'
        );
        setHasAccess(!!isUnlocked);

      } catch (e) {
        setError('Erreur lors du chargement des parcours');
        console.error(e);
      } finally {
        setLoading(false);
        setCheckingAccess(false);
      }
    })();
  }, [categoryId]);

  const categoryName = category?.translations?.fr?.name || 'Langage';

  const handleUnlockClick = async () => {
    try {
      setLoading(true);
      // Fetch the plan for this category
      const response = await CategoryPaymentService.getCategoryPlan(categoryId);
      const plan = response?.plan;

      if (plan) {
        // Adapt plan for PaymentSelectionPage
        const adaptedPlan = {
          ...plan,
          priceMonthly: plan.price * 100, // Assuming price is in TND (e.g. 30) and we need 3000 for display logic
          interval: 'lifetime',
          currency: plan.currency || 'TND',
          type: 'category', // Explicitly mark as category plan
          raw: plan // Pass original plan object for handler
        };
        navigate('/payment-selection', { state: { plan: adaptedPlan } });
      } else {
        // Fallback if no specific plan found
        navigate('/category-plans');
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
      navigate('/category-plans');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientPageLayout
      title={<span>Parcours <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{categoryName}</span></span>}
      subtitle={`Choisis le parcours qui correspond le mieux à ton niveau et tes objectifs pour maîtriser ${categoryName}.`}
      breadcrumbs={[
        { label: 'Langages', path: '/learning/choose-language' },
        { label: categoryName }
      ]}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      backPath="/learning/choose-language"
      backLabel="Retour aux langages"
    >
      {/* Access Status Banner */}
      {!loading && !hasAccess && (
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500">
          <CardBody className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-400">
                <IconLock size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Contenu Premium Verrouillé
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Abonne-toi à ce langage pour débloquer l'accès complet à tous les parcours et exercices.
                </p>
              </div>
            </div>
            <Button
              color="warning"
              variant="shadow"
              className="font-bold text-white"
              endContent={<IconPremiumRights size={18} />}
              onPress={handleUnlockClick}
            >
              Débloquer {categoryName}
            </Button>
          </CardBody>
        </Card>
      )}

      {paths.length === 0 ? (
        <Card className="p-12 text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-200 dark:border-slate-700">
          <CardBody>
            <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-2">Aucun parcours disponible</h3>
            <p className="text-gray-500 dark:text-gray-400">Les parcours pour {categoryName} seront bientôt disponibles.</p>
            <Spacer y={4} />
            <Button
              variant="light"
              color="primary"
              startContent={<IconArrowLeft size={18} />}
              onPress={() => navigate('/learning/choose-language')}
            >
              Retour aux langages
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paths.map((path, index) => (
            <Card
              key={path._id}
              isPressable
              onPress={() => navigate(`/learning/specific/${categoryId}/paths/${path._id}`)}
              className="group hover:-translate-y-2 transition-transform duration-300 border-none shadow-lg hover:shadow-2xl bg-white dark:bg-slate-800 overflow-visible"
            >
              <CardBody className="p-0 relative overflow-hidden rounded-t-xl">
                {/* Card Header Gradient */}
                <div className={`h-32 relative p-6 flex items-start justify-between ${hasAccess ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-gray-500 to-slate-600 grayscale'}`}>
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl text-white">
                    <IconRoute size={32} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Chip
                      size="sm"
                      variant="solid"
                      classNames={{ base: "bg-white/20 backdrop-blur-md border-none text-white font-bold" }}
                    >
                      Parcours {index + 1}
                    </Chip>
                    {!hasAccess && (
                      <Chip size="sm" color="warning" variant="solid" startContent={<IconLock size={12} />}>
                        Premium
                      </Chip>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-8">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {path?.translations?.fr?.name || 'Parcours'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3">
                    {path?.translations?.fr?.description || 'Commence ce parcours pour progresser en ' + categoryName}
                  </p>
                </div>
              </CardBody>

              <CardFooter className="px-6 pb-6 pt-0 bg-transparent border-none">
                <Button
                  className={`w-full font-semibold transition-colors ${hasAccess ? 'group-hover:bg-indigo-600 group-hover:text-white' : ''}`}
                  color={hasAccess ? "primary" : "default"}
                  variant={hasAccess ? "flat" : "bordered"}
                  endContent={hasAccess ? <IconChevronRight size={18} /> : <IconLock size={18} />}
                >
                  {hasAccess ? "Voir les niveaux" : "Aperçu gratuit"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </ClientPageLayout>
  );
}