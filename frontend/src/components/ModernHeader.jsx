// Header moderne et professionnel pour le dashboard client
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { 
  FiMenu, 
  FiX, 
  FiBell, 
  FiSearch, 
  FiSettings, 
  FiUser, 
  FiLogOut,
  FiSun,
  FiMoon,
  FiChevronDown
} from 'react-icons/fi';
import './ModernHeader.css';

const ModernHeader = ({ 
  onToggleSidebar, 
  onToggleMobileMenu, 
  mobileMenuOpen 
}) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Charger les données utilisateur
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erreur parsing user data:', error);
      }
    }

    // Charger le thème
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    // Appliquer le thème
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Recherche:', searchQuery);
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  return (
    <header className="modern-header">
      <div className="header-container">
        {/* Section gauche */}
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label="Basculer la sidebar"
          >
            <FiMenu />
          </button>

          <div className="header-logo">
            <div className="logo-icon">🚀</div>
            <span className="logo-text">GenesisCode</span>
          </div>
        </div>

        {/* Section centre - Recherche */}
        <div className="header-center">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher des cours, exercices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>

        {/* Section droite */}
        <div className="header-right">
          {/* Bouton thème */}
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          {/* Notifications */}
          <div className="notifications-container">
            <button 
              className="notifications-toggle"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <FiBell />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <button 
                    className="close-dropdown"
                    onClick={() => setShowNotifications(false)}
                  >
                    <FiX />
                  </button>
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      <FiBell className="no-notifications-icon" />
                      <p>Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notification, index) => (
                      <div key={index} className="notification-item">
                        <div className="notification-content">
                          <h4>{notification.title}</h4>
                          <p>{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Menu utilisateur */}
          <div className="user-menu-container">
            <button 
              className="user-menu-toggle"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="Menu utilisateur"
            >
              <div className="user-avatar">
                {getUserInitials()}
              </div>
              <span className="user-name">
                {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
              </span>
              <FiChevronDown className="chevron-icon" />
            </button>

            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-info">
                  <div className="user-avatar-large">
                    {getUserInitials()}
                  </div>
                  <div className="user-details">
                    <h4>{user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}</h4>
                    <p>{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                
                <div className="menu-divider"></div>
                
                <div className="menu-items">
                  <button className="menu-item">
                    <FiUser />
                    <span>Profil</span>
                  </button>
                  <button className="menu-item">
                    <FiSettings />
                    <span>Paramètres</span>
                  </button>
                  <button className="menu-item" onClick={handleLogout}>
                    <FiLogOut />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu mobile */}
          <button 
            className="mobile-menu-toggle"
            onClick={onToggleMobileMenu}
            aria-label="Menu mobile"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Overlay pour les dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="dropdown-overlay"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default ModernHeader;






