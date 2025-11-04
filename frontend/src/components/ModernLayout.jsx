// Layout moderne et professionnel pour le dashboard client
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ModernHeader from './ModernHeader';
import ModernSidebar from './ModernSidebar';
import ModernFooter from './ModernFooter';
import './ModernLayout.css';

const ModernLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement initial
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="modern-layout">
      {/* Header moderne */}
      <ModernHeader 
        onToggleSidebar={toggleSidebar}
        onToggleMobileMenu={toggleMobileMenu}
        mobileMenuOpen={mobileMenuOpen}
      />

      <div className="layout-container">
        {/* Sidebar moderne */}
        <ModernSidebar 
          collapsed={sidebarCollapsed}
          mobileOpen={mobileMenuOpen}
          onClose={closeMobileMenu}
        />

        {/* Contenu principal */}
        <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer moderne */}
      <ModernFooter />
    </div>
  );
};

// Écran de chargement moderne
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-container">
      <div className="loading-logo">
        <div className="logo-icon">🚀</div>
        <div className="logo-text">GenesisCode</div>
      </div>
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <div className="loading-text">Chargement de votre espace...</div>
    </div>
  </div>
);

export default ModernLayout;







