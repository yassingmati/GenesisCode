import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';

// Hook pour gérer l'état de la sidebar
export function useSidebarState(storageKey = 'pf.sidebar.collapsed') {
  const COLLAPSED_W = 80;
  const EXPANDED_W = 320;

  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) return stored === 'true';
    } catch (e) { /* ignore */ }
    return window.innerWidth < 1024;
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, String(collapsed)); } catch (e) {}
  }, [collapsed, storageKey]);

  const width = collapsed ? COLLAPSED_W : EXPANDED_W;
  return [collapsed, setCollapsed, width];
}

// Composant Sidebar avec Pomodoro intégré
export default function Sidebar({ activePage, setActivePage, user = null }) {
  const { t } = useTranslation();
  
  const tabs = [
    { id: 'dashboard', name: t('dashboard'), icon: '📊' },
    { id: 'pomodoro', name: t('pomodoro'), icon: '⏱️' },
    { id: 'tasks', name: t('dailyTasks'), icon: '✅' },
    { id: 'profile', name: t('profile'), icon: '👤' },
  ];

  const [collapsed, setCollapsed, width] = useSidebarState();
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = computeInitials(user);

  useEffect(() => { injectStyles(); }, []);

  function handleNav(id) {
    setActivePage && setActivePage(id);
    if (id === 'pomodoro') {
      setShowPomodoro(true);
    } else if (showPomodoro) {
      setShowPomodoro(false);
    }
    // Fermer la sidebar sur mobile après avoir cliqué sur un lien
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  }

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Bouton hamburger pour mobile */}
      <button 
        className="mobile-menu-toggle"
        onClick={toggleMobileSidebar}
        aria-label="Ouvrir le menu"
      >
        ☰
      </button>

      {/* Overlay pour mobile */}
      {mobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`modern-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        data-collapsed={collapsed}
        style={{ width }}
      >
        {/* Top section avec logo et bouton de réduction */}
        <div className="sidebar-top">
          <button
            className="sidebar-brand"
            onClick={() => handleNav('dashboard')}
            aria-label="Aller au tableau de bord"
          >
           
            <span className="brand-text">GenesisCode</span>
          </button>

          <button
            className="sidebar-collapse"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Développer la barre latérale' : 'Réduire la barre latérale'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation principale */}
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activePage === tab.id ? 'active' : ''}`}
              onClick={() => handleNav(tab.id)}
              title={collapsed ? tab.name : undefined}
              aria-current={activePage === tab.id ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden>{tab.icon}</span>
              <span className="nav-label">{tab.name}</span>
              {activePage === tab.id && <span className="active-indicator" aria-hidden />}
            </button>
          ))}
        </nav>

        {/* Widget Pomodoro intégré */}
        <div className={`pomodoro-widget ${showPomodoro ? 'expanded' : 'collapsed'}`}>
          <PomodoroWidget compact={!showPomodoro} onToggleExpand={() => setShowPomodoro(!showPomodoro)} t={t} />
        </div>

        {/* Section utilisateur avec cœurs */}
      
      </aside>
    </>
  );
}

