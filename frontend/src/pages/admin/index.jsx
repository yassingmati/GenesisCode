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

import CategoriesPanel from './panels/CategoriesPanel';
import PathsPanel from './panels/PathsPanel';
import LevelsPanel from './panels/LevelsPanel';
import ExercisesPanel from './panels/ExercisesPanel';

export default function CourseManagement() {
  const [activePanel, setActivePanel] = useState('categories');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile

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
    { id: 'categories', label: 'Catégories', icon: FiGrid },
    { id: 'paths', label: 'Parcours', icon: FiMap },
    { id: 'levels', label: 'Niveaux', icon: FiLayers },
    { id: 'exercises', label: 'Exercices', icon: FiActivity },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Brand */}
          <div className="p-6 flex items-center gap-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
              CG
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">Course Admin</h1>
              <p className="text-xs text-gray-500 font-medium">Gestion du contenu</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="p-4 m-4 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Astuce Pro</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Utilisez la recherche globale pour trouver rapidement n'importe quel contenu.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {navItems.find(i => i.id === activePanel)?.label}
              </h2>
              <p className="text-sm text-gray-500 hidden sm:block">Gérer le contenu de la plateforme</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
                readOnly
              />
            </div>
            <button
              onClick={() => openCreateFor(activePanel)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm shadow-indigo-200 transition-all hover:shadow-md active:scale-95"
            >
              <FiPlus size={18} />
              <span className="hidden sm:inline">Nouveau</span>
            </button>
          </div>
        </header>

        {/* Panel Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[calc(100vh-140px)]">
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
          </div>
        </div>
      </main>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}