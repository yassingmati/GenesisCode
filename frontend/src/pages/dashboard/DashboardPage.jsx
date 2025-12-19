import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
          <div className="space-y-8 animate-fadeIn">
            <DashboardContent t={t} />

            {/* Banner supprimée et déplacée dans le Header */}

            {/* Les sections Notifications, Stats et Tâches ont été supprimées à la demande de l'utilisateur */}


            <Footer />
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
   WelcomeCard + OptionCard (local)
   =========================== */
const WelcomeCard = ({ onSelectOption, t, navigate }) => {
  return (
    <Card className="w-full overflow-hidden border-none shadow-2xl bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-800">
      <CardBody className="p-8 md:p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />

        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              <span className="mr-3 inline-block animate-bounce-slow">👋</span>
              {t('dashboard.welcome')} sur GenesisCode !
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-light">
              {t('dashboard.welcomeMessage')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
            <OptionCard
              emoji="🚀"
              title={t('dashboard.chooseLanguage')}
              description={t('dashboard.chooseLanguageDesc')}
              onClick={() => onSelectOption && onSelectOption("language")}
              color="cyan"
            />

            <OptionCard
              emoji="🧭"
              title={t('dashboard.followPath')}
              description={t('dashboard.followPathDesc')}
              onClick={() => navigate('/courses')}
              color="indigo"
            />
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-cyan-300 font-semibold shadow-lg hover:bg-white/20"
              startContent={<span className="text-xl">👉</span>}
              onPress={() => navigate('/courses')}
            >
              {t('dashboard.startAdventure')}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const DashboardContent = ({ t }) => {
  // Lazy load pour éviter les problèmes d'import circulaires si présents, mais ici import direct ok
  const LeaderboardWidget = require('../../components/gamification/LeaderboardWidget').default;
  const Badge = require('../../components/gamification/Badge').default;
  const { BADGES } = require('../../config/badges');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Simuler des badges si pas encore de backend connect
  const userBadges = user?.badges || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      <div className="lg:col-span-2 space-y-6">
        <WelcomeCard t={t} navigate={require('react-router-dom').useNavigate()} />

        {/* Badges Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <CardHeader className="flex gap-3">
            <span className="text-2xl">🏆</span>
            <div className="flex flex-col">
              <p className="text-lg font-bold">Mes Badges</p>
              <p className="text-small text-default-500">Vos accomplissements récents</p>
            </div>
          </CardHeader>
          <CardBody>
            {userBadges.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {userBadges.map(badgeId => (
                  <Badge key={badgeId} badgeId={badgeId} size="md" showTitle={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Continuez à apprendre pour débloquer des badges !</p>
                <div className="flex justify-center gap-2 mt-4 opacity-50 grayscale">
                  <Badge badgeId="XP_NOVICE" size="sm" />
                  <Badge badgeId="FIRST_EXERCISE" size="sm" />
                  <Badge badgeId="STREAK_3" size="sm" />
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <LeaderboardWidget />
      </div>
    </div>
  );
};


const OptionCard = ({ emoji, title, description, onClick, color }) => (
  <button
    onClick={onClick}
    className="group relative w-full text-left transition-all duration-300 hover:-translate-y-1 focus:outline-none"
  >
    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color === 'cyan' ? 'from-cyan-500 to-blue-500' : 'from-indigo-500 to-purple-500'} opacity-0 group-hover:opacity-100 blur transition-opacity duration-300`} />
    <div className="relative h-full bg-gray-900/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-gray-800/90 dark:hover:bg-slate-700/90 transition-colors">
      <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{emoji}</div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300">{description}</p>
    </div>
  </button>
);
