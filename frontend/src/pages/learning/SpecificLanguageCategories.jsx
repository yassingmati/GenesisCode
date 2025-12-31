import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCategories } from '../../services/courseService';
import CategoryPaymentService from '../../services/categoryPaymentService';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import { Button, Input, Chip, Card, CardBody, CardFooter } from "@nextui-org/react";
import {
  IconSearch, IconChevronRight, IconCode, IconCheck,
  IconTerminal2, IconCpu, IconRocket, IconBulb, IconDeviceGamepad,
  IconBrandPython, IconBrandJavascript, IconBrandCpp, IconBrandReact,
  IconBrandHtml5, IconBrandCss3, IconBrandPhp, IconBrandGolang,
  IconBrandRust, IconBrandDocker, IconDatabase, IconBrandSwift,
  IconBrandKotlin, IconCoffee, IconBrandCSharp, IconBrandGit,
  IconBrandAngular, IconBrandVue, IconBrandNodejs, IconBrandAws,
  IconBrandMongodb, IconLock
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

// --- Smart Theme Engine ---
// Generates a consistent, premium look for ANY category based on its ID/Name
const generateTheme = (id = '', name = '') => {
  // Predefined premium gradients and palette colors
  // These use opacity-based colors so they work on both light and dark backgrounds
  const palettes = [
    { from: 'from-pink-500', to: 'to-rose-600', text: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', shadow: 'hover:shadow-pink-500/20' },
    { from: 'from-purple-500', to: 'to-indigo-600', text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', shadow: 'hover:shadow-purple-500/20' },
    { from: 'from-cyan-500', to: 'to-blue-600', text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', shadow: 'hover:shadow-cyan-500/20' },
    { from: 'from-emerald-500', to: 'to-teal-600', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', shadow: 'hover:shadow-emerald-500/20' },
    { from: 'from-orange-500', to: 'to-amber-600', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', shadow: 'hover:shadow-orange-500/20' },
    { from: 'from-violet-500', to: 'to-fuchsia-600', text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', shadow: 'hover:shadow-violet-500/20' },
  ];

  // Specific overrides for known languages to enforce brand colors if desired
  // This maps to the palette index
  const overrides = {
    'python': 1, // Purple/Indigo
    'javascript': 4, // Orange/Amber
    'react': 2, // Cyan/Blue
    'html': 4,
    'css': 2,
    'java': 0, // Pink/Rose
    'c++': 2,
    'php': 1,
    'go': 2,
    'rust': 4,
  };

  const lowerName = name.toLowerCase();
  let index = 0;

  // Check for override
  const overrideKey = Object.keys(overrides).find(key => lowerName.includes(key));
  if (overrideKey !== undefined) {
    index = overrides[overrideKey];
  } else {
    // Generate deterministic index from ID string
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    index = sum % palettes.length;
  }

  return palettes[index];
};

// --- Comprehensive Icon Mapping ---
const getIcon = (name) => {
  const lower = name.toLowerCase();

  // Languages & Frameworks
  if (lower.includes('python')) return IconBrandPython;
  if (lower.includes('javascript') || lower.includes('js')) return IconBrandJavascript;
  if (lower.includes('c++') || lower.includes('cpp')) return IconBrandCpp;
  if (lower.includes('c#') || lower.includes('csharp')) return IconBrandCSharp;
  if (lower.includes('java') && !lower.includes('script')) return IconCoffee;
  if (lower.includes('react')) return IconBrandReact;
  if (lower.includes('html')) return IconBrandHtml5;
  if (lower.includes('css')) return IconBrandCss3;
  if (lower.includes('php')) return IconBrandPhp;
  if (lower.includes('go') && !lower.includes('mongo')) return IconBrandGolang;
  if (lower.includes('rust')) return IconBrandRust;
  if (lower.includes('swift')) return IconBrandSwift;
  if (lower.includes('kotlin')) return IconBrandKotlin;
  if (lower.includes('node')) return IconBrandNodejs;
  if (lower.includes('angular')) return IconBrandAngular;
  if (lower.includes('vue')) return IconBrandVue;

  // Infrastructure & Data
  if (lower.includes('docker') || lower.includes('container')) return IconBrandDocker;
  if (lower.includes('git')) return IconBrandGit;
  if (lower.includes('aws') || lower.includes('cloud')) return IconBrandAws;
  if (lower.includes('mongo')) return IconBrandMongodb;
  if (lower.includes('sql') || lower.includes('data')) return IconDatabase;

  // Generic Categories
  if (lower.includes('game')) return IconDeviceGamepad;
  if (lower.includes('web')) return IconTerminal2;
  if (lower.includes('sys') || lower.includes('embed')) return IconCpu;

  // Default
  return IconCode;
}

export default function SpecificLanguageCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [accessMap, setAccessMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { language } = useLanguage();

  useEffect(() => {
    (async () => {
      try {
        const [catsData, historyData] = await Promise.all([
          getCategories('specific'),
          CategoryPaymentService.getUserAccessHistory().catch(() => [])
        ]);

        setCategories(catsData || []);

        const accMap = {};
        if (historyData && Array.isArray(historyData)) {
          historyData.forEach(h => {
            // Handle both populated object and string ID
            const catId = h.category && h.category._id ? h.category._id : h.category;
            if (catId) accMap[catId] = true;
          });
        }
        setAccessMap(accMap);
      } catch (e) {
        setError('Erreur lors du chargement des catégories');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredCategories = categories
    .filter(cat => {
      const name = cat?.translations?.[language]?.name || cat?.translations?.fr?.name || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase()) && !name.includes('Isolation');
    });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 50, damping: 15 } }
  };

  const translations = {
    fr: {
      titlePrefix: 'Explorateur',
      titleSuffix: 'Tech',
      subtitle: 'Sélectionnez une technologie pour débloquer votre potentiel.',
      searchPlaceholder: 'Rechercher un langage...',
      noResults: 'Aucun résultat trouvé pour cette recherche.',
      discover: 'Découvrir',
      continue: 'Continuer le cours',
      acquired: 'Acquis'
    },
    en: {
      titlePrefix: 'Tech',
      titleSuffix: 'Explorer',
      subtitle: 'Select a technology to unlock your potential.',
      searchPlaceholder: 'Search for a language...',
      noResults: 'No results found for this search.',
      discover: 'Discover',
      continue: 'Continue course',
      acquired: 'Acquired'
    },
    ar: {
      titlePrefix: 'مستكشف',
      titleSuffix: 'التكنولوجيا',
      subtitle: 'اختر تقنية لإطلاق العنان لإمكاناتك.',
      searchPlaceholder: 'البحث عن لغة...',
      noResults: 'لم يتم العثور على نتائج لهذا البحث.',
      discover: 'اكتشف',
      continue: 'متابعة الدورة',
      acquired: 'مكتسب'
    }
  };

  const t = translations[language] || translations.fr;
  const isRTL = language === 'ar';

  return (
    <ClientPageLayout
      isLite={true}
      breadcrumbs={[{ label: isRTL ? 'اللوغات' : 'Langages' }]} // Simple fallback for breadcrumb
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      showBackButton={true}
      backPath="/dashboard"
      backLabel={isRTL ? 'عودة' : 'Retour'}
    >
      <div className="min-h-[80vh] flex flex-col gap-12 py-8" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* Sleek Modern Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-gray-200 dark:border-white/5 relative">
          <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 blur-[80px] -z-10 rounded-full`} />
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
              {t.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400">{t.titleSuffix}</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-light text-lg max-w-lg leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <Input
            classNames={{
              base: "w-full md:w-[350px]",
              mainWrapper: "h-14",
              input: `text-base ${isRTL ? 'pr-2 text-right' : 'pl-2'} text-gray-900 dark:text-white placeholder:text-gray-500`,
              inputWrapper: "h-14 bg-white dark:bg-[#1a1b26]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 group-data-[focus=true]:border-purple-500/50 rounded-2xl transition-all shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-white/10",
            }}
            placeholder={t.searchPlaceholder}
            startContent={!isRTL && <IconSearch className="text-gray-400 group-data-[focus=true]:text-purple-500" size={20} />}
            endContent={isRTL && <IconSearch className="text-gray-400 group-data-[focus=true]:text-purple-500" size={20} />}
            value={searchTerm}
            onValueChange={setSearchTerm}
            isClearable
            radius="lg"
          />
        </div>

        {/* Dynamic Grid */}
        {filteredCategories.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <IconSearch size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">{t.noResults}</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20"
          >
            {filteredCategories.map(cat => {
              const name = cat?.translations?.[language]?.name || cat?.translations?.fr?.name || 'Langage';
              const theme = generateTheme(cat._id, name);
              const isUnlocked = accessMap[cat._id];
              const Icon = getIcon(name);

              const description = {
                fr: `Maîtrisez ${name} avec des projets concrets et des exercices interactifs.`,
                en: `Master ${name} with concrete projects and interactive exercises.`,
                ar: `أتقن ${name} مع مشاريع عملية وتمارين تفاعلية.`
              }[language] || `Maîtrisez ${name} avec des projets concrets et des exercices interactifs.`;

              return (
                <motion.div key={cat._id} variants={item} className="h-full">
                  <div
                    onClick={() => navigate(`/learning/specific/${cat._id}`)}
                    className={`group relative h-[300px] w-full rounded-2xl bg-white dark:bg-[#0e0f15] border border-gray-100 dark:border-white/5 overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${theme.shadow} hover:border-gray-200 dark:hover:border-white/10 shadow-sm dark:shadow-none`}
                  >
                    {/* Background & Noise */}
                    <div className="absolute inset-0 bg-[url('https://grain-ui.vercel.app/noise.svg')] opacity-10 dark:opacity-20 pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
                    <div className={`absolute -top-24 ${isRTL ? '-left-24' : '-right-24'} w-64 h-64 bg-gradient-to-br ${theme.from} ${theme.to} opacity-5 dark:opacity-10 blur-[60px] group-hover:opacity-10 dark:group-hover:opacity-20 group-hover:blur-[80px] transition-all duration-700`} />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col p-6 z-10">
                      {/* Top Row */}
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-16 h-16 rounded-2xl ${theme.bg} border ${theme.border} flex items-center justify-center dark:text-white shadow-sm dark:shadow-lg backdrop-blur-md group-hover:scale-110 transition-transform duration-500`}>
                          <Icon size={32} className={theme.text} />
                        </div>
                        {isUnlocked ? (
                          <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <IconCheck size={12} stroke={3} /> {t.acquired}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-white transition-colors">
                            <IconLock size={14} />
                          </div>
                        )}
                      </div>

                      {/* Main Text */}
                      <div>
                        <h2 className={`text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${theme.from} ${theme.to} transition-all ${isRTL ? 'text-right' : ''}`}>
                          {name}
                        </h2>
                        <p className={`text-gray-600 dark:text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors ${isRTL ? 'text-right' : ''}`}>
                          {description}
                        </p>
                      </div>

                      {/* Bottom Action */}
                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                        {isUnlocked ? (
                          <span className={`text-sm font-semibold text-green-600 dark:text-green-400 group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'} transition-transform inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {t.continue} <IconChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
                          </span>
                        ) : (
                          <span className={`text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'} transition-all inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {t.discover} <IconChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
                          </span>
                        )}

                        <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 ${theme.text}`}>
                          <IconRocket size={20} />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Gradient Bar */}
                    <div className={`absolute bottom-0 ${isRTL ? 'right-0 origin-right' : 'left-0 origin-left'} h-1 w-full bg-gradient-to-r ${theme.from} ${theme.to} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </ClientPageLayout>
  );
}
