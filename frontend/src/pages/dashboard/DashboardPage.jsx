import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Footer from "./Footer";
import PomodoroPage from "./PomodoroPage";
import TacheDeJourPage from "./TacheDeJourPage";
import ProfilePage from "./ProfilePage";
import NotificationCenter from "../../components/NotificationCenter";
import SubscriptionButton from "../../components/SubscriptionButton";
import {
  Card, CardBody, CardHeader,
  Button, Progress, Chip,
  Link
} from "@nextui-org/react";
import {
  IconChartBar, IconListCheck, IconClock,
  IconCheck, IconAlertCircle, IconRefresh,
  IconRocket, IconArrowRight
} from "@tabler/icons-react";

/**
 * DashboardPage.jsx - Redesigned with NextUI and DashboardLayout
 */

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Charger les données utilisateur
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erreur parsing user data:', error);
      }
    }
  }, []);

  // Check URL params for tab navigation
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['dashboard', 'pomodoro', 'tasks', 'profile'].includes(tabParam)) {
      setActivePage(tabParam);
    }
  }, [searchParams]);

  // small transition loader when switching pages
  useEffect(() => {
    if (activePage !== "dashboard") {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [activePage]);

  const handleWelcomeSelect = (option) => {
    if (option === "language") navigate('/learning/choose-language');
    else if (option === "path") navigate('/courses');
    else setActivePage("dashboard");
  };

  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      );
    }

    switch (activePage) {
      case "pomodoro":
        return <PomodoroPage />;
      case "tasks":
        return <TacheDeJourPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return (
          <div className="h-auto lg:h-[calc(100vh-6rem)] animate-fadeIn pb-20 lg:pb-4">
            <DashboardContent t={t} onSelectOption={handleWelcomeSelect} />
          </div>
        );
    }
  };

  return (
    <DashboardLayout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </DashboardLayout>
  );
}

/* ===========================
   Premium WelcomeCard + OptionCard
   =========================== */
const WelcomeCard = ({ onSelectOption, t, navigate }) => {
  const { language } = require('../../hooks/useTranslation').useTranslation(); // Get language for local overrides if needed

  const localT = {
    fr: {
      adventure: "✨ L'aventure commence ici",
      welcome: "Bienvenue sur",
      subtitle: "Prêt à devenir un maître du code ? Choisis ta voie et débloque ton potentiel infini. Le futur t'appartient.",
      modeFree: "Mode Libre",
      modeFreeDesc: "Tu sais ce que tu veux ? Plonge directement dans le langage de ton choix.",
      recommended: "Recommandé",
      recommendedDesc: "Laisse-toi guider par nos experts à travers un parcours structuré et épique.",
      start: "Commencer"
    },
    en: {
      adventure: "✨ The adventure begins here",
      welcome: "Welcome to",
      subtitle: "Ready to become a code master? Choose your path and unlock your infinite potential. The future is yours.",
      modeFree: "Free Mode",
      modeFreeDesc: "Know what you want? Dive directly into the language of your choice.",
      recommended: "Recommended",
      recommendedDesc: "Let our experts guide you through a structured and epic journey.",
      start: "Start"
    },
    ar: {
      adventure: "✨ المغامرة تبدأ من هنا",
      welcome: "مرحباً بك في",
      subtitle: "هل أنت مستعد لتصبح محترفاً في البرمجة؟ اختر مسارك وأطلق العنان لإمكاناتك اللانهائية. المستقبل ملك لك.",
      modeFree: "الوضع الحر",
      modeFreeDesc: "هل تعرف ما تريد؟ انغمس مباشرة في اللغة التي تختارها.",
      recommended: "موصى به",
      recommendedDesc: "دع خبراؤنا يرشدونك عبر رحلة منظمة وملحمية.",
      start: "ابدأ"
    }
  };

  const currentT = localT[language] || localT.fr;
  const isRTL = language === 'ar';

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl group" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated Deep Space Gradient Background - Adaptive Light/Dark */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] animate-gradient-xy"></div>

      {/* Dynamic Overlay Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>

      {/* Glassmorphism Content Container */}
      <div className="relative z-10 backdrop-blur-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 p-4 md:p-6 lg:p-10 flex flex-col items-center text-center">

        {/* Floating Abstract Shapes */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-purple-500/10 dark:bg-purple-500/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-cyan-500/10 dark:bg-cyan-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="relative z-20 max-w-4xl mx-auto">
          <div className="mb-2 inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 border border-pink-500/20 dark:border-pink-500/30 text-pink-600 dark:text-pink-300 text-xs font-medium tracking-wide shadow-sm animate-pulse-slow">
            {currentT.adventure}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-blue-100 dark:to-white drop-shadow-sm mb-4 leading-tight">
            {currentT.welcome} <span className="bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">GenesisCode</span>
          </h1>

          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300/90 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            {currentT.subtitle}
          </p>

          {/* Interactive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <OptionCard
              emoji="🚀"
              title={t('dashboard.chooseLanguage')}
              description={currentT.modeFreeDesc}
              onClick={() => onSelectOption && onSelectOption("language")}
              color="cyan"
              tag={currentT.modeFree}
              startText={currentT.start}
              isRTL={isRTL}
            />

            <OptionCard
              emoji="🗺️"
              title={t('dashboard.followPath')}
              description={currentT.recommendedDesc}
              onClick={() => navigate('/courses')}
              color="purple"
              tag={currentT.recommended}
              startText={currentT.start}
              isRTL={isRTL}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardContent = ({ t, onSelectOption }) => {
  // Lazy load pour éviter les problèmes d'import circulaires si présents, mais ici import direct ok
  const LeaderboardWidget = require('../../components/gamification/LeaderboardWidget').default;
  const Badge = require('../../components/gamification/Badge').default;
  const { BADGES } = require('../../config/badges');
  const [user, setUser] = React.useState(null);
  const navigate = require('react-router-dom').useNavigate();

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Simuler des badges si pas encore de backend connect
  const userBadges = user?.badges || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-full min-h-0">
      <div className="lg:col-span-2 flex flex-col justify-center h-auto lg:h-full">
        <WelcomeCard t={t} navigate={navigate} onSelectOption={onSelectOption} />

        {/* Badges Section Removed */}
      </div>

      <div className="lg:col-span-1 h-[500px] lg:h-full min-h-0">
        <LeaderboardWidget />
      </div>
    </div>
  );
};

