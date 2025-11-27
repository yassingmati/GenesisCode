import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import API_CONFIG from '../../config/api';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Tooltip,
  Divider,
  Progress
} from "@nextui-org/react";
import {
  IconPlayerPlay,
  IconFileText,
  IconArrowRight,
  IconBook,
  IconLock,
  IconLockOpen,
  IconCheck
} from '@tabler/icons-react';

const API_BASE = `${API_CONFIG.BASE_URL}/api/courses`;

export default function DebutantMap() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // États de l'interface
  const { language } = useLanguage();
  const lang = language;
  const [activeCategory, setActiveCategory] = useState(null);
  const [previewLevel, setPreviewLevel] = useState(null);

  // États des données
  const [categories, setCategories] = useState([]);
  const [pathsByCategory, setPathsByCategory] = useState({});
  const [levelsByPath, setLevelsByPath] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState({ completedLevels: [] });

  // Chargement des données
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Load Categories (Classic only)
        const rc = await fetch(`${API_BASE}/categories`, { headers: API_CONFIG.getDefaultHeaders() });
        if (!rc.ok) throw new Error(`Erreur catégories: ${rc.status}`);
        const allCats = await rc.json();
        const classicCats = allCats.filter(c => c.type === 'classic');

        if (!mounted) return;
        setCategories(classicCats || []);

        // 2. Load Paths for these categories
        const pmap = {};
        await Promise.all(classicCats.map(async (cat) => {
          try {
            const rp = await fetch(`${API_BASE}/categories/${cat._id}/paths`, { headers: API_CONFIG.getDefaultHeaders() });
            pmap[cat._id] = rp.ok ? (await rp.json()) : [];
          } catch { pmap[cat._id] = []; }
        }));

        if (!mounted) return;
        setPathsByCategory(pmap);

        // 3. Load Levels for these paths
        const allPaths = Object.values(pmap).flat();
        const lmap = {};
        await Promise.all(allPaths.map(async p => {
          try {
            const rl = await fetch(`${API_BASE}/paths/${p._id}/levels`, { headers: API_CONFIG.getDefaultHeaders() });
            lmap[p._id] = rl.ok ? (await rl.json()) : [];
          } catch { lmap[p._id] = []; }
        }));

        if (!mounted) return;
        setLevelsByPath(lmap);

        // 4. Load User Progress from backend API
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (userId && token) {
          try {
            // Get all level IDs from the loaded levels
            const allLevelIds = Object.values(lmap).flat().map(level => level._id);

            // Fetch completion status for each level
            const completedLevelIds = [];
            await Promise.all(allLevelIds.map(async (levelId) => {
              try {
                const progressRes = await fetch(`${API_BASE}/users/${userId}/levels/${levelId}/progress`, {
                  headers: API_CONFIG.getDefaultHeaders()
                });

                if (progressRes.ok) {
                  const progressData = await progressRes.json();
                  // Check if all exercises are completed
                  if (progressData.completedExercises === progressData.totalExercises && progressData.totalExercises > 0) {
                    completedLevelIds.push(levelId);
                  }
                }
              } catch (err) {
                console.error(`Failed to check level ${levelId}:`, err);
              }
            }));

            console.log('Completed level IDs:', completedLevelIds); // Debug log
            setUserProgress({ completedLevels: completedLevelIds });
          } catch (progressErr) {
            console.error('Failed to load user progress:', progressErr);
            // Fallback to localStorage
            const storedProgress = localStorage.getItem('userProgress');
            if (storedProgress) {
              setUserProgress(JSON.parse(storedProgress));
            } else {
              setUserProgress({ completedLevels: [] });
            }
          }
        } else {
          setUserProgress({ completedLevels: [] });
        }

      } catch (e) {
        console.error(e);
        if (mounted) setError(e.message || 'Erreur de chargement');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, []);

  const hasAnyVideo = lvl => lvl && lvl.videos && Object.values(lvl.videos).some(Boolean);
  const hasAnyPdf = lvl => lvl && lvl.pdfs && Object.values(lvl.pdfs).some(Boolean);

  const openLevel = (id, isUnlocked) => {
    if (!id || !isUnlocked) return;
    navigate(`/courses/levels/${id}`);
  };

  const handlePreview = (level) => {
    setPreviewLevel(level);
    onOpen();
  };

  // Helper to check if level is unlocked
  // Logic: Level is unlocked if it's the first one OR if the previous one is completed
  const isLevelUnlocked = (level, index, allLevelsInPath) => {
    if (index === 0) return true;
    const prevLevel = allLevelsInPath[index - 1];
    return userProgress.completedLevels.includes(prevLevel._id);
  };

  const isLevelCompleted = (levelId) => {
    return userProgress.completedLevels.includes(levelId);
  };

  return (
    <ClientPageLayout
      title={t('courses.title') || "Parcours d'apprentissage"}
      subtitle={t('courses.subtitle') || "Explorez nos parcours classiques et progressez étape par étape."}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      showBackButton={true}
      backPath="/dashboard"
      backLabel="Tableau de bord"
    >
      <div className="space-y-16 pb-12">
        {categories.length === 0 && !loading ? (
          <div className="text-center py-12 text-gray-500">
            Aucun parcours classique disponible pour le moment.
          </div>
        ) : (
          categories.map(cat => (
            <CategorySection
              key={cat._id}
              category={cat}
              paths={pathsByCategory[cat._id] || []}
              levelsByPath={levelsByPath}
              lang={lang}
              openLevel={openLevel}
              hasAnyVideo={hasAnyVideo}
              hasAnyPdf={hasAnyPdf}
              onPreview={handlePreview}
              isLevelUnlocked={isLevelUnlocked}
              isLevelCompleted={isLevelCompleted}
            />
          ))
        )}
      </div>

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
                {previewLevel?.translations?.[lang]?.title || previewLevel?.translations?.fr?.title || 'Aperçu'}
              </ModalHeader>
              <ModalBody>
                <p className="text-default-500">
                  {previewLevel?.translations?.[lang]?.content || 'Aucune description disponible.'}
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
                <Button
                  color="primary"
                  onPress={() => {
                    openLevel(previewLevel._id, true); // Preview implies access or just info
                    onClose();
                  }}
                  endContent={<IconArrowRight size={16} />}
                >
                  Commencer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </ClientPageLayout>
  );
}

