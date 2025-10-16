// Sidebar moderne et professionnelle pour le dashboard client
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { 
  FiHome, 
  FiBookOpen, 
  FiPlay, 
  FiCheckSquare, 
  FiUser, 
  FiSettings,
  FiBarChart3,
  FiCalendar,
  FiMessageSquare,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi';
import './ModernSidebar.css';

const ModernSidebar = ({ 
  collapsed, 
  mobileOpen, 
  onClose 
}) => {
  const { t } = useTranslation();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [hearts, setHearts] = useState(5);
  const [showPomodoro, setShowPomodoro] = useState(false);

  const navigationItems = [
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: FiHome,
      path: '/dashboard'
    },
    {
      id: 'courses',
      label: t('courses'),
      icon: FiBookOpen,
      path: '/courses',
      badge: 'Nouveau'
    },
    {
      id: 'lessons',
      label: t('lessons'),
      icon: FiPlay,
      path: '/lessons'
    },
    {
      id: 'exercises',
      label: t('exercises'),
      icon: FiCheckSquare,
      path: '/exercises'
    },
    {
      id: 'progress',
      label: t('progress'),
      icon: FiBarChart3,
      path: '/progress'
    },
    {
      id: 'calendar',
      label: t('calendar'),
      icon: FiCalendar,
      path: '/calendar'
    },
    {
      id: 'messages',
      label: t('messages'),
      icon: FiMessageSquare,
      path: '/messages',
      badge: '3'
    }
  ];

  const bottomItems = [
    {
      id: 'profile',
      label: t('profile'),
      icon: FiUser,
      path: '/profile'
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: FiSettings,
      path: '/settings'
    }
  ];

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    if (mobileOpen) {
      onClose();
    }
  };

  const addHeart = () => {
    if (hearts < 10) {
      setHearts(hearts + 1);
    }
  };

  const removeHeart = () => {
    if (hearts > 0) {
      setHearts(hearts - 1);
    }
  };

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`modern-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header de la sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">🚀</div>
            {!collapsed && <span className="logo-text">GenesisCode</span>}
          </div>
          
          {!collapsed && (
            <button className="sidebar-close-mobile" onClick={onClose}>
              <FiX />
            </button>
          )}
        </div>

        {/* Navigation principale */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">
              {!collapsed && <span>Navigation</span>}
            </div>
            
            <div className="nav-items">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
                    onClick={() => handleItemClick(item)}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="nav-item-content">
                      <Icon className="nav-icon" />
                      {!collapsed && (
                        <>
                          <span className="nav-label">{item.label}</span>
                          {item.badge && (
                            <span className="nav-badge">{item.badge}</span>
                          )}
                        </>
                      )}
                    </div>
                    {activeItem === item.id && <div className="active-indicator" />}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Widget Pomodoro */}
        {!collapsed && (
          <div className="sidebar-widget">
            <div className="widget-header">
              <h3>Pomodoro Timer</h3>
              <button 
                className="widget-toggle"
                onClick={() => setShowPomodoro(!showPomodoro)}
              >
                {showPomodoro ? <FiChevronLeft /> : <FiChevronRight />}
              </button>
            </div>
            
            {showPomodoro && (
              <div className="pomodoro-widget">
                <div className="pomodoro-timer">
                  <div className="timer-display">25:00</div>
                  <div className="timer-mode">Focus Time</div>
                </div>
                
                <div className="pomodoro-controls">
                  <button className="timer-btn start">Start</button>
                  <button className="timer-btn reset">Reset</button>
                </div>
                
                <div className="pomodoro-modes">
                  <button className="mode-btn active">Focus (25m)</button>
                  <button className="mode-btn">Short Break (5m)</button>
                  <button className="mode-btn">Long Break (15m)</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section des cœurs */}
        <div className="sidebar-hearts">
          <div className="hearts-container">
            <span className="hearts-label">
              {!collapsed && 'Cœurs'}
            </span>
            <div className="hearts-display">
              {[...Array(10)].map((_, index) => (
                <button
                  key={index}
                  className={`heart ${index < hearts ? 'filled' : ''}`}
                  onClick={index < hearts ? removeHeart : addHeart}
                  title={collapsed ? `${hearts}/10 cœurs` : undefined}
                >
                  <FiHeart />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation du bas */}
        <div className="sidebar-bottom">
          <div className="nav-section">
            <div className="nav-items">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
                    onClick={() => handleItemClick(item)}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="nav-item-content">
                      <Icon className="nav-icon" />
                      {!collapsed && <span className="nav-label">{item.label}</span>}
                    </div>
                    {activeItem === item.id && <div className="active-indicator" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ModernSidebar;






