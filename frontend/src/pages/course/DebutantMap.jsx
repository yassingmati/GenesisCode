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
  IconCheck,
  IconStar
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
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
            {category.translations?.[lang]?.name || category.translations?.fr?.name || 'Sans nom'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Explorez les différentes étapes de ce programme
          </p>
        </div>
        <Chip variant="shadow" color="primary" className="md:ml-auto">{paths.length} Parcours</Chip>
      </div>

      <div className="grid gap-16">
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
  const completedCount = levels.filter(l => isLevelCompleted(l._id)).length;
  const progressPercent = levels.length > 0 ? (completedCount / levels.length) * 100 : 0;

  return (
    <Card className="bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800 overflow-visible rounded-3xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-slate-800">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
      </div>

      <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center px-8 py-8 gap-6 border-b border-gray-100 dark:border-slate-800/50 bg-gradient-to-b from-gray-50/80 to-transparent dark:from-slate-800/50 dark:to-transparent">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">PARCOURS</span>
            {completedCount === levels.length && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                <IconCheck size={12} /> TERMINÉ
              </span>
            )}
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            {path.translations?.[lang]?.name || path.translations?.fr?.name || 'Sans nom'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            {levels.length} niveaux • {completedCount} complétés
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="relative size-12 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-gray-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              <path className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-out" strokeDasharray={`${progressPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
            <span className="absolute text-sm font-bold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Progression</span>
            <span className="text-xs text-gray-500">Continuez ainsi !</span>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0 relative min-h-[400px]">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto py-16 px-4 md:px-8">
          {/* Central Timeline Line (Desktop) / Left Line (Mobile) */}
          <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-1 bg-gray-200 dark:bg-slate-700 -translate-x-1/2 rounded-full">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${progressPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-0 w-full bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500"
            />
          </div>

          <div className="space-y-12 md:space-y-0 relative">
            {levels.map((lvl, index) => {
              const unlocked = isLevelUnlocked(lvl, index, levels);
              const completed = isLevelCompleted(lvl._id);

              return (
                <LevelNode
                  key={lvl._id}
                  level={lvl}
                  index={index}
                  lang={lang}
                  isUnlocked={unlocked}
                  isCompleted={completed}
                  openLevel={openLevel}
                  onPreview={onPreview}
                  hasAnyVideo={hasAnyVideo}
                  hasAnyPdf={hasAnyPdf}
                />
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function LevelNode({ level, index, lang, isUnlocked, isCompleted, openLevel, onPreview, hasAnyVideo, hasAnyPdf }) {
  const isLeft = index % 2 === 0;

  return (
    <div className={`relative flex items-center md:items-stretch md:justify-between ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} mb-8 md:mb-[-40px] last:mb-0`}>

      {/* Desktop Spacer for alternating layout */}
      <div className="hidden md:block w-[45%]" />

      {/* Central Node */}
      <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg border-4 transition-colors duration-500 ${isCompleted
            ? 'bg-green-500 border-green-100 dark:border-green-900 text-white'
            : isUnlocked
              ? 'bg-blue-600 border-blue-100 dark:border-blue-900 text-white animate-pulse-slow'
              : 'bg-gray-200 dark:bg-slate-700 border-gray-100 dark:border-slate-800 text-gray-400'
            }`}
        >
          {isCompleted ? <IconCheck size={24} stroke={3} /> : isUnlocked ? <IconLockOpen size={20} /> : <IconLock size={20} />}
        </motion.div>

        {/* Mobile Connecting Line to Card */}
        <div className="md:hidden h-full w-0.5 bg-gray-200 dark:bg-slate-700 absolute top-14 bottom-[-100px]" />
      </div>

      {/* Content Card */}
      <div className={`ml-20 md:ml-0 w-full md:w-[45%] pl-4 md:pl-0 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
        <motion.div
          initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card
            isPressable={isUnlocked}
            onPress={() => openLevel(level._id, isUnlocked)}
            className={`border transition-all duration-300 overflow-hidden transform group ${isUnlocked
              ? 'hover:-translate-y-2 hover:shadow-xl hover:border-blue-500/50 cursor-pointer bg-white dark:bg-slate-800'
              : 'opacity-70 bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 cursor-not-allowed'
              } ${isCompleted ? 'border-green-500/30' : ''}`}
          >
            <div className={`absolute top-0 w-1 h-full transition-all duration-300 ${isCompleted ? 'bg-green-500 left-0' : isUnlocked ? 'bg-blue-500 left-0 group-hover:w-2' : 'bg-gray-300 left-0'
              }`} />

            <CardBody className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isCompleted ? 'text-green-600' : isUnlocked ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                  Niveau {index + 1}
                </span>

                {/* Icons for resources */}
                <div className="flex gap-2">
                  {hasAnyVideo(level) && <IconPlayerPlay size={16} className={isUnlocked ? "text-blue-400" : "text-gray-300"} />}
                  {hasAnyPdf(level) && <IconFileText size={16} className={isUnlocked ? "text-orange-400" : "text-gray-300"} />}
                </div>
              </div>

              <h4 className={`text-xl font-bold mb-3 leading-tight ${!isUnlocked ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                {level.translations?.[lang]?.title || level.translations?.fr?.title || 'Sans titre'}
              </h4>

              {isUnlocked && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    className="font-medium px-0"
                    onPress={(e) => {
                      e.continuePropagation();
                      onPreview(level);
                    }}
                  >
                    Voir les détails
                  </Button>
                  <div className={`p-2 rounded-full ${isUnlocked ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors' : 'bg-gray-100 text-gray-400'}`}>
                    <IconArrowRight size={18} />
                  </div>
                </div>
              )}

              {/* Lock Overlay Content */}
              {!isUnlocked && (
                <div className="text-xs text-center text-gray-400 mt-2 font-medium bg-gray-100 dark:bg-slate-800 py-2 rounded-lg">
                  Terminez le niveau précédent
                </div>
              )}

              {/* Completed Star Decoration */}
              {isCompleted && (
                <div className="absolute top-2 right-2 text-yellow-500 opacity-20 rotate-12">
                  <IconStar size={64} fill="currentColor" />
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}