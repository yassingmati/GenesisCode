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

      {/* Glassmorphism Content Container - Removed outer boxiness, now just a clean layout */}
      <div className="relative z-10 py-2 sm:py-4 flex flex-col items-center text-center">

        {/* Floating Abstract Shapes - Adjusted for better blending */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>

        <div className="relative z-20 max-w-5xl mx-auto w-full px-4">

          {/* Header Section */}
          <div className="mb-8 md:mb-10">
            <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md shadow-sm animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] md:text-xs font-semibold tracking-wide bg-gradient-to-r from-gray-600 to-gray-900 dark:from-gray-300 dark:to-white bg-clip-text text-transparent uppercase">
                {currentT.adventure}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-800 dark:text-white drop-shadow-sm mb-4 leading-tight tracking-tight">
              {currentT.welcome} <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent animate-gradient-x">GenesisCode</span>
            </h1>

            <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              {currentT.subtitle}
            </p>
          </div>

          {/* Interactive Cards Grid - Enhanced Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 w-full max-w-4xl mx-auto">
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
    <div className="w-full flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-8rem)] min-h-0 overflow-hidden">

      {/* Left Column: Welcome & Options (Scrollable if needed, but fitted) */}
      <div className="flex-1 flex flex-col justify-center relative overflow-visible">
        {/* Subtle background glow for the whole area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/5 blur-[120px] rounded-full pointing-events-none -z-10"></div>
        <WelcomeCard t={t} navigate={navigate} onSelectOption={onSelectOption} />
      </div>

      {/* Right Column: Leaderboard (Fixed height container) */}
      <div className="w-full lg:w-[320px] xl:w-[360px] flex-none h-[400px] lg:h-full">
        <LeaderboardWidget />
      </div>

    </div>
  );
};

const OptionCard = ({ emoji, title, description, onClick, color, tag, startText, isRTL }) => {
  const isCyan = color === 'cyan';
  const gradient = isCyan ? 'from-cyan-500 to-blue-600' : 'from-purple-500 to-pink-600';
  const glow = isCyan ? 'shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]' : 'shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]';
  const border = isCyan ? 'border-cyan-200/50 dark:border-cyan-500/20 group-hover:border-cyan-400 dark:group-hover:border-cyan-400/50' : 'border-purple-200/50 dark:border-purple-500/20 group-hover:border-purple-400 dark:group-hover:border-purple-400/50';
  const bg = isCyan ? 'bg-cyan-50/50 dark:bg-cyan-900/10' : 'bg-purple-50/50 dark:bg-purple-900/10';

  return (
    <button
      onClick={onClick}
      className={`group relative h-full w-full text-left transition-all duration-300 hover:-translate-y-1 focus:outline-none`}
    >
      {/* Main Card */}
      <div className={`relative h-full backdrop-blur-xl rounded-[2rem] p-5 md:p-6 flex flex-col 
                            transition-all duration-300 border ${border} ${glow} ${bg} overflow-hidden`}>

        {/* Hover Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

        {/* Top Row: Icon & Tag */}
        <div className={`flex justify-between items-start mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Icon Circle */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} p-[1px] shadow-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            <div className="w-full h-full rounded-[15px] bg-white dark:bg-[#0f111a] flex items-center justify-center text-3xl">
              {emoji}
            </div>
          </div>

          {/* Tag */}
          <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/5 text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-white/20 group-hover:text-slate-800 dark:group-hover:text-white transition-all`}>
            {tag}
          </span>
        </div>

        <h3 className={`text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${gradient} transition-all relative z-10 ${isRTL ? 'text-right' : ''}`}>
          {title}
        </h3>

        <p className={`text-slate-600 dark:text-slate-400 text-xs md:text-sm font-medium leading-relaxed mb-6 flex-grow ${isRTL ? 'text-right' : ''}`}>
          {description}
        </p>

        {/* Action Button Look */}
        <div className={`mt-auto flex items-center justify-center w-full py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 group-hover:bg-gradient-to-r ${gradient} group-hover:text-white transition-all duration-300`}>
          <span className="text-xs font-bold uppercase tracking-widest">{startText}</span>
          <IconArrowRight size={14} className={`ml-2 transform group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 mr-2 ml-0' : ''}`} />
        </div>

      </div>
    </button>
  );
};
