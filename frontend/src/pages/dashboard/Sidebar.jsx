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
        fixed lg:static inset-y-0 left-0 z-[100]
        ${sidebarWidth} 
        ${mobileClasses}
        bg-gradient-to-b from-indigo-900 via-purple-900 to-blue-900
        text-white transition-all duration-300 ease-in-out
        flex flex-col shadow-2xl border-r border-white/10
      `}
    >
      {/* Top Section */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-6 h-20`}>
        {!collapsed && (
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <img src={require('../../assets/icons/logo.png')} alt="CodeGenesis" className="h-10 w-auto" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
              GenesisCode
            </span>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center">
            <img src={require('../../assets/icons/logo.png')} alt="G" className="h-10 w-auto" />
          </div>
        )}

        <Button
          isIconOnly
          variant="light"
          className="text-white/70 hover:text-white hover:bg-white/10"
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
                w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative
                ${isActive
                  ? 'bg-white/10 text-white shadow-lg shadow-purple-500/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110 text-cyan-400' : 'group-hover:scale-110'}`}>
                {tab.icon}
              </span>

              {!collapsed && (
                <span className="font-medium">{tab.name}</span>
              )}

              {isActive && !collapsed && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </button>
          );

          return collapsed ? (
            <Tooltip
              key={tab.id}
              content={tab.name}
              placement="right"
              classNames={{
                content: "bg-gray-900 text-white border border-white/10"
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
      <div className={`p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm`}>
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
              <p className="text-sm font-semibold text-white truncate">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : t('auth.user') || 'Utilisateur'}
              </p>
              <p className="text-xs text-white/50 truncate">
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
      <Tooltip content="Pomodoro Timer" placement="right" isDisabled={!compact}>
        <div
          className="bg-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/15 transition-colors group border border-white/5"
          onClick={onToggleExpand}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/10" />
                <circle
                  cx="20" cy="20" r="18"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * progress / 100)}
                  className={`${isActive ? 'text-cyan-400' : 'text-white/50'} transition-all duration-500`}
                />
              </svg>
              <span className="absolute text-[10px] font-bold">{minutes}</span>
            </div>
            {!compact && <span className="text-xs font-medium">{mode === 'focus' ? 'Focus' : 'Pause'}</span>}
          </div>
        </div>
      </Tooltip>
    );
  }

  return (
    <Card className="bg-white/10 border-none shadow-xl backdrop-blur-md">
      <CardBody className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-white/90">
            {mode === 'focus' ? <IconBrain size={18} className="text-cyan-400" /> : <IconCoffee size={18} className="text-emerald-400" />}
            <span className="font-semibold text-sm">{mode === 'focus' ? (t('pomodoro.focus') || 'Focus') : (t('pomodoro.break') || 'Pause')}</span>
          </div>
          <button onClick={onToggleExpand} className="text-white/50 hover:text-white">×</button>
        </div>

        <div className="flex flex-col items-center mb-4">
          <div className="text-4xl font-bold font-mono tracking-wider mb-2 text-white">
            {formatTime()}
          </div>
          <Progress
            size="sm"
            value={progress}
            color={mode === 'focus' ? "primary" : "success"}
            classNames={{
              indicator: mode === 'focus' ? "bg-gradient-to-r from-cyan-400 to-blue-500" : "bg-gradient-to-r from-emerald-400 to-green-500",
              track: "bg-white/10"
            }}
            aria-label="Timer progress"
          />
        </div>

        <div className="flex justify-center gap-3">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            className={`${isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}
            onPress={toggleTimer}
          >
            {isActive ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            className="bg-white/10 text-white/70 hover:text-white"
            onPress={resetTimer}
          >
            <IconRefresh size={18} />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => { setMode('focus'); setMinutes(25); setSeconds(0); setIsActive(false); }}
            className={`text-xs px-2 py-1 rounded ${mode === 'focus' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
          >
            25m
          </button>
          <button
            onClick={() => { setMode('short'); setMinutes(5); setSeconds(0); setIsActive(false); }}
            className={`text-xs px-2 py-1 rounded ${mode === 'short' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
          >
            5m
          </button>
          <button
            onClick={() => { setMode('long'); setMinutes(15); setSeconds(0); setIsActive(false); }}
            className={`text-xs px-2 py-1 rounded ${mode === 'long' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
          >
            15m
          </button>
        </div>
      </CardBody>
    </Card>
  );
}