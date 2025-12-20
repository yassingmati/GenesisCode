// ... imports ...
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
import { useTranslation } from '../../hooks/useTranslation';
import { useState, useEffect } from 'react';
import { Button, Tooltip, Avatar } from "@nextui-org/react";
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
    { id: 'dashboard', name: t('dashboard.welcome') || 'Tableau de bord', icon: <IconLayoutDashboard size={24} /> },
    { id: 'tasks', name: t('dashboard.tasks.title') || 'Tâches', icon: <IconListCheck size={24} /> },
    { id: 'pomodoro', name: t('nav.pomodoro') || 'Pomodoro', icon: <IconClock size={24} /> },
    { id: 'profile', name: t('nav.profile') || 'Profil', icon: <IconUser size={24} /> },
  ];

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
    if (setActivePage) setActivePage(id);

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

      {/* Pomodoro Widget Button (Only visible if not on Pomodoro page to avoid redundancy, or keep as quick status) */}
      {/* Lets treat the bottom widget as a shortcut to the page if it's running */}
      <div className={`px-4 mb-6 transition-all duration-300 ${collapsed ? 'px-2' : ''}`}>
        <PomodoroWidget
          compact={true} // Always compact in sidebar, clicking opens page
          onClick={() => handleNav('pomodoro')}
          t={t}
          isActivePage={activePage === 'pomodoro'}
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

// Composant PomodoroWidget Modifié
function PomodoroWidget({ compact, onClick, t, isActivePage }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus', 'short', 'long'
  const intervalRef = useRef(null);

  // Auto-start or sync if needed, but for now just a simple timer
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds === 0) {
            if (minutes === 0) {
              setIsActive(false); // Timer finished
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
  }, [isActive, minutes]);

  const totalSeconds = mode === 'focus' ? 1500 : mode === 'short' ? 300 : 900;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  // We only show the compact circle widget which acts as a button to the page
  return (
    <Tooltip content="Ouvrir Pomodoro" placement="right">
      <div
        className={`bg-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/15 transition-colors group border border-white/5 ${isActivePage ? 'ring-2 ring-cyan-400' : ''}`}
        onClick={onClick}
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