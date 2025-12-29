import React, { useState, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiSearch,
  FiPlus,
  FiGrid,
  FiMap,
  FiLayers,
  FiActivity,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

import CategoriesPanel from './panels/CategoriesPanel';
import PathsPanel from './panels/PathsPanel';
import LevelsPanel from './panels/LevelsPanel';
import ExercisesPanel from './panels/ExercisesPanel';

export default function CourseManagement() {
  const [activePanel, setActivePanel] = useState('categories');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const categoriesCreateRef = useRef(null);
  const pathsCreateRef = useRef(null);
  const levelsCreateRef = useRef(null);
  const exercisesCreateRef = useRef(null);

  const openCreateFor = (panel) => {
    switch (panel) {
      case 'categories': categoriesCreateRef.current?.(); break;
      case 'paths': pathsCreateRef.current?.(); break;
      case 'levels': levelsCreateRef.current?.(); break;
      case 'exercises': exercisesCreateRef.current?.(); break;
    }
  };

  const navItems = [
    { id: 'categories', label: 'Catégories', icon: FiGrid, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { id: 'paths', label: 'Parcours', icon: FiMap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'levels', label: 'Niveaux', icon: FiLayers, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'exercises', label: 'Exercices', icon: FiActivity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-[#0f172a] font-sans text-gray-900 dark:text-gray-100 overflow-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          bg-white/80 dark:bg-[#1e293b]/80 border-r border-gray-200 dark:border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden
        `}
      >
        <div className="w-[280px] h-full flex flex-col">
          {/* Brand */}
          <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
              CG
            </div>
            <div>
              <h1 className="font-exrabold text-xl text-gray-900 dark:text-white leading-tight tracking-tight">Course Admin</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-0.5">Content CMS</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePanel === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePanel(item.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden group
                    ${isActive
                      ? 'bg-indigo-50 dark:bg-white/10 text-indigo-700 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white dark:bg-white/20' : 'bg-gray-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10'}`}>
                    <Icon size={20} className={isActive ? 'text-indigo-600 dark:text-white' : item.color} />
                  </div>
                  {item.label}
                  {isActive && <motion.div layoutId="activeInd" className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-l-full" />}
                </button>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="p-6 m-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl border border-indigo-500/10">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2 flex items-center gap-2">
              <FiActivity /> Astuce
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              Gérez votre contenu hiérarchiquement : Catégorie &gt; Parcours &gt; Niveau &gt; Exercice.
            </p>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Bar */}
        <header className="px-8 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
            >
              {sidebarOpen ? <FiMenu size={24} /> : <FiMenu size={24} />}
            </button>
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                {navItems.find(i => i.id === activePanel)?.label}
              </h2>
            </motion.div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-11 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all shadow-sm"
                readOnly
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openCreateFor(activePanel)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-xl shadow-gray-900/20 dark:shadow-white/10 transition-all"
            >
              <FiPlus size={20} />
              <span className="hidden sm:inline">Créer</span>
            </motion.button>
          </div>
        </header>

        {/* Panel Content */}
        <div className="flex-1 overflow-auto p-8 pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-[1600px] mx-auto"
          >
            <div className="bg-white/70 dark:bg-[#1e293b]/70 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/20 dark:border-white/5 p-8 min-h-[calc(100vh-140px)] relative overflow-hidden">
              {activePanel === 'categories' && (
                <CategoriesPanel onOpenCreate={fn => categoriesCreateRef.current = fn} />
              )}
              {activePanel === 'paths' && (
                <PathsPanel onOpenCreate={fn => pathsCreateRef.current = fn} />
              )}
              {activePanel === 'levels' && (
                <LevelsPanel onOpenCreate={fn => levelsCreateRef.current = fn} />
              )}
              {activePanel === 'exercises' && (
                <ExercisesPanel onOpenCreate={fn => exercisesCreateRef.current = fn} />
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="dark" />
    </div>
  );
}