import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLevelsByPath, getPathsByCategory, getCategories } from '../../services/courseService';
// import CategoryPaymentService from '../../services/categoryPaymentService'; // Deprecated for this view
import AccessService from '../../services/accessService';
import API_CONFIG from '../../config/api';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
  Card, CardBody, CardFooter, Button, Progress, Chip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@nextui-org/react";
import {
  IconChevronRight, IconLock, IconLockOpen, IconTrophy,
  IconPlayerPlay, IconFileText, IconBook, IconCheck, IconArrowRight
} from '@tabler/icons-react';

export default function SpecificPathLevels() {
  const navigate = useNavigate();
  const { categoryId, pathId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [levels, setLevels] = useState([]);
  const [path, setPath] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Access & Progress State
  const [hasAccess, setHasAccess] = useState(false);
  const [accessInfo, setAccessInfo] = useState({}); // New state for detailed access info
  const [userProgress, setUserProgress] = useState({ completedLevels: [] });
  const [previewLevel, setPreviewLevel] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [levelsData, pathsData, categoriesData, accessData] = await Promise.all([
          getLevelsByPath(pathId),
          getPathsByCategory(categoryId),
          getCategories('specific'),
          AccessService.checkAccess(pathId).catch(() => ({ success: false, access: { hasAccess: false } }))
        ]);

        const sortedLevels = (levelsData || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        setLevels(sortedLevels);

        const currentPath = pathsData?.find(p => p._id === pathId);
        const currentCategory = categoriesData?.find(cat => cat._id === categoryId);
        setPath(currentPath);
        setCategory(currentCategory);

        // Store access info (structure from checkAccess is { success, access: { hasAccess, ... } })
        setHasAccess(accessData?.access?.hasAccess || false);
        setAccessInfo(accessData?.access || {});

        // Fetch User Progress
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (userId && token && sortedLevels.length > 0) {
          const completedLevelIds = [];
          await Promise.all(sortedLevels.map(async (level) => {
            try {
              const res = await fetch(`${API_CONFIG.BASE_URL}/api/courses/users/${userId}/levels/${level._id}/progress`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                const progress = await res.json();
                if (progress.completedExercises === progress.totalExercises && progress.totalExercises > 0) {
                  completedLevelIds.push(level._id);
                }
              }
            } catch (e) { console.error('Progress fetch error', e); }
          }));
          setUserProgress({ completedLevels: completedLevelIds });
        }

      } catch (e) {
        setError('Erreur lors du chargement des niveaux');
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId, pathId]);

  const categoryName = category?.translations?.fr?.name || 'Langage';
  const pathName = path?.translations?.fr?.name || 'Parcours';

  // Calculate progress
  const completedCount = levels.filter(l => userProgress.completedLevels.includes(l._id)).length;
  const progress = levels.length > 0 ? (completedCount / levels.length) * 100 : 0;

  const isLevelCompleted = (id) => userProgress.completedLevels.includes(id);

  const isLevelUnlocked = (index) => {
    if (!hasAccess) return false; // Category locked

    // Admin Bypass: If access type is admin, everything is unlocked
    if (accessInfo?.type === 'admin' || accessInfo?.id === 'admin_bypass') {
      return true;
    }

    if (index === 0) return true; // First level always open if category access
    const prevLevelId = levels[index - 1]._id;
    return isLevelCompleted(prevLevelId);
  };

  const hasAnyVideo = lvl => lvl && lvl.videos && Object.values(lvl.videos).some(Boolean);
  const hasAnyPdf = lvl => lvl && lvl.pdfs && Object.values(lvl.pdfs).some(Boolean);

  const handlePreview = (level) => {
    setPreviewLevel(level);
    onOpen();
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
            const unlocked = isLevelUnlocked(index);
            const completed = isLevelCompleted(level._id);
            const hasVideo = hasAnyVideo(level);
            const hasPdf = hasAnyPdf(level);

            return (
              <Card
                key={level._id}
                isPressable={unlocked}
                onPress={() => unlocked && navigate(`/courses/levels/${level._id}`, { state: { fromSpecific: true, categoryId, pathId } })}
                className={`border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 ${!unlocked ? 'opacity-75 grayscale bg-gray-50 dark:bg-slate-900' : 'hover:-translate-y-1'}`}
              >
                <CardBody className="p-0 relative overflow-hidden">
                  {/* Status Indicator */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800" />
                  {completed && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-500" />}
                  {unlocked && !completed && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500" />}

                  <div className="p-6 pl-8"> {/* Added padding-left for indicator */}
                    <div className="flex justify-between items-start mb-4">
                      <Chip
                        size="sm"
                        variant={completed ? "solid" : "flat"}
                        color={completed ? "success" : unlocked ? "primary" : "default"}
                        className="font-bold"
                      >
                        Niveau {index + 1}
                      </Chip>
                      <div className="flex gap-1">
                        {completed ? (
                          <IconCheck size={20} className="text-green-500" />
                        ) : unlocked ? (
                          <IconLockOpen size={20} className="text-blue-500" />
                        ) : (
                          <IconLock size={20} className="text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                    </div>

                    <h3 className={`text-xl font-bold mb-2 line-clamp-2 min-h-[3.5rem] ${!unlocked ? 'text-gray-500' : 'text-gray-800 dark:text-white'}`}>
                      {level?.translations?.fr?.title || level.name}
                    </h3>

                    <div className="flex gap-2 mt-2 mb-4">
                      {hasVideo && <IconPlayerPlay size={16} className={unlocked ? "text-secondary" : "text-gray-300"} />}
                      {hasPdf && <IconFileText size={16} className={unlocked ? "text-warning" : "text-gray-300"} />}
                    </div>
                  </div>
                </CardBody>

                <CardFooter className="px-6 pb-6 pt-0 gap-2 pl-8 border-none bg-transparent">
                  <Button
                    size="sm"
                    variant="light"
                    fullWidth
                    isDisabled={!unlocked && !hasAccess} // Allow preview if has access but locked level (maybe? actually preview should be always allowed if has category access?) 
                    // Let's stick to Deck's logic: preview usually allowed.
                    // BUT, if category is locked (hasAccess=false), maybe disallow event preview?
                    onPress={(e) => {
                      e.continuePropagation();
                      handlePreview(level);
                    }}
                  >
                    Aperçu
                  </Button>
                  <Button
                    size="sm"
                    className="font-semibold"
                    color={unlocked ? "primary" : "default"}
                    variant={unlocked ? "solid" : "flat"}
                    isDisabled={!unlocked}
                    fullWidth
                    endContent={unlocked && <IconChevronRight size={18} />}
                  >
                    {unlocked ? "Commencer" : "Verrouillé"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {previewLevel?.translations?.fr?.title || 'Aperçu'}
              </ModalHeader>
              <ModalBody>
                <p className="text-default-500">
                  {previewLevel?.translations?.fr?.description || 'Aucune description disponible.'}
                </p>
                <div className="flex gap-2 mt-4">
                  <Chip color="primary" variant="flat" startContent={<IconBook size={16} />}>
                    {(previewLevel?.exercises || []).length} exercices
                  </Chip>
                  {hasAnyVideo(previewLevel) && (
                    <Chip color="secondary" variant="flat" startContent={<IconPlayerPlay size={16} />}>
                      Vidéo
                    </Chip>
                  )}
                  {hasAnyPdf(previewLevel) && (
                    <Chip color="warning" variant="flat" startContent={<IconFileText size={16} />}>
                      PDF
                    </Chip>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fermer
                </Button>
                {/* Only allow starting if unlocked */}
                {
                  (() => {
                    const idx = levels.findIndex(l => l._id === previewLevel?._id);
                    const unlocked = isLevelUnlocked(idx);

                    return (
                      <Button
                        color="primary"
                        isDisabled={!unlocked}
                        onPress={() => {
                          if (unlocked) {
                            navigate(`/courses/levels/${previewLevel._id}`, {
                              state: {
                                fromSpecific: true,
                                categoryId,
                                pathId
                              }
                            });
                            onClose();
                          }
                        }}
                        endContent={<IconArrowRight size={16} />}
                      >
                        Commencer
                      </Button>
                    )
                  })()
                }
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>    </ClientPageLayout>
  );
}