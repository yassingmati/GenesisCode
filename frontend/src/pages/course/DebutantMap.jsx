import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import './CourseStyles.css';
import '../../styles/courseTheme.css';
import API_CONFIG from '../../config/api';

const API_BASE = `${API_CONFIG.BASE_URL}/api/courses`;

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
  const [previewLevel, setPreviewLevel] = useState(null);

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
        const rc = await fetch(`${API_BASE}/categories`, {
          headers: API_CONFIG.getDefaultHeaders()
        });
        if (!rc.ok) throw new Error(`Erreur catégories: ${rc.status}`);
        const cats = await rc.json();
        
        if (!mounted) return;
        setCategories(cats || []);

        // Chargement des parcours par catégorie
        const pmap = {};
        await Promise.all((cats || []).map(async (cat) => {
          try {
            const rp = await fetch(`${API_BASE}/categories/${cat._id}/paths`, {
              headers: API_CONFIG.getDefaultHeaders()
            });
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
            const rl = await fetch(`${API_BASE}/paths/${p._id}/levels`, {
              headers: API_CONFIG.getDefaultHeaders()
            });
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
    <div className="debutant-map" style={{ minHeight: '100vh', background: 'var(--bg-gradient)' }}>
      {/* Header avec contrôles */}
      <header className="map-header" style={{ 
        background: 'rgba(255,255,255,0.1)', 
        backdropFilter: 'blur(10px)', 
        borderBottom: '1px solid rgba(255,255,255,0.2)' 
      }}>
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
          <div className="container-responsive">
            {filteredCategories.length === 0 ? (
              <div className="empty-state" style={{ 
                textAlign: 'center', 
                padding: 40, 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 'var(--card-radius)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div className="empty-icon" style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3 style={{ marginBottom: 8, color: 'white' }}>Aucun contenu trouvé</h3>
                <p style={{ marginBottom: 24, opacity: 0.9 }}>Essayez d'élargir votre recherche ou de modifier les filtres.</p>
                <button className="btn-ghost" onClick={resetFilters}>
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
                    onPreview={setPreviewLevel}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal d'aperçu */}
      <AnimatePresence>
        {previewLevel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewLevel(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: 16,
                padding: 24,
                maxWidth: 600,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
                  Aperçu du niveau
                </h2>
                <button
                  onClick={() => setPreviewLevel(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 24,
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: 4,
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
                  {previewLevel.translations?.[lang]?.title || previewLevel.translations?.fr?.title || 'Sans titre'}
                </h3>
                {previewLevel.translations?.[lang]?.content && (
                  <p style={{ margin: '8px 0', color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
                    {previewLevel.translations[lang].content}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                <div style={{ 
                  background: 'rgba(79, 172, 254, 0.1)', 
                  padding: '8px 12px', 
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#4facfe',
                  fontWeight: 600
                }}>
                  📝 {(previewLevel.exercises || []).length} exercice(s)
                </div>
                {hasAnyVideo(previewLevel) && (
                  <div style={{ 
                    background: 'rgba(79, 172, 254, 0.1)', 
                    padding: '8px 12px', 
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#4facfe',
                    fontWeight: 600
                  }}>
                    🎬 Vidéo disponible
                  </div>
                )}
                {hasAnyPdf(previewLevel) && (
                  <div style={{ 
                    background: 'rgba(0, 242, 254, 0.1)', 
                    padding: '8px 12px', 
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#00f2fe',
                    fontWeight: 600
                  }}>
                    📄 PDF disponible
                  </div>
                )}
                {previewLevel.order !== undefined && (
                  <div style={{ 
                    background: 'rgba(108, 79, 242, 0.1)', 
                    padding: '8px 12px', 
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#6c4ff2',
                    fontWeight: 600
                  }}>
                    Ordre: {previewLevel.order}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => {
                    setPreviewLevel(null);
                    openLevel(previewLevel._id);
                  }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: 10,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Commencer
                </button>
                <button
                  onClick={() => setPreviewLevel(null)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb',
                    padding: '12px 24px',
                    borderRadius: 10,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  pdfOnly,
  onPreview
}) {
  if (activeCategory && activeCategory !== category._id) return null;

  return (
    <motion.section 
      className="category-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ marginBottom: 40 }}
    >
      <div className="category-header" style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: 'var(--card-radius)', 
        padding: 24, 
        marginBottom: 24,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h2 className="category-title" style={{ 
          color: 'white', 
          margin: 0, 
          fontSize: 24, 
          fontWeight: 700 
        }}>
          {category.translations?.[lang]?.name || category.translations?.fr?.name || 'Sans nom'}
        </h2>
        <div className="category-meta" style={{ 
          color: 'rgba(255,255,255,0.8)', 
          fontSize: 14, 
          marginTop: 4 
        }}>
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
              onPreview={onPreview}
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
function PathSection({ path, levels, lang, viewMode, openLevel, seqMap, hasAnyVideo, hasAnyPdf, onPreview }) {
  return (
    <article className="path-section" style={{ marginBottom: 32 }}>
      <div className="path-header" style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: 'var(--card-radius)', 
        padding: 20, 
        marginBottom: 20,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="path-info">
          <h3 className="path-title" style={{ 
            color: 'white', 
            margin: 0, 
            fontSize: 18, 
            fontWeight: 600 
          }}>
            {path.translations?.[lang]?.name || path.translations?.fr?.name || 'Sans nom'}
          </h3>
          <div className="path-meta" style={{ 
            color: 'rgba(255,255,255,0.8)', 
            fontSize: 14, 
            marginTop: 4 
          }}>
            {levels.length} niveau(s) • ordre {path.order ?? '—'}
          </div>
        </div>

        <button 
          className="btn-ghost"
          onClick={() => {
            const el = document.getElementById(`lvl-${path._id}-${levels[0]?._id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        >
          Aller au début
        </button>
      </div>

      <div className={`levels-container ${viewMode}`} style={{ 
        display: 'grid', 
        gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: 20 
      }}>
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
            onPreview={onPreview}
          />
                        ))}
                      </div>
                    </article>
  );
}

// =========================
// CARTE DE NIVEAU
// =========================
function LevelCard({ level, pathId, index, seqNumber, lang, viewMode, openLevel, hasAnyVideo, hasAnyPdf, onPreview }) {
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
      className={`level-card ${viewMode} card-surface`}
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
      style={{ 
        padding: 20, 
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="level-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
      }}>
        <div className="level-number" style={{ 
          background: 'linear-gradient(135deg, #4facfe, #00f2fe)', 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: 20, 
          fontSize: 14, 
          fontWeight: 700 
        }}>
          {seqNumber || '-'}
        </div>
        <div className="level-badges" style={{ display: 'flex', gap: 8 }}>
          {hasVideo && <span className="badge video-badge" style={{ 
            background: 'rgba(79, 172, 254, 0.1)', 
            color: '#4facfe', 
            padding: '4px 8px', 
            borderRadius: 12, 
            fontSize: 12, 
            fontWeight: 600 
          }}>🎬</span>}
          {hasPdf && <span className="badge pdf-badge" style={{ 
            background: 'rgba(0, 242, 254, 0.1)', 
            color: '#00f2fe', 
            padding: '4px 8px', 
            borderRadius: 12, 
            fontSize: 12, 
            fontWeight: 600 
          }}>📄</span>}
        </div>
      </div>

      <div className="level-content" style={{ marginBottom: 16 }}>
        <h4 className="level-title" style={{ 
          color: 'var(--text-primary)', 
          margin: '0 0 8px 0', 
          fontSize: 16, 
          fontWeight: 600 
        }}>
          {level.translations?.[lang]?.title || level.translations?.fr?.title || 'Sans titre'}
        </h4>
        <div className="level-meta" style={{ 
          color: 'var(--text-muted)', 
          fontSize: 14 
        }}>
          {(level.exercises || []).length} exercice(s) • ordre {level.order ?? '—'}
        </div>
      </div>

      <div className="level-actions" style={{ display: 'flex', gap: 8 }}>
        <button 
          className="btn-ghost"
          onClick={(e) => { 
            e.stopPropagation(); 
            if (onPreview) onPreview(level);
          }}
          style={{ flex: 1, fontSize: 14 }}
        >
          Aperçu
        </button>
        <button 
          className="btn-ghost"
          onClick={(e) => { 
            e.stopPropagation(); 
            openLevel(level._id); 
          }}
          style={{ 
            flex: 1, 
            fontSize: 14, 
            background: 'linear-gradient(135deg, #4facfe, #00f2fe)', 
            color: 'white',
            border: 'none'
          }}
        >
          Commencer
        </button>
      </div>
    </motion.div>
  );
}

export { DebutantMap };