const OptionCard = ({ emoji, title, description, onClick, color, tag, startText, isRTL }) => {
  const isCyan = color === 'cyan';
  const gradient = isCyan ? 'from-cyan-500 to-blue-600' : 'from-purple-500 to-pink-600';
  const glow = isCyan ? 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]' : 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]';
  const border = isCyan ? 'group-hover:border-cyan-500/50' : 'group-hover:border-purple-500/50';

  return (
    <button
      onClick={onClick}
      className={`group relative h-full w-full text-left transition-all duration-500 hover:-translate-y-2 focus:outline-none`}
    >
      <div className={`active:scale-95 transition-transform duration-200 h-full`}>
        {/* Main Card Background with blur */}
        <div className={`relative h-full bg-white dark:bg-[#1a1b26]/60 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex flex-col 
                            transition-all duration-500 ${border} ${glow} overflow-hidden shadow-sm dark:shadow-none`}>

          {/* Hover Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

          {/* Tag */}
          <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50 group-hover:bg-white/20 group-hover:text-gray-900 dark:group-hover:text-white transition-colors`}>
              {tag}
            </span>
          </div>

          {/* Icon Circle */}
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} p-[1px] mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#1a1b26] flex items-center justify-center text-3xl group-hover:bg-transparent transition-colors duration-500">
              {emoji}
            </div>
          </div>

          <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors relative z-10 ${isRTL ? 'text-right' : ''}`}>
            {title}
          </h3>

          <p className={`text-gray-600 dark:text-gray-400 text-sm leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-200 relative z-10 flex-grow ${isRTL ? 'text-right' : ''}`}>
            {description}
          </p>

          {/* Arrow Icon */}
          <div className={`mt-6 flex items-center text-sm font-semibold ${isCyan ? 'text-cyan-600 dark:text-cyan-400' : 'text-purple-600 dark:text-purple-400'} group-hover:text-gray-900 dark:group-hover:text-white transition-colors relative z-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {startText} <span className={`ml-2 transform group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'} transition-transform ${isRTL ? 'rotate-180 mr-2 ml-0' : ''}`}>→</span>
          </div>
        </div>
      </div>
    </button>
  );
};
