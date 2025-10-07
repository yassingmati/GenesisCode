// src/pages/CourseManagement/index.jsx
import React, { useState, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Page, Sidebar, Brand, NavList, NavItem, Main, TopBar, Controls, Search, ActionPrimary, Panel } from './styles';
import { FiPlus, FiSearch } from 'react-icons/fi';
import CategoriesPanel from './panels/CategoriesPanel';
import PathsPanel from './panels/PathsPanel';
import LevelsPanel from './panels/LevelsPanel';
import ExercisesPanel from './panels/ExercisesPanel';

export default function CourseManagement() {
  const [activePanel, setActivePanel] = useState('categories');
  
  // Refs pour les callbacks de création
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

  const panelTitles = {
    categories: 'Catégories',
    paths: 'Parcours',
    levels: 'Niveaux',
    exercises: 'Exercices'
  };

  return (
    <Page>
      <Sidebar>
        <Brand>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 8, 
            background: 'linear-gradient(135deg, #2b49ee, #6f8bff)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff', 
            fontWeight: 800 
          }}>
            CG
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Course Admin</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#667' }}>Gestion des parcours & contenu</p>
          </div>
        </Brand>

        <NavList aria-label="Sections">
          <NavItem active={activePanel === 'categories'} onClick={() => setActivePanel('categories')}>
            Catégories
          </NavItem>
          <NavItem active={activePanel === 'paths'} onClick={() => setActivePanel('paths')}>
            Parcours
          </NavItem>
          <NavItem active={activePanel === 'levels'} onClick={() => setActivePanel('levels')}>
            Niveaux
          </NavItem>
          <NavItem active={activePanel === 'exercises'} onClick={() => setActivePanel('exercises')}>
            Exercices
          </NavItem>
        </NavList>

        <div style={{ marginTop: 'auto', fontSize: 13, color: '#6b7280' }}>
          <p style={{ margin: 6 }}>
            Utilise la recherche et les filtres pour trouver rapidement un élément. 
            Les edits s'ouvrent dans des modales.
          </p>
        </div>
      </Sidebar>

      <Main>
        <TopBar>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>
              {panelTitles[activePanel]}
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Gérer le contenu de la plateforme</p>
          </div>

          <Controls>
            <Search role="search">
              <FiSearch />
              <input placeholder="Rechercher par titre, question ou ID..." readOnly />
            </Search>

            <ActionPrimary onClick={() => openCreateFor(activePanel)}>
              <FiPlus /> Nouveau
            </ActionPrimary>
          </Controls>
        </TopBar>

        <Panel>
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
        </Panel>
      </Main>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </Page>
  );
}