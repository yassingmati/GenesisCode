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
            <WelcomeCard onSelectOption={handleWelcomeSelect} t={t} navigate={navigate} />

            {/* Section d'abonnement améliorée */}
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl border-none overflow-visible">
              <CardBody className="p-8 md:p-10 relative">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />

                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                  <div className="flex-shrink-0 w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
                    <IconRocket size={40} className="text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-bold mb-3">{t('dashboard.subscription.title')}</h3>
                    <p className="text-white/90 text-lg mb-6 max-w-2xl">
                      {t('dashboard.subscription.subtitle')}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-2">
                      <Chip variant="flat" classNames={{ base: "bg-white/20 border-white/20", content: "text-white font-medium" }} startContent={<span className="mr-1">✨</span>}>{t('dashboard.subscription.unlimited')}</Chip>
                      <Chip variant="flat" classNames={{ base: "bg-white/20 border-white/20", content: "text-white font-medium" }} startContent={<span className="mr-1">🎯</span>}>{t('dashboard.subscription.personalized')}</Chip>
                      <Chip variant="flat" classNames={{ base: "bg-white/20 border-white/20", content: "text-white font-medium" }} startContent={<span className="mr-1">📊</span>}>{t('dashboard.subscription.progress')}</Chip>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <SubscriptionButton
                      variant="premium"
                      className="w-full sm:w-auto shadow-lg font-bold"
                    />
                    <SubscriptionButton
                      variant="outline"
                      className="w-full sm:w-auto bg-white/10 border-white/30 hover:bg-white/20 text-white font-medium"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              <span className="mr-3 inline-block animate-bounce-slow">👋</span>
              {t('dashboard.welcome')} sur GenesisCode !
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light">
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