function CategorySection({
  category,
  paths,
  levelsByPath,
  lang,
  openLevel,
  hasAnyVideo,
  hasAnyPdf,
  onPreview,
  isLevelUnlocked,
  isLevelCompleted
}) {
  if (paths.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          {category.translations?.[lang]?.name || category.translations?.fr?.name || 'Sans nom'}
        </h2>
        <Chip variant="flat" color="primary" size="sm">{paths.length} parcours</Chip>
      </div>

      <div className="grid gap-8">
        {paths.map(path => {
          const lvls = (levelsByPath[path._id] || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
          if (lvls.length === 0) return null;

          return (
            <PathSection
              key={path._id}
              path={path}
              levels={lvls}
              lang={lang}
              openLevel={openLevel}
              hasAnyVideo={hasAnyVideo}
              hasAnyPdf={hasAnyPdf}
              onPreview={onPreview}
              isLevelUnlocked={isLevelUnlocked}
              isLevelCompleted={isLevelCompleted}
            />
          );
        })}
      </div>
    </div>
  );
}

function PathSection({ path, levels, lang, openLevel, hasAnyVideo, hasAnyPdf, onPreview, isLevelUnlocked, isLevelCompleted }) {
  // Calculate progress for this path
  const completedCount = levels.filter(l => isLevelCompleted(l._id)).length;
  const progress = levels.length > 0 ? (completedCount / levels.length) * 100 : 0;

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-md border border-gray-100 dark:border-slate-700 overflow-visible">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 gap-4 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            {path.translations?.[lang]?.name || path.translations?.fr?.name || 'Sans nom'}
          </h3>
          <p className="text-small text-gray-500 dark:text-gray-400 mt-1">
            {levels.length} niveaux • {completedCount} complété(s)
          </p>
        </div>
        <div className="w-full sm:w-48">
          <Progress
            value={progress}
            color="success"
            size="sm"
            classNames={{
              indicator: "bg-gradient-to-r from-green-400 to-emerald-600",
            }}
            aria-label="Progression du parcours"
          />
        </div>
      </CardHeader>
      <CardBody className="p-6">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {levels.map((lvl, index) => {
            const unlocked = isLevelUnlocked(lvl, index, levels);
            const completed = isLevelCompleted(lvl._id);

            return (
              <LevelCard
                key={lvl._id}
                level={lvl}
                index={index}
                lang={lang}
                openLevel={openLevel}
                hasAnyVideo={hasAnyVideo}
                hasAnyPdf={hasAnyPdf}
                onPreview={onPreview}
                isUnlocked={unlocked}
                isCompleted={completed}
              />
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

function LevelCard({ level, index, lang, openLevel, hasAnyVideo, hasAnyPdf, onPreview, isUnlocked, isCompleted }) {
  const hasVideo = hasAnyVideo(level);
  const hasPdf = hasAnyPdf(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        isPressable={isUnlocked}
        onPress={() => openLevel(level._id, isUnlocked)}
        className={`h-full transition-all duration-300 border-none shadow-sm hover:shadow-md ${!isUnlocked ? 'opacity-70 bg-gray-50 dark:bg-slate-900' : 'hover:-translate-y-1 bg-white dark:bg-slate-800'
          }`}
      >
        <CardBody className="p-5 relative overflow-hidden">
          {/* Status Indicator */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800" />
          {isCompleted && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-500" />}
          {isUnlocked && !isCompleted && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500" />}

          <div className="flex justify-between items-start mb-4 pl-3">
            <Chip
              size="sm"
              variant={isCompleted ? "solid" : "flat"}
              color={isCompleted ? "success" : isUnlocked ? "primary" : "default"}
              classNames={{ content: "font-bold" }}
            >
              Niveau {index + 1}
            </Chip>
            <div className="flex gap-1">
              {isCompleted ? (
                <IconCheck size={20} className="text-green-500" />
              ) : isUnlocked ? (
                <IconLockOpen size={20} className="text-blue-500" />
              ) : (
                <IconLock size={20} className="text-gray-400" />
              )}
            </div>
          </div>

          <h4 className={`font-bold text-lg mb-2 line-clamp-2 pl-3 ${!isUnlocked ? 'text-gray-500' : 'text-gray-800 dark:text-white'}`}>
            {level.translations?.[lang]?.title || level.translations?.fr?.title || 'Sans titre'}
          </h4>

          <div className="flex gap-2 mt-auto pl-3">
            {hasVideo && <IconPlayerPlay size={16} className={isUnlocked ? "text-secondary" : "text-gray-300"} />}
            {hasPdf && <IconFileText size={16} className={isUnlocked ? "text-warning" : "text-gray-300"} />}
          </div>
        </CardBody>

        <CardFooter className="pt-0 pb-4 px-5 gap-2 pl-8">
          <Button
            size="sm"
            variant="light"
            fullWidth
            isDisabled={!isUnlocked}
            onPress={(e) => {
              e.continuePropagation();
              onPreview(level);
            }}
          >
            Aperçu
          </Button>
          <Button
            size="sm"
            color={isUnlocked ? "primary" : "default"}
            variant={isUnlocked ? "solid" : "flat"}
            fullWidth
            isDisabled={!isUnlocked}
            endContent={isUnlocked && <IconArrowRight size={14} />}
          >
            {isUnlocked ? "Go" : "Bloqué"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}