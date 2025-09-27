import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from '../../../hooks/useTranslation';
import LanguageSelector from '../../../components/LanguageSelector';
import logo from '../../../assets/images/ChatGPT_Image_9_juil._2025__13_14_57-removebg-preview.png';
import logoIco from '../../../assets/images/logo.ico';
const API_BASE = 'http://localhost:5000/api';

function getAuthHeader() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Composant Header moderne
export default function Header({ setActivePage }) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUserProfile() {
      try {
        const res = await axios.get(`${API_BASE}/users/profile`, { headers: getAuthHeader() });
        if (mounted) {
          const userData = res.data.user || res.data;
          setUser(userData);
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        // En cas d'erreur, on utilise les données du localStorage comme fallback
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser && mounted) {
            setUser(JSON.parse(storedUser));
          }
        } catch (e) {
          console.error('Impossible de parser les données utilisateur:', e);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUserProfile();
    return () => { mounted = false; };
  }, []);

  const handleLogoutClick = () => setShowLogoutModal(true);

  const doLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    } catch (e) {
      // ignore
    }
    window.location.href = '/login';
  };

  return (
    <header className="modern-header">
      {/* Logo et navigation principale */}
      <div className="header-left">
        <button
          className="header-logo"
          onClick={() => setActivePage && setActivePage('dashboard')}
          aria-label={t('goToDashboard')}
        >
          <img 
            src={logo} 
            alt="GenesisCode" 
            className="logo-img" 
            width="40" 
            height="40" 
          />
          <span className="logo-text">GenesisCode</span>
        </button>
      </div>

      {/* Actions rapides - masquées sur mobile */}
      <div className="header-center">
        {/* Actions rapides supprimées */}
      </div>

      {/* Actions utilisateur */}
      <div className="header-right">
        <div className="header-actions">
          {/* Sélecteur de langue */}
          <div className="language-selector-container">
            <LanguageSelector 
              showLabel={false} 
              size="small"
              className="header-language-selector"
            />
          </div>
          
          {/* Notifications */}
          <NotificationBell />
          
          {/* Bouton de déconnexion */}
          <button 
            className="logout-btn"
            onClick={handleLogoutClick}
            aria-label={t('logout')}
            title={t('logout')}
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">{t('logout')}</span>
          </button>
          
          {/* Menu mobile */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={t('openMenu')}
            title={t('openMenu')}
          >
            <span className="hamburger-icon">
              <span className={`hamburger-line ${isMenuOpen ? 'active' : ''}`}></span>
              <span className={`hamburger-line ${isMenuOpen ? 'active' : ''}`}></span>
              <span className={`hamburger-line ${isMenuOpen ? 'active' : ''}`}></span>
            </span>
          </button>
        </div>

        {/* Navigation mobile */}
        {isMenuOpen && (
          <MobileNavigation 
            setActivePage={setActivePage} 
            onClose={() => setIsMenuOpen(false)} 
            user={user}
            loading={loading}
            t={t}
          />
        )}
      </div>

      {/* Modal de déconnexion */}
      {showLogoutModal && (
        <LogoutModal 
          onCancel={() => setShowLogoutModal(false)} 
          onConfirm={doLogout}
          t={t}
        />
      )}

      <HeaderStyles />
    </header>
  );
}

// Composant de notifications
function NotificationBell() {
  const [hasNotifications, setHasNotifications] = useState(true);
  
  return (
    <button 
      className="notification-bell"
      aria-label="Notifications"
      onClick={() => setHasNotifications(false)}
    >
      <span className="bell-icon">🔔</span>
      {hasNotifications && <span className="notification-dot" aria-hidden></span>}
    </button>
  );
}

// Actions rapides supprimées

// Menu utilisateur supprimé

