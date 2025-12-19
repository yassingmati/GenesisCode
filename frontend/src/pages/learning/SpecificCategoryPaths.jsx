// src/pages/learning/SpecificCategoryPaths.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPathsByCategory, getCategories } from '../../services/courseService';
import CategoryPaymentService from '../../services/categoryPaymentService';
import CategoryPaymentModal from '../../components/payment/CategoryPaymentModal';
import Header from '../dashboard/Header'; // Utiliser le Header global directement
import {
  Button, Chip, Spinner, useDisclosure
} from "@nextui-org/react";
import { IconRoute, IconChevronRight, IconArrowLeft, IconLock, IconMapPin, IconTrophy } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * SpecificCategoryPaths.jsx - Creative "Learning Roadmap" Redesign
 */

export default function SpecificCategoryPaths() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { t, language } = useTranslation();
  const [paths, setPaths] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    (async () => {
      try {
        const [pathsData, categoriesData, accessData] = await Promise.all([
          getPathsByCategory(categoryId),
          getCategories('specific'),
          CategoryPaymentService.checkCategoryAccess(categoryId).catch(() => ({ hasAccess: false }))
        ]);

        setPaths(pathsData || []);
        const currentCategory = categoriesData?.find(cat => cat._id === categoryId);
        setCategory(currentCategory);
        setHasAccess(accessData?.hasAccess || false);
      } catch (e) {
        setError(t('categoryPlans.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId, language, t]);

  const handleUnlockClick = () => {
    onOpen();
  };

  const getTranslatedContent = (item, field) => {
    if (!item || !item.translations) return '';
    // Gestion du fallback: Langue actuelle -> Anglais -> Français -> Valeur directe
    if (item.translations[language] && item.translations[language][field]) {
      return item.translations[language][field];
    }
    if (item.translations['en'] && item.translations['en'][field]) {
      return item.translations['en'][field];
    }
    if (item.translations['fr'] && item.translations['fr'][field]) {
      return item.translations['fr'][field];
    }
    return item[field] || '';
  };

  const categoryName = getTranslatedContent(category, 'name') || 'Langage';

  // Dummy functions for Header
  const noop = () => { };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-white transition-colors duration-300 relative overflow-x-hidden">

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-50">
        <Header
          toggleSidebar={noop}
          collapsed={false}
          toggleMobileMenu={noop}
          setActivePage={noop}
        />
      </div>

      <CategoryPaymentModal
        isOpen={isOpen}
        onClose={onOpenChange}
        categoryId={categoryId}
        categoryName={categoryName}
      />

      <main className="container mx-auto px-4 md:px-8 pt-6 pb-20 relative z-10 max-w-6xl">

        {/* Navigation & Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <Button
              variant="light"
              startContent={<IconArrowLeft size={18} />}
              onPress={() => navigate('/learning/choose-language')}
              className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white mb-2 p-0 min-w-0 h-auto data-[hover=true]:bg-transparent"
            >
              {t('specificPaths.backToLanguages')}
            </Button>
            <h1 className="text-3xl md:text-5xl font-bold mt-2">
              {t('specificPaths.roadmap')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-500">{categoryName}</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-slate-400 mt-2 max-w-2xl">
              {t('specificPaths.followPath', { category: categoryName }).replace('{{category}}', categoryName)}
            </p>
          </div>

          {hasAccess && (
            <Chip
              startContent={<IconTrophy size={16} />}
              variant="shadow"
              color="success"
              classNames={{ base: "bg-gradient-to-r from-emerald-500 to-teal-500 border-none px-2 py-1" }}
            >
              {t('specificPaths.unlockedAccess')}
            </Chip>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" color="primary" />
          </div>
        ) : error ? (
          <div className="text-center p-12 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-200 dark:border-red-900/30">
            <p className="text-red-500 text-xl font-semibold mb-4">{error}</p>
            <Button color="danger" variant="flat" onPress={() => window.location.reload()}>{t('categoryPlans.retry')}</Button>
          </div>
        ) : paths.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-3xl bg-gray-50/50 dark:bg-slate-900/30">
            <div className="w-20 h-20 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-gray-500">
              <IconMapPin size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">{t('specificPaths.construction')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('specificPaths.constructionDesc', { category: categoryName }).replace('{{category}}', categoryName)}</p>
            <Button onPress={() => navigate('/learning/choose-language')}>{t('specificPaths.chooseOther')}</Button>
          </div>
        ) : (
          <div className="relative py-8">
            {/* Vertical Timeline Line (Desktop) */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500/20 via-indigo-500/20 to-transparent z-0 rounded-full" />

            <div className="space-y-12 md:space-y-24 relative z-10">
              {paths.map((path, index) => {
                const isEven = index % 2 === 0;
                const pathName = getTranslatedContent(path, 'name') || 'Parcours';
                const pathDesc = getTranslatedContent(path, 'description') || `Maîtrisez les concepts clés de ${categoryName} à travers ce parcours structuré.`;

                return (
                  <div key={path._id} className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}>

                    {/* Timeline Node (Desktop) */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex">
                      <div className={`w-8 h-8 rounded-full border-4 border-gray-50 dark:border-[#0B0F19] flex items-center justify-center shadow-lg transition-all duration-500 ${hasAccess ? 'bg-cyan-500 scale-110' : 'bg-slate-600'}`}>
                        {hasAccess && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full md:w-[45%]">
                      <div
                        className={`group relative overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl
                                            ${hasAccess
                            ? 'bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg hover:shadow-cyan-500/20'
                            : 'bg-gray-100/80 dark:bg-slate-900/40 border border-gray-200 dark:border-white/5 opacity-90'
                          }
                                        `}
                      >
                        {/* Locked Overlay */}
                        {!hasAccess && (
                          <div className="absolute inset-0 z-30 bg-gray-100/50 dark:bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                            <Button
                              color="primary"
                              variant="shadow"
                              className="font-bold shadow-indigo-500/50"
                              startContent={<IconLock size={18} />}
                              onPress={handleUnlockClick}
                            >
                              {t('specificPaths.unlockTrack')}
                            </Button>
                          </div>
                        )}

                        <div className="p-1">
                          {/* Course Image / Gradient Header */}
                          <div className={`h-40 rounded-t-[20px] rounded-b-xl relative overflow-hidden p-6 flex flex-col justify-between
                                                bg-gradient-to-br ${hasAccess ? 'from-cyan-500 to-blue-600' : 'from-slate-500 to-slate-700'}
                                            `}>

                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />

                            <div className="relative z-10 flex justify-between items-start">
                              <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg text-white">
                                <IconRoute size={24} />
                              </div>
                              <Chip size="sm" variant="flat" classNames={{ base: "bg-black/20 text-white" }}>
                                {t('specificPaths.step')} {index + 1}
                              </Chip>
                            </div>

                            <h2 className="text-2xl font-bold text-white relative z-10 truncate">
                              {pathName}
                            </h2>
                          </div>

                          {/* Details */}
                          <div className="p-6">
                            <p className="text-gray-600 dark:text-slate-400 mb-6 line-clamp-3 text-sm leading-relaxed min-h-[60px]">
                              {pathDesc}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex -space-x-2">
                                {/* Fake avatars users */}
                                {[1, 2, 3].map(i => (
                                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-gray-300 dark:bg-slate-700" />
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                  +1k
                                </div>
                              </div>

                              <Button
                                size="sm"
                                color={hasAccess ? "primary" : "default"}
                                variant={hasAccess ? "flat" : "bordered"}
                                className={hasAccess ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "text-gray-400 border-gray-300 dark:border-slate-600"}
                                endContent={hasAccess ? <IconChevronRight size={16} /> : <IconLock size={16} />}
                                onPress={() => hasAccess ? navigate(`/learning/specific/${categoryId}/paths/${path._id}`) : handleUnlockClick()}
                              >
                                {hasAccess ? t('specificPaths.start') : t('specificPaths.locked')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Empty side for alignment */}
                    <div className="hidden md:block w-[45%]" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}