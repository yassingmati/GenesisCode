import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLevelsByPath, getPathsByCategory, getCategories } from '../../services/courseService';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
  Card, CardBody, CardFooter, Button, Progress, Chip
} from "@nextui-org/react";
import { IconChevronRight, IconLock, IconLockOpen, IconTrophy } from '@tabler/icons-react';

export default function SpecificPathLevels() {
  const navigate = useNavigate();
  const { categoryId, pathId } = useParams();
  const [levels, setLevels] = useState([]);
  const [path, setPath] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [levelsData, pathsData, categoriesData] = await Promise.all([
          getLevelsByPath(pathId),
          getPathsByCategory(categoryId),
          getCategories('specific')
        ]);

        setLevels(levelsData || []);
        const currentPath = pathsData?.find(p => p._id === pathId);
        const currentCategory = categoriesData?.find(cat => cat._id === categoryId);
        setPath(currentPath);
        setCategory(currentCategory);
      } catch (e) {
        setError('Erreur lors du chargement des niveaux');
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId, pathId]);

  const categoryName = category?.translations?.fr?.name || 'Langage';
  const pathName = path?.translations?.fr?.name || 'Parcours';

  // Calculate progress (mock logic for now, can be connected to real user progress later)
  const progress = 0;

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
        <CardBody className="flex flex-row items-center justify-between p-6">
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
            const isUnlocked = true; // All levels unlocked for now

            return (
              <Card
                key={level._id}
                isPressable={isUnlocked}
                onPress={() => isUnlocked && navigate(`/courses/levels/${level._id}`, { state: { fromSpecific: true, categoryId, pathId } })}
                className={`border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 ${!isUnlocked ? 'opacity-75 grayscale' : 'hover:-translate-y-1'}`}
              >
                <CardBody className="p-0">
                  <div className={`h-2 bg-gradient-to-r ${isUnlocked ? 'from-blue-400 to-indigo-500' : 'from-gray-300 to-gray-400 dark:from-slate-600 dark:to-slate-500'}`} />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={isUnlocked ? "primary" : "default"}
                        className="font-bold"
                      >
                        Niveau {index + 1}
                      </Chip>
                      {isUnlocked ? (
                        <IconLockOpen size={20} className="text-green-500" />
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
                  </div>
                </CardBody>

                <CardFooter className="px-6 pb-6 pt-0 bg-transparent border-none">
                  <Button
                    className="w-full font-semibold"
                    color={isUnlocked ? "primary" : "default"}
                    variant={isUnlocked ? "solid" : "flat"}
                    isDisabled={!isUnlocked}
                    endContent={isUnlocked && <IconChevronRight size={18} />}
                  >
                    {isUnlocked ? "Commencer" : "Verrouillé"}
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