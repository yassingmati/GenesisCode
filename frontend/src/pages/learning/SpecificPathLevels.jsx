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
    <div className={`relative flex items-center md:items-stretch md:justify-between ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} mb-12 last:mb-0`}>

      {/* Desktop Spacer */}
      <div className="hidden md:block w-[45%]" />

      {/* Central Node */}
      <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10 flex flex-col items-center justify-center top-0">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className={`w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-xl border-4 transition-all duration-500 z-20 ${isCompleted
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-200 dark:border-green-900 text-white shadow-green-500/30'
            : isUnlocked
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-200 dark:border-blue-900 text-white shadow-blue-500/30 animate-pulse-slow'
              : 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400'
            }`}
        >
          {isCompleted ? <IconCheck size={28} stroke={3} /> : isUnlocked ? <IconLockOpen size={24} /> : <IconLock size={24} />}
        </motion.div>
      </div>

      {/* Content Card */}
      <div className={`ml-20 md:ml-0 w-full md:w-[45%] md:min-w-[320px] pl-4 md:pl-0 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
        <motion.div
          initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card
            isPressable={isUnlocked}
            onPress={() => openLevel(level._id, isUnlocked)}
            className={`border transition-all duration-300 overflow-visible transform group ${isUnlocked
              ? 'hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30 cursor-pointer bg-white/80 dark:bg-slate-800/80 backdrop-blur-md'
              : 'opacity-75 bg-gray-50/50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 cursor-not-allowed contrast-75 grayscale-[0.5]'
              } ${isCompleted ? 'border-green-500/30 ring-1 ring-green-500/20' : ''}`}
          >
            {/* Active/Completed Indicator Line */}
            <div className={`absolute top-0 w-1.5 h-full transition-all duration-300 rounded-l-xl ${isCompleted ? 'bg-green-500 left-0 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : isUnlocked ? 'bg-blue-500 left-0 group-hover:w-2 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-300 dark:bg-slate-700 left-0'
              }`} />

            <CardBody className="p-6 relative overflow-hidden">
              {/* Decorative Background Blob for unlocked cards */}
              {isUnlocked && (
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
              )}

              <div className="flex justify-between items-start mb-3 relative z-10">
                <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-md whitespace-nowrap ${isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : isUnlocked ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-200 dark:bg-slate-800 text-gray-500'
                  }`}>
                  {lang === 'ar' ? 'المستوى' : 'Niveau'} {index + 1}
                </span>

                <div className="flex gap-2">
                  {hasAnyVideo(level) && <div className={`p-1.5 rounded-lg ${isUnlocked ? "bg-blue-50 text-blue-500 dark:bg-blue-900/20" : "bg-gray-100 text-gray-400 dark:bg-slate-800"}`}><IconPlayerPlay size={14} /></div>}
                  {hasAnyPdf(level) && <div className={`p-1.5 rounded-lg ${isUnlocked ? "bg-orange-50 text-orange-500 dark:bg-orange-900/20" : "bg-gray-100 text-gray-400 dark:bg-slate-800"}`}><IconFileText size={14} /></div>}
                </div>
              </div>

              <h4 className={`text-xl md:text-2xl font-bold mb-4 leading-tight ${!isUnlocked ? 'text-gray-500' : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'}`}>
                {title}
              </h4>

              {isUnlocked && (
                <div className="flex flex-wrap gap-2 items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-white/5 relative z-10">
                  {/* Action Button */}
                  <Button
                    className={`font-semibold ${isCompleted ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-blue-600 text-white shadow-lg shadow-blue-500/20"}`}
                    size="sm"
                    radius="full"
                    endContent={!isCompleted && <IconArrowRight size={16} />}
                    onPress={(e) => {
                      e.continuePropagation(); // Prevent card click
                      openLevel(level._id, isUnlocked);
                    }}
                  >
                    {isCompleted ? (lang === 'ar' ? 'مكتمل' : 'Revoir') : (lang === 'ar' ? 'ابدأ' : 'Commencer')}
                  </Button>

                  <Button
                    size="sm"
                    variant="light"
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    onPress={(e) => {
                      e.continuePropagation();
                      onPreview(level);
                    }}
                  >
                    {lang === 'en' ? 'Details' : lang === 'ar' ? 'تفاصيل' : 'Aperçu'}
                  </Button>
                </div>
              )}

              {!isUnlocked && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2 font-medium bg-gray-100 dark:bg-slate-800/50 py-3 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                  <IconLock size={14} />
                  {lang === 'ar' ? 'أكمل المستوى السابق' : 'Terminez le niveau précédent'}
                </div>
              )}

              {isCompleted && (
                <div className="absolute -bottom-4 -right-4 text-green-500/10 rotate-12 z-0">
                  <IconTrophy size={120} fill="currentColor" />
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}