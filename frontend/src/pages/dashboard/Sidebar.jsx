import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Button, Tooltip, Avatar, Progress, Card, CardBody } from "@nextui-org/react";
import {
  IconLayoutDashboard,
  IconClock,
  IconListCheck,
  IconUser,
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlay,
  IconPlayerPause,
  IconRefresh,
  IconCoffee,
  IconBrain
} from '@tabler/icons-react';

// Composant Sidebar refactorisé avec NextUI et Tailwind
export default function Sidebar({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  user = null
}) {
  const { t } = useTranslation();

  const tabs = [
    { id: 'dashboard', name: t('dashboard.welcome'), icon: <IconLayoutDashboard size={24} /> },
    { id: 'tasks', name: t('dashboard.tasks.title'), icon: <IconListCheck size={24} /> },
    { id: 'profile', name: t('nav.profile') || 'Profil', icon: <IconUser size={24} /> },
  ];

  const [showPomodoro, setShowPomodoro] = useState(false);

  // Récupérer l'utilisateur du localStorage si non fourni
  const [currentUser, setCurrentUser] = useState(user);
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing user", e);
        }
      }
    } else {
      setCurrentUser(user);
    }
  }, [user]);

  function handleNav(id) {
    setActivePage && setActivePage(id);
    if (id === 'pomodoro') {
      setShowPomodoro(true);
    } else if (showPomodoro && id !== 'pomodoro') {
      setShowPomodoro(false);
    }

    // Fermer la sidebar sur mobile
    if (window.innerWidth < 1024 && setMobileOpen) {
      setMobileOpen(false);
    }
  }

  const sidebarWidth = collapsed ? 'w-20' : 'w-80';
  const mobileClasses = mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0';

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-[202]
        ${sidebarWidth} 
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        bg-white/80 dark:bg-gradient-to-b dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e]
        text-gray-800 dark:text-white transition-all duration-300 ease-in-out
        flex flex-col border-r border-gray-100 dark:border-white/5 backdrop-blur-xl shadow-[1px_0_20px_rgba(0,0,0,0.02)]
      `}
    >
      {/* Top Section */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-6 h-20`}>
        {!collapsed && (
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <img src={require('../../assets/icons/logo.png')} alt="CodeGenesis" className="h-10 w-auto drop-shadow-md" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-purple-400">
              GenesisCode
            </span>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center">
            <img src={require('../../assets/icons/logo.png')} alt="G" className="h-10 w-auto drop-shadow-md" />
          </div>
        )}

        <Button
          isIconOnly
          variant="light"
          className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10"
          onPress={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
        {tabs.map(tab => {
          const isActive = activePage === tab.id;

          const content = (
            <button
              onClick={() => handleNav(tab.id)}
              className={`
                w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-white/5 dark:text-white shadow-sm border-blue-100 dark:border-cyan-500/30 border'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5 border border-transparent'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              {/* Active Background Glow (Dark Mode Only) */}
              {isActive && (
                <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-100 transition-opacity duration-300" />
              )}

              <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {tab.icon}
              </span>

              {!collapsed && (
                <span className={`relative z-10 font-medium tracking-wide`}>{tab.name}</span>
              )}

              {isActive && !collapsed && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-cyan-400 animate-pulse" />
              )}
            </button>
          );

          return collapsed ? (
            <Tooltip
              key={tab.id}
              content={tab.name}
              placement="right"
              classNames={{
                content: "bg-white dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 shadow-lg"
              }}
            >
              {content}
            </Tooltip>
          ) : (
            <div key={tab.id}>{content}</div>
          );
        })}
      </nav>

      {/* Pomodoro Widget */}
      <div className={`px-4 mb-6 transition-all duration-300 ${collapsed ? 'px-2' : ''}`}>
        <PomodoroWidget
          compact={collapsed || !showPomodoro}
          onToggleExpand={() => setShowPomodoro(!showPomodoro)}
          t={t}
        />
      </div>

      {/* User Profile */}
      <div className={`p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <Avatar
            isBordered
            color="secondary"
            src={currentUser?.avatar}
            name={currentUser?.firstName ? `${currentUser.firstName[0]}${currentUser.lastName ? currentUser.lastName[0] : ''}` : 'US'}
            className="transition-transform hover:scale-105"
          />

          {!collapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : t('auth.user') || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500 dark:text-white/50 truncate">
                {currentUser?.email || t('auth.student')}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// Composant PomodoroWidget Refactorisé
function PomodoroWidget({ compact, onToggleExpand, t }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus', 'short', 'long'
  const [completedCycles, setCompletedCycles] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds === 0) {
            if (minutes === 0) {
              handleTimerEnd();
              return 0;
            } else {
              setMinutes(minutes - 1);
              return 59;
            }
          } else {
            return prevSeconds - 1;
          }
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, minutes, seconds]);

  const handleTimerEnd = () => {
    setIsActive(false);
    playCompletionSound();

    if (mode === 'focus') {
      setCompletedCycles(prev => prev + 1);
      if (completedCycles > 0 && completedCycles % 3 === 0) {
        setMode('long');
        setMinutes(15);
      } else {
        setMode('short');
        setMinutes(5);
      }
    } else {
      setMode('focus');
      setMinutes(25);
    }
    setSeconds(0);
  };

  const playCompletionSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA');
      audio.volume = 0.3;
      audio.play().catch(() => { });
    } catch (e) { }
  };

  const toggleTimer = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    setIsActive(!isActive);
  };

  const resetTimer = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    setIsActive(false);
    setMinutes(mode === 'focus' ? 25 : mode === 'short' ? 5 : 15);
    setSeconds(0);
  };

  const formatTime = () => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalSeconds = mode === 'focus' ? 1500 : mode === 'short' ? 300 : 900;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  if (compact) {
    return (
      <Tooltip content="Pomodoro Timer" placement="right" isDisabled={!compact} classNames={{ content: "bg-white dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-200 dark:border-white/10" }}>
        <div
          className="bg-gray-100 dark:bg-white/10 rounded-xl p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/15 transition-colors group border border-gray-200 dark:border-white/5"
          onClick={onToggleExpand}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-300 dark:text-white/10" />
                <circle
                  cx="20" cy="20" r="18"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * progress / 100)}
                  className={`${isActive ? 'text-blue-500 dark:text-cyan-400' : 'text-gray-400 dark:text-white/50'} transition-all duration-500`}
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-gray-700 dark:text-white">{minutes}</span>
            </div>
            {!compact && <span className="text-xs font-medium text-gray-600 dark:text-white/80">{mode === 'focus' ? 'Focus' : 'Pause'}</span>}
          </div>
        </div>
      </Tooltip>
    );
  }

  return (
    <Card className="bg-white dark:bg-white/10 border border-gray-200 dark:border-none shadow-lg dark:shadow-xl dark:backdrop-blur-md">
      <CardBody className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-white/90">
            {mode === 'focus' ? <IconBrain size={18} className="text-blue-500 dark:text-cyan-400" /> : <IconCoffee size={18} className="text-green-500 dark:text-emerald-400" />}
            <span className="font-semibold text-sm">{mode === 'focus' ? (t('pomodoro.focus') || 'Focus') : (t('pomodoro.break') || 'Pause')}</span>
          </div>
          <button onClick={onToggleExpand} className="text-gray-400 hover:text-gray-700 dark:text-white/50 dark:hover:text-white">×</button>
        </div>

        <div className="flex flex-col items-center mb-4">
          <div className="text-4xl font-bold font-mono tracking-wider mb-2 text-gray-800 dark:text-white">
            {formatTime()}
          </div>
          <Progress
            size="sm"
            value={progress}
            color={mode === 'focus' ? "primary" : "success"}
            classNames={{
              indicator: mode === 'focus' ? "bg-gradient-to-r from-blue-400 to-blue-600 dark:from-cyan-400 dark:to-blue-500" : "bg-gradient-to-r from-green-400 to-green-600 dark:from-emerald-400 dark:to-green-500",
              track: "bg-gray-200 dark:bg-white/10"
            }}
            aria-label="Timer progress"
          />
        </div>

        <div className="flex justify-center gap-3">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            className={`${isActive ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-green-100 text-green-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}
            onPress={toggleTimer}
          >
            {isActive ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            className="bg-gray-100 text-gray-600 hover:text-gray-900 dark:bg-white/10 dark:text-white/70 dark:hover:text-white"
            onPress={resetTimer}
          >
            <IconRefresh size={18} />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
          <button
            onClick={() => { setMode('focus'); setMinutes(25); setSeconds(0); setIsActive(false); }}
            className={`text-xs px-2 py-1 rounded ${mode === 'focus' ? 'bg-blue-100 text-blue-700 dark:bg-white/20 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white'}`}
          >
            25m
          </button>
          <button
            onClick={() => { setMode('short'); setMinutes(5); setSeconds(0); setIsActive(false); }}
            className={`text-xs px-2 py-1 rounded ${mode === 'short' ? 'bg-blue-100 text-blue-700 dark:bg-white/20 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white'}`}
          >
            5m
          </button>
          <button
            onClick={() => { setMode('long'); setMinutes(15); setSeconds(0); setIsActive(false); }}
            className={`text-xs px-2 py-1 rounded ${mode === 'long' ? 'bg-blue-100 text-blue-700 dark:bg-white/20 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white'}`}
          >
            15m
          </button>
        </div>
      </CardBody>
    </Card>
  );
}