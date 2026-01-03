import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getLevelsByPath, getPathsByCategory, getCategories } from '../../services/courseService';
import AccessService from '../../services/accessService';
import API_CONFIG from '../../config/api';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
  Card, CardBody, Button, Chip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@nextui-org/react";
import {
  IconLock, IconLockOpen, IconTrophy,
  IconPlayerPlay, IconFileText, IconBook, IconCheck, IconArrowRight, IconStar
} from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function SpecificPathLevels() {
  const navigate = useNavigate();
  const { categoryId, pathId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { t, language } = useTranslation();
  const [levels, setLevels] = useState([]);
  const [path, setPath] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Access & Progress State
  const [hasAccess, setHasAccess] = useState(false);
  const [accessInfo, setAccessInfo] = useState({});
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

        setHasAccess(accessData?.access?.hasAccess || false);
        setAccessInfo(accessData?.access || {});

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

  const categoryName = category?.translations?.[language]?.name || category?.translations?.fr?.name || 'Langage';
  const pathName = path?.translations?.[language]?.name || path?.translations?.fr?.name || 'Parcours';

  const completedCount = levels.filter(l => userProgress.completedLevels.includes(l._id)).length;
  const progressPercent = levels.length > 0 ? (completedCount / levels.length) * 100 : 0;

  const isLevelCompleted = (id) => userProgress.completedLevels.includes(id);

  const isLevelUnlocked = (index) => {
    if (!hasAccess) return false;
    if (accessInfo?.type === 'admin' || accessInfo?.id === 'admin_bypass') return true;
    if (index === 0) return true;
    const prevLevelId = levels[index - 1]._id;
    return isLevelCompleted(prevLevelId);
  };

  const hasAnyVideo = lvl => lvl && lvl.videos && Object.values(lvl.videos).some(Boolean);
  const hasAnyPdf = lvl => lvl && lvl.pdfs && Object.values(lvl.pdfs).some(Boolean);

  const handlePreview = (level) => {
    setPreviewLevel(level);
    onOpen();
  };

  const openLevel = (id, unlocked) => {
    if (unlocked) {
      navigate(`/courses/levels/${id}`, { state: { fromSpecific: true, categoryId, pathId } });
    }
  };

  return (
    <ClientPageLayout
      breadcrumbs={[
        { label: 'Langages', path: '/learning/choose-language' },
        { label: categoryName, path: `/learning/specific/${categoryId}` },
        { label: pathName }
      ]}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      backPath={`/learning/specific/${categoryId}`}
      backLabel={language === 'ar' ? 'عودة' : "Retour aux parcours"}
    >
      <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-12 pb-24">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 uppercase tracking-wider">
                {categoryName}
              </span>
              {completedCount === levels.length && levels.length > 0 && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                  <IconCheck size={12} /> TERMINÉ
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
              {pathName}
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
              Progresse étape par étape dans ton apprentissage de {categoryName}.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 w-full md:w-auto">
            <div className="relative size-14 flex items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-200 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-out" strokeDasharray={`${progressPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
              <span className="absolute text-sm font-bold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-900 dark:text-white">Votre Progression</span>
              <span className="text-xs text-gray-500">{completedCount}/{levels.length} Niveaux complétés</span>
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-5xl mx-auto py-12 px-4 md:px-8">
          {/* Central Timeline Line (Desktop) / Left Line (Mobile) */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gray-100 dark:bg-slate-800 -translate-x-1/2 rounded-full">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${progressPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-0 w-full bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500"
            />
          </div>

          <div className="space-y-12 md:space-y-0 relative">
            {levels.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aucun niveau disponible pour ce parcours actuellement.
              </div>
            ) : (
              levels.map((lvl, index) => {
                const unlocked = isLevelUnlocked(index);
                const completed = isLevelCompleted(lvl._id);

                return (
                  <LevelNode
                    key={lvl._id}
                    level={lvl}
                    index={index}
                    lang={language}
                    isUnlocked={unlocked}
                    isCompleted={completed}
                    openLevel={openLevel}
                    onPreview={handlePreview}
                    hasAnyVideo={hasAnyVideo}
                    hasAnyPdf={hasAnyPdf}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Preview Modal */}
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          size="2xl"
          backdrop="blur"
          scrollBehavior="inside"
          classNames={{
            base: "bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800",
            header: "border-b border-gray-100 dark:border-slate-800",
            footer: "border-t border-gray-100 dark:border-slate-800"
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <span className="text-2xl">{previewLevel?.translations?.[language]?.title || previewLevel?.translations?.fr?.title || 'Aperçu'}</span>
                </ModalHeader>
                <ModalBody className="py-6">
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    {previewLevel?.translations?.[language]?.content || previewLevel?.translations?.fr?.content || 'Aucune description disponible.'}
                  </p>
                  <div className="flex gap-3 mt-6">
                    <Chip color="primary" variant="flat" startContent={<IconBook size={18} />}>
                      {(previewLevel?.exercises || []).length} {language === 'en' ? 'exercises' : language === 'ar' ? 'تمارين' : 'exercices'}
                    </Chip>
                    {hasAnyVideo(previewLevel) && (
                      <Chip color="secondary" variant="flat" startContent={<IconPlayerPlay size={18} />}>
                        {language === 'en' ? 'Video' : language === 'ar' ? 'فيديو' : 'Vidéo'}
                      </Chip>
                    )}
                    {hasAnyPdf(previewLevel) && (
                      <Chip color="warning" variant="flat" startContent={<IconFileText size={18} />}>
                        Guide PDF
                      </Chip>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    {language === 'en' ? 'Close' : language === 'ar' ? 'إغلاق' : 'Fermer'}
                  </Button>
                  {/* Start Button Logic */}
                  {(() => {
                    const idx = levels.findIndex(l => l._id === previewLevel?._id);
                    const unlocked = isLevelUnlocked(idx);

                    return (
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                        isDisabled={!unlocked}
                        onPress={() => {
                          openLevel(previewLevel._id, unlocked);
                          onClose();
                        }}
                        endContent={<IconArrowRight size={18} />}
                      >
                        {language === 'en' ? 'Start Adventure' : language === 'ar' ? 'ابدأ المغامرة' : "Commencer l'aventure"}
                      </Button>
                    )
                  })()}
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </ClientPageLayout>
  );
}

function LevelNode({ level, index, lang, isUnlocked, isCompleted, openLevel, onPreview, hasAnyVideo, hasAnyPdf }) {
  const isLeft = index % 2 === 0;

  // Determine title
  const title = level?.translations?.[lang]?.title || level?.translations?.fr?.title || level.name;

  return (
    <div className={`relative flex items-center md:items-stretch md:justify-between ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} mb-8 md:mb-[-40px] last:mb-0`}>

      {/* Desktop Spacer */}
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

        {/* Mobile Connecting Line */}
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
                  {lang === 'ar' ? 'المستوى' : 'Niveau'} {index + 1}
                </span>

                <div className="flex gap-2">
                  {hasAnyVideo(level) && <IconPlayerPlay size={16} className={isUnlocked ? "text-blue-400" : "text-gray-300"} />}
                  {hasAnyPdf(level) && <IconFileText size={16} className={isUnlocked ? "text-orange-400" : "text-gray-300"} />}
                </div>
              </div>

              <h4 className={`text-xl font-bold mb-3 leading-tight ${!isUnlocked ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                {title}
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
                    {lang === 'en' ? 'Details' : lang === 'ar' ? 'تفاصيل' : 'Voir les détails'}
                  </Button>
                  <div className={`p-2 rounded-full ${isUnlocked ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors' : 'bg-gray-100 text-gray-400'}`}>
                    <IconArrowRight size={18} />
                  </div>
                </div>
              )}

              {!isUnlocked && (
                <div className="text-xs text-center text-gray-400 mt-2 font-medium bg-gray-100 dark:bg-slate-800 py-2 rounded-lg">
                  {lang === 'ar' ? 'أكمل المستوى السابق' : 'Terminez le niveau précédent'}
                </div>
              )}

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