// Composant PomodoroWidget
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
      // Après 4 cycles focus, on propose une pause longue
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
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'focus' ? 25 : mode === 'short' ? 5 : 15);
    setSeconds(0);
  };

  const formatTime = () => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = 100 - ((minutes * 60 + seconds) / (mode === 'focus' ? 1500 : mode === 'short' ? 300 : 900) * 100);

  if (compact) {
    return (
      <div className="pomodoro-compact" onClick={onToggleExpand}>
        <div className="compact-timer">{formatTime()}</div>
        <div className="compact-mode">{mode === 'focus' ? t('focus') : t('pause')}</div>
        <button 
          className={`compact-control ${isActive ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
        >
          {isActive ? '⏸️' : '▶️'}
        </button>
      </div>
    );
  }

  return (
    <div className="pomodoro-expanded">
      <div className="pomodoro-header">
        <h3>{t('pomodoroTimer')}</h3>
        <button className="close-pomodoro" onClick={onToggleExpand}>×</button>
      </div>
      
      <div className="timer-display">
        <div className="timer-progress">
          <svg viewBox="0 0 100 100" className="progress-ring">
            <circle className="progress-ring-background" cx="50" cy="50" r="45" />
            <circle 
              className="progress-ring-fill" 
              cx="50" cy="50" r="45" 
              strokeDasharray={282.6} 
              strokeDashoffset={282.6 - (progress * 2.826)} 
            />
          </svg>
          <div className="timer-text">{formatTime()}</div>
        </div>
        
        <div className="timer-mode">{mode === 'focus' ? t('focusTime') : mode === 'short' ? t('shortBreak') : t('longBreak')}</div>
        
        <div className="cycles-indicator">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`cycle-dot ${i < completedCycles % 4 ? 'completed' : ''}`} />
          ))}
        </div>
      </div>
      
      <div className="timer-controls">
        <button 
          className={`control-button ${isActive ? 'pause' : 'start'}`}
          onClick={toggleTimer}
        >
          {isActive ? t('pause') : t('start')}
        </button>
        <button className="control-button reset" onClick={resetTimer}>
          {t('reset')}
        </button>
      </div>
      
      <div className="mode-selection">
        <button 
          className={`mode-button ${mode === 'focus' ? 'active' : ''}`}
          onClick={() => { setMode('focus'); setMinutes(25); setSeconds(0); }}
        >
          {t('focus')} (25:00)
        </button>
        <button 
          className={`mode-button ${mode === 'short' ? 'active' : ''}`}
          onClick={() => { setMode('short'); setMinutes(5); setSeconds(0); }}
        >
          {t('short')} (5:00)
        </button>
        <button 
          className={`mode-button ${mode === 'long' ? 'active' : ''}`}
          onClick={() => { setMode('long'); setMinutes(15); setSeconds(0); }}
        >
          {t('long')} (15:00)
        </button>
      </div>
    </div>
  );
}

// Helper functions
function computeInitials(user) {
  if (!user) return 'US';
  const a = (user.firstName || '').trim();
  const b = (user.lastName || '').trim();
  if (a || b) return `${(a[0] || '').toUpperCase()}${(b[0] || '').toUpperCase()}`;
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return 'US';
}

let _stylesInjected = false;
function injectStyles() {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const css = `
    /* Styles de base */
    :root {
      --sidebar-expanded: 320px;
      --sidebar-collapsed: 80px;
      --primary-gradient: linear-gradient(180deg, #4f46e5, #7c3aed);
      --secondary-gradient: linear-gradient(90deg, #06b6d4, #7c3aed);
      --text-light: rgba(255, 255, 255, 0.95);
      --text-muted: rgba(255, 255, 255, 0.7);
      --bg-hover: rgba(255, 255, 255, 0.08);
      --bg-active: rgba(255, 255, 255, 0.15);
      --transition: all 0.3s ease;
      --heart-color: #ff3366;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-x: hidden;
    }
    
    /* Bouton menu mobile */
    .mobile-menu-toggle {
      display: none;
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 1001;
      background: var(--primary-gradient);
      color: white;
      border: none;
      border-radius: 8px;
      width: 48px;
      height: 48px;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    /* Overlay pour mobile */
    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }
    
    .modern-sidebar {
      width: var(--sidebar-expanded);
      background: var(--primary-gradient);
      color: white;
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 16px 12px;
      box-shadow: 0 8px 30px rgba(2, 6, 23, 0.35);
      transition: var(--transition);
      position: relative;
      z-index: 1000;
      overflow-y: auto;
    }
    
    .modern-sidebar[data-collapsed="true"] {
      width: var(--sidebar-collapsed);
    }
    
    /* Top section */
    .sidebar-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 8px;
      border-radius: 12px;
      transition: var(--transition);
    }
    
    .sidebar-brand:hover {
      background: var(--bg-hover);
    }
    
    .sidebar-logo {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      background: var(--secondary-gradient);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
    }
    
    .brand-text {
      font-weight: 700;
      font-size: 1.1rem;
      transition: var(--transition);
    }
    
    .sidebar-collapse {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
    }
    
    .sidebar-collapse:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    /* Navigation */
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 24px;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      background: transparent;
      color: var(--text-light);
      border: none;
      cursor: pointer;
      position: relative;
      text-align: left;
      transition: var(--transition);
    }
    
    .nav-item:hover {
      background: var(--bg-hover);
    }
    
    .nav-item.active {
      background: var(--bg-active);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .nav-icon {
      font-size: 1.25rem;
      width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .nav-label {
      font-weight: 500;
      transition: var(--transition);
    }
    
    .active-indicator {
      position: absolute;
      right: 12px;
      width: 6px;
      height: 50%;
      background: linear-gradient(180deg, #34d399, #06b6d4);
      border-radius: 8px;
    }
    
    /* Pomodoro Widget */
    .pomodoro-widget {
      margin-bottom: 24px;
      transition: var(--transition);
    }
    
    .pomodoro-compact {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: var(--transition);
    }
    
    .pomodoro-compact:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    
    .compact-timer {
      font-size: 1.5rem;
      font-weight: 700;
    }
    
    .compact-mode {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .compact-control {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: var(--transition);
    }
    
    .compact-control:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .compact-control.active {
      background: rgba(79, 70, 229, 0.8);
    }
    
    .pomodoro-expanded {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .pomodoro-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .pomodoro-header h3 {
      margin: 0;
      font-size: 1.1rem;
    }
    
    .close-pomodoro {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
      transition: var(--transition);
    }
    
    .close-pomodoro:hover {
      color: var(--text-light);
    }
    
    .timer-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    
    .timer-progress {
      position: relative;
      width: 160px;
      height: 160px;
    }
    
    .progress-ring {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    
    .progress-ring-background {
      fill: none;
      stroke: rgba(255, 255, 255, 0.2);
      stroke-width: 6;
    }
    
    .progress-ring-fill {
      fill: none;
      stroke: url(#progressGradient);
      stroke-width: 6;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.5s ease;
    }
    
    .timer-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      font-weight: 700;
    }
    
    .timer-mode {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    
    .cycles-indicator {
      display: flex;
      gap: 6px;
    }
    
    .cycle-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
    }
    
    .cycle-dot.completed {
      background: #7c3aed;
    }
    
    .timer-controls {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    
    .control-button {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
    }
    
    .control-button.start {
      background: #10b981;
      color: white;
    }
    
    .control-button.pause {
      background: #f59e0b;
      color: white;
    }
    
    .control-button.reset {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-light);
    }
    
    .control-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .mode-selection {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .mode-button {
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 8px;
      color: var(--text-light);
      cursor: pointer;
      transition: var(--transition);
      text-align: left;
    }
    
    .mode-button:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    
    .mode-button.active {
      background: rgba(79, 70, 229, 0.3);
    }
    
    /* User section avec cœurs */
    .sidebar-bottom {
      margin-top: auto;
    }
    
    .user-panel {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    .user-status {
      font-size: 0.75rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .hearts-container {
      display: flex;
      gap: 2px;
    }
    
    .heart {
      font-size: 0.7rem;
      opacity: 0.3;
      transition: all 0.3s ease;
    }
    
    .heart.filled {
      opacity: 1;
      color: var(--heart-color);
      text-shadow: 0 0 8px rgba(255, 51, 102, 0.6);
    }
    
    /* Collapsed state */
    .modern-sidebar[data-collapsed="true"] .brand-text,
    .modern-sidebar[data-collapsed="true"] .nav-label,
    .modern-sidebar[data-collapsed="true"] .user-info,
    .modern-sidebar[data-collapsed="true"] .pomodoro-expanded,
    .modern-sidebar[data-collapsed="true"] .compact-mode {
      display: none;
    }
    
    .modern-sidebar[data-collapsed="true"] .nav-item {
      justify-content: center;
      padding: 12px;
    }
    
    .modern-sidebar[data-collapsed="true"] .active-indicator {
      right: 6px;
    }
    
    .modern-sidebar[data-collapsed="true"] .pomodoro-compact {
      padding: 12px 8px;
    }
    
    .modern-sidebar[data-collapsed="true"] .compact-timer {
      font-size: 1.1rem;
    }
    
    .modern-sidebar[data-collapsed="true"] .user-panel {
      justify-content: center;
      padding: 8px;
    }
    
    /* Tooltips for collapsed state */
    .modern-sidebar[data-collapsed="true"] .nav-item:hover::after,
    .modern-sidebar[data-collapsed="true"] .pomodoro-compact:hover::after,
    .modern-sidebar[data-collapsed="true"] .user-panel:hover::after {
      content: attr(title);
      position: absolute;
      left: calc(100% + 12px);
      background: rgba(2, 6, 23, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      white-space: nowrap;
      font-size: 0.85rem;
      z-index: 1000;
      pointer-events: none;
    }
    
    /* Responsive design pour mobile */
    @media (max-width: 1024px) {
      .mobile-menu-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .sidebar-overlay {
        display: block;
      }
      
      .modern-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .modern-sidebar.mobile-open {
        transform: translateX(0);
        box-shadow: 4px 0 30px rgba(2, 6, 23, 0.4);
      }
      
      .modern-sidebar[data-collapsed="true"] {
        transform: translateX(-100%);
      }
      
      .modern-sidebar[data-collapsed="true"].mobile-open {
        transform: translateX(0);
      }
      
      /* Ajustements pour les petits écrans */
      .pomodoro-expanded {
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .timer-progress {
        width: 140px;
        height: 140px;
      }
      
      .timer-text {
        font-size: 1.7rem;
      }
      
      .control-button {
        padding: 8px 16px;
        font-size: 0.9rem;
      }
      
      .mode-button {
        padding: 6px 10px;
        font-size: 0.85rem;
      }
    }
    
    /* Styles pour très petits écrans */
    @media (max-width: 360px) {
      .modern-sidebar {
        width: 100vw !important;
      }
      
      .modern-sidebar[data-collapsed="true"] {
        width: 100vw !important;
      }
      
      .sidebar-top {
        flex-direction: column;
        gap: 12px;
      }
      
      .pomodoro-compact {
        padding: 12px;
      }
      
      .compact-timer {
        font-size: 1.3rem;
      }
    }
    
    /* Focus states for accessibility */
    .sidebar-brand:focus,
    .sidebar-collapse:focus,
    .nav-item:focus,
    .compact-control:focus,
    .control-button:focus,
    .mode-button:focus,
    .mobile-menu-toggle:focus {
      outline: 2px solid rgba(255, 255, 255, 0.5);
      outline-offset: 2px;
    }
    
    /* SVG gradients */
    .modern-sidebar svg.defs-only {
      position: absolute;
      width: 0;
      height: 0;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'modern-sidebar-styles';
  styleEl.appendChild(document.createTextNode(css));
  
  // Add SVG gradients for the progress ring
  const svgDefs = `
    <svg class="defs-only" aria-hidden="true">
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  `;
  
  document.head.appendChild(styleEl);
  document.body.insertAdjacentHTML('beforeend', svgDefs);
}