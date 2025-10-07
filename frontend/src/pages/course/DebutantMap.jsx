import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import './CourseStyles.css';

const API_BASE = 'http://localhost:5000/api/courses';

const LANGS = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' }
];

// =========================
// COMPOSANT PRINCIPAL - CARTE DES COURS
// =========================
export default function DebutantMap() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // États de l'interface
  const { language, setLanguage, currentLanguage } = useLanguage();
  const lang = language;
  const [query, setQuery] = useState(() => localStorage.getItem('dm_q') || '');
  const [videoOnly, setVideoOnly] = useState(() => localStorage.getItem('dm_video') === '1');
  const [pdfOnly, setPdfOnly] = useState(() => localStorage.getItem('dm_pdf') === '1');
  const [activeCategory, setActiveCategory] = useState(() => localStorage.getItem('dm_cat') || null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('dm_view') || 'grid'); // grid, list, timeline

  // États des données
  const [categories, setCategories] = useState([]);
  const [pathsByCategory, setPathsByCategory] = useState({});
  const [levelsByPath, setLevelsByPath] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États de l'interface
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  // Recherche avec debounce
  const [debouncedQ, setDebouncedQ] = useState(query);
  const qTimer = useRef(null);

  // Sauvegarde des préférences (langue gérée par le contexte)
  useEffect(() => { localStorage.setItem('dm_q', query); }, [query]);
  useEffect(() => { localStorage.setItem('dm_video', videoOnly ? '1' : '0'); }, [videoOnly]);
  useEffect(() => { localStorage.setItem('dm_pdf', pdfOnly ? '1' : '0'); }, [pdfOnly]);
  useEffect(() => { localStorage.setItem('dm_cat', activeCategory || ''); }, [activeCategory]);
  useEffect(() => { localStorage.setItem('dm_view', viewMode); }, [viewMode]);

  // Debounce de la recherche
  useEffect(() => {
    if (qTimer.current) clearTimeout(qTimer.current);
    qTimer.current = setTimeout(() => setDebouncedQ((query || '').trim().toLowerCase()), 300);
    return () => clearTimeout(qTimer.current);
  }, [query]);

  // Chargement des données
  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Chargement des catégories
        const rc = await fetch(`${API_BASE}/categories`);
        if (!rc.ok) throw new Error(`Erreur catégories: ${rc.status}`);
        const cats = await rc.json();
        
        if (!mounted) return;
        setCategories(cats || []);

        // Chargement des parcours par catégorie
        const pmap = {};
        await Promise.all((cats || []).map(async (cat) => {
          try {
            const rp = await fetch(`${API_BASE}/categories/${cat._id}/paths`);
            pmap[cat._id] = rp.ok ? (await rp.json()) : [];
          } catch {
            pmap[cat._id] = [];
          }
        }));
        
        if (!mounted) return;
        setPathsByCategory(pmap);

        // Chargement des niveaux par parcours
        const allPaths = Object.values(pmap).flat();
        const lmap = {};
        await Promise.all(allPaths.map(async p => {
          try {
            const rl = await fetch(`${API_BASE}/paths/${p._id}/levels`);
            lmap[p._id] = rl.ok ? (await rl.json()) : [];
          } catch {
            lmap[p._id] = [];
          }
        }));
        
        if (!mounted) return;
        setLevelsByPath(lmap);

        // Sélection automatique de la première catégorie
        if (mounted && !activeCategory && cats && cats.length) {
          setActiveCategory(cats[0]._id);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setError(e.message || 'Erreur de chargement');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, []);

  // Fonctions utilitaires
  const hasAnyVideo = lvl => lvl && lvl.videos && Object.values(lvl.videos).some(Boolean);
  const hasAnyPdf = lvl => lvl && lvl.pdfs && Object.values(lvl.pdfs).some(Boolean);

  // Séquence des niveaux
  const seqList = useMemo(() => {
    const list = [];
    for (const c of categories) {
      const paths = (pathsByCategory[c._id] || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
      for (const p of paths) {
        const lvls = (levelsByPath[p._id] || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
        for (const l of lvls) list.push(l._id);
      }
    }
    return list;
  }, [categories, pathsByCategory, levelsByPath]);

  const seqMap = useMemo(() => {
    const m = {}; 
    let n = 1;
    for (const id of seqList) m[id] = n++;
    return m;
  }, [seqList]);

  // Filtrage des catégories
  const filteredCategories = useMemo(() => {
    const q = debouncedQ || '';
    return categories.filter(cat => {
      const paths = (pathsByCategory[cat._id] || []);
      return paths.some(path => {
        const lvls = (levelsByPath[path._id] || []);
        return lvls.some(l => {
          if (videoOnly && !hasAnyVideo(l)) return false;
          if (pdfOnly && !hasAnyPdf(l)) return false;
          if (!q) return true;
          const title = (l.translations?.[lang]?.title || l.translations?.fr?.title || '').toLowerCase();
          const pname = (path.translations?.[lang]?.name || path.translations?.fr?.name || '').toLowerCase();
          const cname = (cat.translations?.[lang]?.name || cat.translations?.fr?.name || '').toLowerCase();
          return title.includes(q) || pname.includes(q) || cname.includes(q);
        });
      });
    });
  }, [categories, pathsByCategory, levelsByPath, debouncedQ, videoOnly, pdfOnly, lang]);

  // Actions
  const openLevel = (id) => {
    if (!id) return;
    navigate(`/courses/levels/${id}`);
  };

  const resetFilters = () => {
    setQuery('');
    setVideoOnly(false);
    setPdfOnly(false);
    setActiveCategory(null);
    localStorage.removeItem('dm_q');
    localStorage.removeItem('dm_video');
    localStorage.removeItem('dm_pdf');
    localStorage.removeItem('dm_cat');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleFilters = () => setShowFilters(!showFilters);

  // Statistiques
  const stats = useMemo(() => {
    const allLevels = Object.values(levelsByPath).flat();
    return {
      totalLevels: allLevels.length,
      withVideo: allLevels.filter(hasAnyVideo).length,
      withPdf: allLevels.filter(hasAnyPdf).length,
      totalPaths: Object.values(pathsByCategory).flat().length,
      totalCategories: categories.length
    };
  }, [levelsByPath, pathsByCategory, categories]);

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="debutant-map">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="debutant-map">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="debutant-map">
      {/* Header avec contrôles */}
      <header className="map-header">
        <div className="header-left">
          <button 
            className="btn-sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Masquer la barre latérale' : 'Afficher la barre latérale'}
          >
            <span className="icon">{sidebarOpen ? '←' : '→'}</span>
          </button>
          
          <div className="brand">
            <div className="logo-container" onClick={() => navigate('/dashboard')}>
              <div className="logo-icon">🚀</div>
              <div className="logo-text">
                <h1 className="brand-title">GenesisCode</h1>
                <p className="brand-subtitle">Plateforme d'apprentissage interactive</p>
              </div>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="search-container">
           <input
               className="search-input"
             placeholder={t('search') + ' ' + t('levels') + ', ' + t('paths') + '...'}
             value={query}
             onChange={e => setQuery(e.target.value)}
             aria-label="Recherche"
           />
            <button 
              className="search-clear"
              onClick={() => setQuery('')}
              style={{ display: query ? 'block' : 'none' }}
              aria-label="Effacer la recherche"
            >
              ×
            </button>
          </div>
        </div>

        <div className="header-right">
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vue grille"
            >
              ⊞
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Vue liste"
            >
              ☰
            </button>
            <button 
              className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
              title="Vue chronologique"
            >
              ⏱️
            </button>
          </div>

          <button 
            className="btn-filters"
            onClick={toggleFilters}
            aria-label="Filtres"
          >
            <span className="icon">🔍</span>
            <span className="text">Filtres</span>
          </button>

          <select 
            className="lang-select" 
            value={lang} 
            onChange={e => setLanguage(e.target.value)} 
            aria-label="Langue"
          >
            {LANGS.map(l => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Panneau de filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="filters-panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="filters-content">
              <div className="filter-group">
                <label className="filter-label">
                  <input 
                    type="checkbox" 
                    checked={videoOnly} 
                    onChange={e => setVideoOnly(e.target.checked)} 
                  />
                  <span className="filter-text">Avec vidéo</span>
                </label>
              </div>
              
              <div className="filter-group">
                <label className="filter-label">
                  <input 
                    type="checkbox" 
                    checked={pdfOnly} 
                    onChange={e => setPdfOnly(e.target.checked)} 
                  />
                  <span className="filter-text">Avec PDF</span>
                </label>
              </div>

              <button className="btn-reset" onClick={resetFilters}>
                Réinitialiser
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu principal */}
      <div className="map-content">
        {/* Barre latérale */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside 
              className="map-sidebar"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="sidebar-content">
                 <div className="categories-section">
                   <h3 className="sidebar-title">{t('categories')}</h3>
                  <div className="categories-list">
                     <button 
                       className={`category-item ${activeCategory === null ? 'active' : ''}`}
                       onClick={() => setActiveCategory(null)}
                     >
                       <span className="category-icon">📚</span>
                       <span className="category-name">{t('all')}</span>
                     </button>
                    
              {categories.map(c => (
                <button
                  key={c._id}
                        className={`category-item ${activeCategory === c._id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(activeCategory === c._id ? null : c._id)}
                >
                        <span className="category-icon">📁</span>
                        <span className="category-name">
                  {c.translations?.[lang]?.name || c.translations?.fr?.name || 'Sans nom'}
                        </span>
                </button>
              ))}
                  </div>
            </div>

                 <div className="stats-section">
                   <h3 className="sidebar-title">{t('statistics')}</h3>
                   <div className="stats-grid">
                     <div className="stat-item">
                       <span className="stat-label">{t('levels')}</span>
                       <span className="stat-value">{stats.totalLevels}</span>
                     </div>
                     <div className="stat-item">
                       <span className="stat-label">{t('withVideo')}</span>
                       <span className="stat-value">{stats.withVideo}</span>
                     </div>
                     <div className="stat-item">
                       <span className="stat-label">{t('withPdf')}</span>
                       <span className="stat-value">{stats.withPdf}</span>
                     </div>
                     <div className="stat-item">
                       <span className="stat-label">{t('paths')}</span>
                       <span className="stat-value">{stats.totalPaths}</span>
               </div>
               </div>
             </div>

                <div className="sidebar-footer">
                  <div className="server-info">
                    <span className="server-label">Serveur:</span>
                    <code className="server-url">{API_BASE}</code>
            </div>
          </div>
            </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Contenu principal */}
        <main className={`map-main ${!sidebarOpen ? 'expanded' : ''}`}>
          {filteredCategories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>Aucun contenu trouvé</h3>
              <p>Essayez d'élargir votre recherche ou de modifier les filtres.</p>
              <button className="btn-primary" onClick={resetFilters}>
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="content-container">
              {filteredCategories.map(cat => (
                <CategorySection
                  key={cat._id}
                  category={cat}
                  paths={pathsByCategory[cat._id] || []}
                  levelsByPath={levelsByPath}
                  activeCategory={activeCategory}
                  lang={lang}
                  viewMode={viewMode}
                  openLevel={openLevel}
                  seqMap={seqMap}
                  hasAnyVideo={hasAnyVideo}
                  hasAnyPdf={hasAnyPdf}
                  debouncedQ={debouncedQ}
                  videoOnly={videoOnly}
                  pdfOnly={pdfOnly}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// =========================
// SECTION DE CATÉGORIE
// =========================
function CategorySection({ 
  category, 
  paths, 
  levelsByPath, 
  activeCategory, 
  lang, 
  viewMode, 
  openLevel, 
  seqMap, 
  hasAnyVideo, 
  hasAnyPdf, 
  debouncedQ, 
  videoOnly, 
  pdfOnly 
}) {
  if (activeCategory && activeCategory !== category._id) return null;

  return (
    <motion.section 
      className="category-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
              <div className="category-header">
        <h2 className="category-title">
          {category.translations?.[lang]?.name || category.translations?.fr?.name || 'Sans nom'}
        </h2>
        <div className="category-meta">
          {paths.length} parcours
        </div>
              </div>

      <div className="paths-container">
        {paths.map(path => {
          const lvls = (levelsByPath[path._id] || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
                  const visibleLvls = lvls.filter(l => {
                    if (videoOnly && !hasAnyVideo(l)) return false;
                    if (pdfOnly && !hasAnyPdf(l)) return false;
                    if (!debouncedQ) return true;
                    const q = debouncedQ;
                    const title = (l.translations?.[lang]?.title || l.translations?.fr?.title || '').toLowerCase();
                    const pname = (path.translations?.[lang]?.name || path.translations?.fr?.name || '').toLowerCase();
            return title.includes(q) || pname.includes(q) || (category.translations?.[lang]?.name || category.translations?.fr?.name || '').toLowerCase().includes(q);
                  });

                  if (visibleLvls.length === 0) return null;

                  return (
            <PathSection
              key={path._id}
              path={path}
              levels={visibleLvls}
              lang={lang}
              viewMode={viewMode}
              openLevel={openLevel}
              seqMap={seqMap}
              hasAnyVideo={hasAnyVideo}
              hasAnyPdf={hasAnyPdf}
            />
          );
        })}
      </div>
    </motion.section>
  );
}

// =========================
// SECTION DE PARCOURS
// =========================
function PathSection({ path, levels, lang, viewMode, openLevel, seqMap, hasAnyVideo, hasAnyPdf }) {
  return (
    <article className="path-section">
      <div className="path-header">
                      <div className="path-info">
          <h3 className="path-title">
            {path.translations?.[lang]?.name || path.translations?.fr?.name || 'Sans nom'}
          </h3>
          <div className="path-meta">
            {levels.length} niveau(s) • ordre {path.order ?? '—'}
                        </div>
                      </div>

        <button 
          className="btn-scroll-to-start"
          onClick={() => {
            const el = document.getElementById(`lvl-${path._id}-${levels[0]?._id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        >
          Aller au début
        </button>
                            </div>

      <div className={`levels-container ${viewMode}`}>
        {levels.map((lvl, index) => (
          <LevelCard
            key={lvl._id}
            level={lvl}
            pathId={path._id}
            index={index}
            seqNumber={seqMap[lvl._id]}
            lang={lang}
            viewMode={viewMode}
            openLevel={openLevel}
            hasAnyVideo={hasAnyVideo}
            hasAnyPdf={hasAnyPdf}
          />
                        ))}
                      </div>
                    </article>
  );
}

// =========================
// CARTE DE NIVEAU
// =========================
function LevelCard({ level, pathId, index, seqNumber, lang, viewMode, openLevel, hasAnyVideo, hasAnyPdf }) {
  const hasVideo = hasAnyVideo(level);
  const hasPdf = hasAnyPdf(level);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -5, scale: 1.02 }
  };

  return (
    <motion.div
      id={`lvl-${pathId}-${level._id}`}
      className={`level-card ${viewMode}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ delay: index * 0.1 }}
      onClick={() => openLevel(level._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { 
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLevel(level._id);
        }
      }}
      aria-label={`${level.translations?.[lang]?.title || level.translations?.fr?.title || 'niveau'}`}
    >
      <div className="level-header">
        <div className="level-number">
          {seqNumber || '-'}
        </div>
        <div className="level-badges">
          {hasVideo && <span className="badge video-badge">🎬</span>}
          {hasPdf && <span className="badge pdf-badge">📄</span>}
        </div>
      </div>

      <div className="level-content">
        <h4 className="level-title">
          {level.translations?.[lang]?.title || level.translations?.fr?.title || 'Sans titre'}
        </h4>
        <div className="level-meta">
          {(level.exercises || []).length} exercice(s) • ordre {level.order ?? '—'}
        </div>
      </div>

      <div className="level-actions">
        <button 
          className="btn-preview"
          onClick={(e) => { 
            e.stopPropagation(); 
            // TODO: Implémenter l'aperçu
          }}
        >
          Aperçu
        </button>
        <button 
          className="btn-start"
          onClick={(e) => { 
            e.stopPropagation(); 
            openLevel(level._id); 
          }}
        >
          Commencer
        </button>
      </div>
    </motion.div>
  );
}

export { DebutantMap };