// Navigation mobile
function MobileNavigation({ setActivePage, onClose, user, loading, t }) {
  const menuItems = [
    { id: 'dashboard', name: t('dashboard'), icon: '📊' },
    { id: 'pomodoro', name: t('pomodoro'), icon: '⏱️' },
    { id: 'tasks', name: t('tasks'), icon: '✅' },
    { id: 'profile', name: t('profile'), icon: '👤' },
  ];

  const getInitials = (user) => {
    if (!user) return 'US';
    const a = (user.firstName || '').trim();
    const b = (user.lastName || '').trim();
    if (a || b) return `${(a[0]||'').toUpperCase()}${(b[0]||'').toUpperCase()}`;
    if (user.email) return user.email.slice(0,2).toUpperCase();
    return 'US';
  };

  const initials = getInitials(user);

  return (
    <nav className="mobile-navigation" aria-label="Menu mobile">
      <div className="mobile-nav-header">
        <div className="mobile-user-info">
          {loading ? (
            <div className="user-avatar loading"></div>
          ) : (
            <div className="user-avatar">{initials}</div>
          )}
          <div className="mobile-user-details">
            {loading ? (
              <>
                <div className="user-name loading-line"></div>
                <div className="user-email loading-line"></div>
              </>
            ) : (
              <>
                <div className="user-name">{user ? `${user.firstName} ${user.lastName}` : t('user')}</div>
                <div className="user-email">{user?.email || ''}</div>
              </>
            )}
          </div>
        </div>
        <button className="close-mobile-nav" onClick={onClose}>×</button>
      </div>
      
      <ul className="mobile-nav-list">
        {menuItems.map(item => (
          <li key={item.id}>
            <button
              className="mobile-nav-item"
              onClick={() => { setActivePage(item.id); onClose(); }}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-text">{item.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Modal de déconnexion
function LogoutModal({ onCancel, onConfirm, t }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    
    function handleEscapeKey(e) {
      if (e.key === 'Escape') onCancel();
    }
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onCancel]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
      <div className="modal-content">
        <h2 id="logout-modal-title">{t('confirmLogout')}</h2>
        <p>{t('confirmLogoutMessage')}</p>
        
        <div className="modal-actions">
          <button ref={cancelRef} className="modal-btn cancel" onClick={onCancel}>
            {t('cancel')}
          </button>
          <button className="modal-btn confirm" onClick={onConfirm}>
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Injection des styles
function HeaderStyles() {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById('modern-header-styles')) return;

    const css = `
      /* Variables CSS */
      :root {
        --header-height: 70px;
        --header-bg: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        --header-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        --text-primary: #ffffff;
        --text-secondary: rgba(255, 255, 255, 0.8);
        --text-muted: rgba(255, 255, 255, 0.6);
        --border-light: rgba(255, 255, 255, 0.1);
        --border-medium: rgba(255, 255, 255, 0.2);
        --bg-hover: rgba(255, 255, 255, 0.05);
        --bg-active: rgba(255, 255, 255, 0.1);
        --primary-gradient: linear-gradient(135deg, #06b6d4, #7c3aed);
        --danger-gradient: linear-gradient(135deg, #ef4444, #dc2626);
        --success-gradient: linear-gradient(135deg, #10b981, #34d399);
        --radius-sm: 6px;
        --radius-md: 8px;
        --radius-lg: 12px;
        --radius-xl: 16px;
        --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
        --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
        --shadow-lg: 0 8px 25px rgba(0, 0, 0, 0.2);
      }

      /* Header principal */
      .modern-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        background: var(--header-bg);
        color: var(--text-primary);
        box-shadow: var(--header-shadow);
        position: sticky;
        top: 0;
        z-index: 1000;
        height: var(--header-height);
        box-sizing: border-box;
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--border-light);
      }
      
      .header-left, .header-center, .header-right {
        display: flex;
        align-items: center;
      }
      
      .header-logo {
        display: flex;
        align-items: center;
        gap: 12px;
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 12px 16px;
        border-radius: 12px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .header-logo::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 12px;
      }
      
      .header-logo:hover::before {
        opacity: 1;
      }
      
      .header-logo:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }
      
      .logo-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        background: linear-gradient(90deg, #06b6d4, #7c3aed);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      
      .logo-text {
        font-weight: 700;
        font-size: 1.2rem;
        background: linear-gradient(90deg, #e2e8f0, #cbd5e1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      /* Quick Actions */
      .quick-actions {
        display: flex;
        gap: 16px;
      }
      
      .action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: white;
        padding: 10px 18px;
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        font-weight: 500;
      }
      
      .action-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }
      
      .action-btn:hover::before {
        left: 100%;
      }
      
      .action-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
      }
      
      .action-text {
        font-size: 0.9rem;
        font-weight: 500;
      }
      
      /* Header Actions */
      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      /* Language Selector in Header */
      .header-language-selector {
        position: relative;
      }
      
      .header-language-select {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: white;
        padding: 6px 12px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 80px;
      }
      
      .header-language-select:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
      }
      
      .header-language-select:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.5);
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
      }
      
      .header-language-select option {
        background: #1e293b;
        color: white;
        padding: 8px;
      }
      
      .notification-bell {
        position: relative;
        background: transparent;
        border: none;
        color: white;
        padding: 8px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      
      .notification-bell:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .notification-dot {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ef4444;
      }
      
      .logout-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        padding: 10px 18px;
        border-radius: 25px;
        border: none;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        font-weight: 500;
      }
      
      .logout-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .logout-btn:hover::before {
        opacity: 1;
      }
      
      .logout-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
        background: linear-gradient(135deg, #f87171, #ef4444);
      }
      
      .logout-text {
        font-weight: 500;
      }
      
      /* User Menu */
      .user-menu-container {
        position: relative;
      }
      
      .user-menu-toggle {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        transition: background 0.2s ease;
      }
      
      .user-menu-toggle:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        background: linear-gradient(90deg, #06b6d4, #7c3aed);
      }

      .user-avatar.loading {
        background: #94a3b8;
        animation: pulse 1.5s infinite;
      }

      .loading-line {
        background: #e2e8f0;
        border-radius: 4px;
        height: 12px;
        margin: 4px 0;
        animation: pulse 1.5s infinite;
      }

      .user-name.loading-line {
        width: 120px;
      }

      .user-email.loading-line {
        width: 160px;
      }

      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      
      .user-menu-dropdown {
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        width: 280px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        overflow: hidden;
        animation: slideDown 0.2s ease;
      }
      
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .user-info {
        padding: 16px;
        background: linear-gradient(90deg, #f8fafc, #f1f5f9);
      }
      
      .user-name {
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 4px;
      }
      
      .user-email {
        font-size: 0.85rem;
        color: #64748b;
      }
      
      .menu-divider {
        height: 1px;
        background: #e2e8f0;
        margin: 8px 0;
      }
      
      .menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 16px;
        background: transparent;
        border: none;
        text-align: left;
        cursor: pointer;
        transition: background 0.2s ease;
        color: #334155;
      }
      
      .menu-item:hover {
        background: #f1f5f9;
      }
      
      .menu-item.logout {
        color: #ef4444;
      }
      
      /* Mobile Menu Toggle */
      .mobile-menu-toggle {
        display: none;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        padding: 8px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      
      .mobile-menu-toggle:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      
      /* Mobile Navigation */
      .mobile-navigation {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #1e293b;
        padding: 16px;
        z-index: 100;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease;
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .mobile-nav-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .mobile-user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      .mobile-user-details {
        flex: 1;
      }
      
      .mobile-nav-header h3 {
        margin: 0;
        color: white;
      }
      
      .close-mobile-nav {
        background: transparent;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 4px;
      }
      
      .mobile-nav-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .mobile-nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px;
        background: transparent;
        border: none;
        border-radius: 8px;
        color: white;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      
      .mobile-nav-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      /* Modal */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      .modal-content {
        background: white;
        border-radius: 12px;
        padding: 24px;
        width: 90%;
        max-width: 400px;
        animation: scaleIn 0.2s ease;
      }
      
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .modal-content h2 {
        margin: 0 0 12px 0;
        color: #0f172a;
      }
      
      .modal-content p {
        margin: 0 0 20px 0;
        color: #64748b;
      }
      
      .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
      
      .modal-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      
      .modal-btn.cancel {
        background: #f1f5f9;
        color: #64748b;
      }
      
      .modal-btn.cancel:hover {
        background: #e2e8f0;
      }
      
      .modal-btn.confirm {
        background: #ef4444;
        color: white;
      }
      
      .modal-btn.confirm:hover {
        background: #dc2626;
      }
      
      /* Responsive Design */
      @media (max-width: 1024px) {
        .quick-actions {
          display: none;
        }
        
        .header-language-selector {
          order: -1;
        }
      }
      
      @media (max-width: 768px) {
        .modern-header {
          padding: 12px 16px;
          height: 70px;
        }
        
        .logo-text {
          display: none;
        }
        
        .logout-text {
          display: none;
        }
        
        .logout-btn {
          padding: 8px;
        }
        
        .header-language-select {
          min-width: 60px;
          padding: 4px 8px;
          font-size: 0.8rem;
        }
        
        .mobile-menu-toggle {
          display: block;
        }
        
        .user-menu-container {
          display: none;
        }
      }
      
      @media (max-width: 480px) {
        .header-actions {
          gap: 8px;
        }
        
        .header-language-select {
          min-width: 50px;
          padding: 4px 6px;
          font-size: 0.75rem;
        }
        
        .action-btn {
          padding: 8px 12px;
          font-size: 0.8rem;
        }
      }
      
      @media (min-width: 769px) {
        .mobile-navigation {
          display: none;
        }
      }
      
      /* Focus styles for accessibility */
      .header-logo:focus,
      .action-btn:focus,
      .notification-bell:focus,
      .logout-btn:focus,
      .user-menu-toggle:focus,
      .mobile-menu-toggle:focus,
      .mobile-nav-item:focus,
      .menu-item:focus,
      .modal-btn:focus {
        outline: 2px solid rgba(99, 102, 241, 0.5);
        outline-offset: 2px;
      }
    `;

    const style = document.createElement('style');
    style.id = 'modern-header-styles';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById('modern-header-styles');
      if (el) el.remove();
    };
  }, []);

  return null;
}