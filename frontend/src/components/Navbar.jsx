// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, logout, user, error, clearError } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Handle scroll to contact from URL params
  useEffect(() => {
    if (location.pathname === '/' && location.search.includes('scrollTo=contact')) {
      const element = document.getElementById('contact');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          // Clean up URL
          window.history.replaceState({}, document.title, '/');
        }, 500);
      }
    }
  }, [location]);

  const handleScrollToTop = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // If not on home, Link will handle navigation to /
  };

  const handleScrollToContact = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById('contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/?scrollTo=contact');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg py-3'
          : 'bg-transparent py-5'
          }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" onClick={handleScrollToTop} className="flex items-center gap-2">
            <img src={require('../assets/icons/logo.png')} alt="CodeGenesis Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              GenesisCode
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              onClick={handleScrollToTop}
              className={`font-medium transition-colors hover:text-blue-500 ${location.pathname === '/'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300'
                }`}
            >
              {t('nav.home')}
            </Link>

            <a
              href="#contact"
              onClick={handleScrollToContact}
              className="font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              {t('nav.contact')}
            </a>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`font-medium transition-colors hover:text-blue-500 ${location.pathname === '/dashboard'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300'
                  }`}
              >
                Tableau de bord
              </Link>
            )}

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

            <LanguageSelector showLabel={false} size="small" className="mr-2" />
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">
                    {user?.firstName?.charAt(0) || <FaUser />}
                  </div>
                  <span>{user?.firstName || 'Mon compte'}</span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100">
                  <div className="p-2 space-y-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                      <FaUserCircle /> Profil
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                      <FaTachometerAlt /> Dashboard
                    </Link>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <FaSignOutAlt /> Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <LanguageSelector showLabel={false} size="small" />
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-700 dark:text-slate-200 p-2"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white dark:bg-slate-900 pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-lg">
              <Link to="/" onClick={handleScrollToTop} className="text-slate-800 dark:text-slate-200 font-medium">
                {t('nav.home')}
              </Link>

              <a
                href="#contact"
                onClick={handleScrollToContact}
                className="text-slate-800 dark:text-slate-200 font-medium"
              >
                {t('nav.contact')}
              </a>

              {isAuthenticated && (
                <Link to="/dashboard" className="text-slate-800 dark:text-slate-200 font-medium">
                  Tableau de bord
                </Link>
              )}

              <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                      {user?.firstName?.charAt(0) || <FaUser />}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{user?.firstName}</div>
                      <div className="text-sm">{user?.email}</div>
                    </div>
                  </div>
                  <Link to="/profile" className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <FaUserCircle /> Mon Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-600 dark:text-red-400"
                  >
                    <FaSignOutAlt /> Déconnexion
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link
                    to="/login"
                    className="w-full py-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-3 text-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;