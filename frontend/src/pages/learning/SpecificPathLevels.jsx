import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLevelsByPath, getPathsByCategory, getCategories } from '../../services/courseService';
import CategoryPaymentService from '../../services/categoryPaymentService';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
  Card, CardBody, CardFooter, Button, Progress, Chip
} from "@nextui-org/react";
import { IconChevronRight, IconLock, IconLockOpen, IconTrophy, IconPremiumRights } from '@tabler/icons-react';

export default function SpecificPathLevels() {
  const navigate = useNavigate();
  const { categoryId, pathId } = useParams();
  const [levels, setLevels] = useState([]);
  const [path, setPath] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New state for access and progress
  const [hasAccess, setHasAccess] = useState(false);
  const [completedLevels, setCompletedLevels] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [levelsData, pathsData, categoriesData, accessHistory] = await Promise.all([
          getLevelsByPath(pathId),
          getPathsByCategory(categoryId),
          getCategories('specific'),
          CategoryPaymentService.getUserAccessHistory().catch(() => ({ purchases: [] }))
        ]);

        setLevels(levelsData || []);
        const currentPath = pathsData?.find(p => p._id === pathId);
        const currentCategory = categoriesData?.find(cat => cat._id === categoryId);
        setPath(currentPath);
        setCategory(currentCategory);

        // Check access
        const isUnlocked = accessHistory?.purchases?.some(
          p => (p.categoryId === categoryId || p.category === categoryId) && p.status === 'active'
        );
        setHasAccess(!!isUnlocked);

        // TODO: Fetch real user progress for levels
        // For now, we'll simulate that if you have access, you might have some progress
        // Ideally, we need an endpoint like /api/users/me/progress/category/{categoryId}
        setCompletedLevels([]);

      } catch (e) {
        setError('Erreur lors du chargement des niveaux');
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId, pathId]);

  const categoryName = category?.translations?.fr?.name || 'Langage';
  const pathName = path?.translations?.fr?.name || 'Parcours';

  // Calculate progress
  const progress = levels.length > 0 ? (completedLevels.length / levels.length) * 100 : 0;

  const handleUnlockClick = async () => {
    try {
      setLoading(true);
      // Fetch the plan for this category
      const plan = await CategoryPaymentService.getCategoryPlan(categoryId);

      if (plan) {
        // Adapt plan for PaymentSelectionPage
        const adaptedPlan = {
          ...plan,
          priceMonthly: plan.price * 100, // Assuming price is in TND (e.g. 30) and we need 3000 for display logic
          interval: 'lifetime',
          currency: plan.currency || 'TND'
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
      title={pathName}
      subtitle={`Progresse étape par étape dans ton apprentissage de ${categoryName}.`}
      breadcrumbs={[
        { label: 'Langages', path: '/learning/choose-language' },
        { label: categoryName, path: `/learning/specific/${categoryId}` },
        { label: pathName }
      ]}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      backPath={`/learning/specific/${categoryId}`}
      backLabel="Retour aux parcours"
    >
      {/* Progress Overview */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-none shadow-sm">
        <CardBody className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
          <div className="flex flex-col gap-2 w-full max-w-md">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <IconTrophy size={20} className="text-yellow-500" />
                Progression
              </h3>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{levels.length} niveaux</span>
            </div>
            <Progress
              value={progress}
              className="max-w-md"
              color="success"
              size="sm"
              classNames={{
                indicator: "bg-gradient-to-r from-green-400 to-emerald-600",
                track: "bg-gray-200 dark:bg-slate-700"
              }}
            />
          </div>

          {!hasAccess && (
            <Button
              color="warning"
              variant="shadow"
              className="font-bold text-white w-full md:w-auto"
              endContent={<IconPremiumRights size={18} />}
              onPress={handleUnlockClick}
            >
              Débloquer tout le parcours
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Levels Grid */}
      {levels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun niveau disponible pour ce parcours.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level, index) => {
            // Logic for unlocking:
            // 1. If hasAccess (paid), check sequential progress (Level 1 open, others need prev completed)
            // 2. If !hasAccess (free), only Level 1 is open (Preview)

            let isUnlocked = false;
            let isFreePreview = false;

            if (index === 0) {
              isUnlocked = true; // Level 1 always open
              if (!hasAccess) isFreePreview = true;
            } else {
              if (hasAccess) {
                // If paid, check if previous level is completed
                // For now, since we don't have real progress, we unlock everything if paid
                // TODO: Implement real sequential check: isUnlocked = completedLevels.includes(levels[index-1]._id)
                isUnlocked = true;
              } else {
                isUnlocked = false; // Locked if not paid and not level 1
              }
            }

            const isCompleted = completedLevels.includes(level._id);

            return (
              <Card
                key={level._id}
                isPressable={isUnlocked}
                onPress={() => isUnlocked && navigate(`/courses/levels/${level._id}`, { state: { fromSpecific: true, categoryId, pathId } })}
                className={`border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 ${!isUnlocked ? 'opacity-75 grayscale-[0.5]' : 'hover:-translate-y-1'}`}
              >
                <CardBody className="p-0">
                  <div className={`h-2 bg-gradient-to-r ${isCompleted ? 'from-green-400 to-emerald-500' : isUnlocked ? 'from-blue-400 to-indigo-500' : 'from-gray-300 to-gray-400 dark:from-slate-600 dark:to-slate-500'}`} />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={isCompleted ? "success" : isUnlocked ? "primary" : "default"}
                        className="font-bold"
                      >
                        Niveau {index + 1}
                      </Chip>
                      {isCompleted ? (
                        <IconTrophy size={20} className="text-yellow-500" />
                      ) : isUnlocked ? (
                        <IconLockOpen size={20} className="text-blue-500" />
                      ) : (
                        <IconLock size={20} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem]">
                      {level?.translations?.fr?.title || level.name}
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                      {level?.translations?.fr?.description || 'Complète ce niveau pour avancer.'}
                    </p>

                    {isFreePreview && (
                      <Chip size="sm" color="secondary" variant="flat" className="mb-2">Aperçu Gratuit</Chip>
                    )}
                  </div>
                </CardBody>

                <CardFooter className="px-6 pb-6 pt-0 bg-transparent border-none">
                  <Button
                    className="w-full font-semibold"
                    color={isUnlocked ? "primary" : "default"}
                    variant={isUnlocked ? "solid" : "flat"}
                    isDisabled={!isUnlocked}
                    endContent={isUnlocked ? <IconChevronRight size={18} /> : <IconLock size={18} />}
                  >
                    {isCompleted ? "Revoir" : isUnlocked ? "Commencer" : "Premium"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </ClientPageLayout>
  );
}