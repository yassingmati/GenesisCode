import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import ExerciseAnswerInterface from '../../components/ExerciseAnswerInterface';
import ExerciseHeader from '../../components/ui/ExerciseHeader';
import SubmissionPanel from '../../components/ui/SubmissionPanel';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import CourseAccessGuard from '../../components/CourseAccessGuard';
import './CourseStyles.css';
import '../../components/ExerciseStyles.css';

const API_BASE = 'http://localhost:5000/api/courses';
const API_ORIGIN = 'http://localhost:5000';
const PROXY_FILE = `${API_BASE}/proxyFile`;
const PROXY_VIDEO = `${API_BASE}/proxyVideo`;
const LANGS = [{ code: 'fr', label: 'Français' }, { code: 'en', label: 'English' }, { code: 'ar', label: 'العربية' }];

export default function LevelPagePdfAutoProxy() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pathInfo, setPathInfo] = useState(null);

  const [lang, setLang] = useState('fr');

  // PDF state - simplified for continuous vertical display
  const [pdfDirectUrl, setPdfDirectUrl] = useState(null);
  const [pdfEffectiveUrl, setPdfEffectiveUrl] = useState(null);
  const [pdfMode, setPdfMode] = useState(null);
  const [pdfStatusMsg, setPdfStatusMsg] = useState(null);

  // Video state
  const [videoEffectiveUrl, setVideoEffectiveUrl] = useState(null);
  const [videoStatusMsg, setVideoStatusMsg] = useState(null);
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  const [isCompactLayout, setIsCompactLayout] = useState(() => window.innerWidth <= 1024);

  const [orderedLevelIds, setOrderedLevelIds] = useState([]);

  // Video controls / UI
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Exercise states
  const [exercises, setExercises] = useState([]);
  const [activeExercise, setActiveExercise] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exerciseError, setExerciseError] = useState(null);
  const [showExercises, setShowExercises] = useState(false);
  const [completedExercises, setCompletedExercises] = useState({});

  // Load level metadata
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/levels/${levelId}`);
        if (!res.ok) throw new Error('Niveau introuvable');
        const l = await res.json();

        // Normalize urls
        const vids = {};
        const pdfs = {};
        if (l.videos) {
          for (const k of ['fr','en','ar']) {
            if (l.videos[k]) vids[k] = l.videos[k].startsWith('http') ? l.videos[k] : `${API_ORIGIN}${l.videos[k]}`;
          }
        }
        if (l.pdfs) {
          for (const k of ['fr','en','ar']) {
            if (l.pdfs[k]) pdfs[k] = l.pdfs[k].startsWith('http') ? l.pdfs[k] : `${API_ORIGIN}${l.pdfs[k]}`;
          }
        }
        l.videos = vids;
        l.pdfs = pdfs;

        if (!mounted) return;
        setLevel(l);
        
        // Récupérer les informations du parcours
        console.log('Level data:', l);
        console.log('Path data:', l.path);
        
        if (l.path && l.path._id) {
          // Si le parcours est déjà inclus dans les données du niveau
          setPathInfo({
            _id: l.path._id,
            name: l.path.translations?.[lang]?.name || l.path.translations?.fr?.name || 'Parcours'
          });
        } else if (l.path && typeof l.path === 'string') {
          // Si l.path est un ID de parcours (string)
          try {
            const pathRes = await fetch(`${API_BASE}/paths/${l.path}`);
            if (pathRes.ok) {
              const pathData = await pathRes.json();
              setPathInfo({
                _id: pathData._id,
                name: pathData.translations?.[lang]?.name || pathData.translations?.fr?.name || 'Parcours'
              });
            } else {
              throw new Error('Path not found');
            }
          } catch (pathErr) {
            console.warn('Impossible de récupérer les informations du parcours:', pathErr);
            setPathInfo({
              _id: l.path || 'unknown',
              name: 'Parcours'
            });
          }
        } else {
          // Pas de parcours associé - utiliser un parcours par défaut
          console.warn('Aucun parcours associé à ce niveau, utilisation du parcours par défaut');
          setPathInfo({
            _id: 'default-path',
            name: 'Parcours par défaut'
          });
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError(err.message || 'Erreur de chargement');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Load sequence
    (async () => {
      try {
        const catsRes = await fetch(`${API_BASE}/categories`);
        const cats = await catsRes.json();
        const seq = [];
        for (const cat of cats) {
          const pRes = await fetch(`${API_BASE}/categories/${cat._id}/paths`);
          const paths = await pRes.json();
          paths.sort((a,b)=>(a.order||0)-(b.order||0));
          for (const p of paths) {
            const lvRes = await fetch(`${API_BASE}/paths/${p._id}/levels`).catch(()=>({json:()=>[]}));
            const lvls = await lvRes.json();
            lvls.sort((a,b)=>(a.order||0)-(b.order||0));
            for (const ll of lvls) seq.push(ll._id);
          }
        }
        setOrderedLevelIds(seq);
      } catch (e) {
        console.warn('cannot build sequence', e);
      }
    })();

    return ()=> mounted = false;
  }, [levelId]);

  const isBlockedByFrameHeaders = (headers) => {
    try {
      const xfo = headers.get('x-frame-options');
      if (xfo) {
        const v = xfo.toLowerCase();
        if (v.includes('deny') || v.includes('sameorigin')) return true;
      }
      const csp = headers.get('content-security-policy');
      if (csp) {
        const m = /frame-ancestors\s+([^;]+)/i.exec(csp);
        if (m && m[1]) {
          const fa = m[1].trim();
          if (fa === "'none'") return true;
          const origin = window.location.origin;
          if (!fa.includes("'self'") && !fa.includes(origin)) return true;
        }
      }
    } catch (e) {}
    return false;
  };

  // PDF probe - MODIFIÉ pour supprimer l'espace entre les pages
  useEffect(() => {
    setPdfDirectUrl(null);
    setPdfEffectiveUrl(null);
    setPdfMode(null);
    setPdfStatusMsg(null);

    if (!level) return;
    const candidate = level.pdfs?.[lang] ?? null;
    if (!candidate) return;

    let cancelled = false;

    const probe = async () => {
      if (window.location.protocol === 'https:' && candidate.startsWith('http:')) {
        const proxyUrl = `${PROXY_FILE}?url=${encodeURIComponent(candidate)}`;
        if (!cancelled) {
          setPdfDirectUrl(candidate);
          // Paramètres modifiés pour supprimer l'espace entre les pages
          setPdfEffectiveUrl(`${proxyUrl}#toolbar=0&scroll=continuous&view=FitH`);
          setPdfMode('proxy');
          setPdfStatusMsg('Affichage via proxy');
        }
        return;
      }

      try {
        const head = await fetch(candidate, { method: 'HEAD' });
        if (!head.ok) {
          const proxyUrl = `${PROXY_FILE}?url=${encodeURIComponent(candidate)}`;
          if (!cancelled) {
            setPdfDirectUrl(candidate);
            setPdfEffectiveUrl(`${proxyUrl}#toolbar=0&scroll=continuous&view=FitH`);
            setPdfMode('proxy');
            setPdfStatusMsg('Affichage via proxy');
          }
          return;
        }

        if (isBlockedByFrameHeaders(head.headers)) {
          const proxyUrl = `${PROXY_FILE}?url=${encodeURIComponent(candidate)}`;
          if (!cancelled) {
            setPdfDirectUrl(candidate);
            setPdfEffectiveUrl(`${proxyUrl}#toolbar=0&scroll=continuous&view=FitH`);
            setPdfMode('proxy');
            setPdfStatusMsg('Affichage via proxy');
          }
          return;
        }

        if (!cancelled) {
          setPdfDirectUrl(candidate);
          // Affichage direct avec défilement continu et pages fusionnées
          setPdfEffectiveUrl(`${candidate}#toolbar=0&scroll=continuous&view=FitH`);
          setPdfMode('direct');
          setPdfStatusMsg(null);
        }
      } catch (err) {
        const proxyUrl = `${PROXY_FILE}?url=${encodeURIComponent(candidate)}`;
        if (!cancelled) {
          setPdfDirectUrl(candidate);
          setPdfEffectiveUrl(`${proxyUrl}#toolbar=0&scroll=continuous&view=FitH`);
          setPdfMode('proxy');
          setPdfStatusMsg('Affichage via proxy');
        }
      }
    };

    probe();
    return () => { cancelled = true; };
  }, [level, lang]);

  // Video probe
  useEffect(() => {
    setVideoEffectiveUrl(null);
    setVideoStatusMsg(null);
    if (!level) return;
    const candidate = level.videos?.[lang] ?? null;
    if (!candidate) return;

    let cancelled = false;
    (async () => {
      if (window.location.protocol === 'https:' && candidate.startsWith('http:')) {
        const proxyUrl = `${PROXY_VIDEO}?url=${encodeURIComponent(candidate)}`;
        if (!cancelled) {
          setVideoEffectiveUrl(proxyUrl);
          setVideoStatusMsg('Lecture via proxy');
        }
        return;
      }
      try {
        const h = await fetch(candidate, { method: 'HEAD' });
        if (h.ok) {
          if (!cancelled) {
            setVideoEffectiveUrl(candidate);
            setVideoStatusMsg(null);
          }
        } else {
          if (!cancelled) {
            const proxyUrl = `${PROXY_VIDEO}?url=${encodeURIComponent(candidate)}`;
            setVideoEffectiveUrl(proxyUrl);
            setVideoStatusMsg('Lecture via proxy');
          }
        }
      } catch (e) {
        if (!cancelled) {
          const proxyUrl = `${PROXY_VIDEO}?url=${encodeURIComponent(candidate)}`;
          setVideoEffectiveUrl(proxyUrl);
          setVideoStatusMsg('Lecture via proxy');
        }
      }
    })();
    return () => cancelled = true;
  }, [level, lang]);

  const handleVideoError = useCallback(async () => {
    if (!level) return;
    const candidate = level.videos?.[lang];
    if (!candidate) return;
    const proxyUrl = `${PROXY_VIDEO}?url=${encodeURIComponent(candidate)}`;
    if (videoEffectiveUrl !== proxyUrl) {
      setVideoEffectiveUrl(proxyUrl);
      setVideoStatusMsg('Erreur lecture → proxy');
    } else {
      setVideoStatusMsg('Erreur même via proxy');
    }
  }, [level, videoEffectiveUrl, lang]);

  // Enhanced video UI handlers
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => {
      if (v.duration && !isNaN(v.duration)) {
        setProgress(v.currentTime || 0);
        setDuration(v.duration);
      }
    };

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onTime);

    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onTime);
    };
  }, [videoEffectiveUrl]);

  // Responsive layout detection
  useEffect(() => {
    const onResize = () => setIsCompactLayout(window.innerWidth <= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(()=>{});
    else v.pause();
  };

  const seek = (e) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    v.currentTime = percent * v.duration;
  };

  const openVideoFullscreen = () => {
    const el = videoContainerRef.current || videoRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  // Navigation
  const idx = orderedLevelIds.findIndex(id => String(id) === String(levelId));
  const prevId = idx > 0 ? orderedLevelIds[idx - 1] : null;
  const nextId = idx >= 0 && idx < orderedLevelIds.length - 1 ? orderedLevelIds[idx + 1] : null;
  const openExercises = () => navigate(`/courses/levels/${levelId}/exercises`);
  
  // Load exercises for the current level
  const loadExercises = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/levels/${levelId}`);
      if (!response.ok) throw new Error('Impossible de charger les exercices');
      const data = await response.json();
      setExercises(data.exercises || []);
    } catch (err) {
      console.error('Erreur de chargement des exercices:', err);
      setExerciseError(err.message);
    }
  }, [levelId]);

  // Get user ID helper
  const getUserId = () => {
    const stored = localStorage.getItem('userId');
    if (stored) return stored;
    const newId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', newId);
    return newId;
  };

  // Submit exercise
  const submitExercise = useCallback(async (exerciseId, answer, extraData = {}) => {
    try {
      setIsSubmitting(true);
      setExerciseError(null);

      const payload = {
        answer,
        userId: getUserId(),
        ...extraData
      };

      const response = await fetch(`${API_BASE}/exercises/${exerciseId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de soumission');
      }

      const result = await response.json();
      setSubmissionResult(result);
      
      // Mark as completed locally
      const updated = { ...completedExercises };
      updated[exerciseId] = {
        completed: result.correct,
        pointsEarned: result.pointsEarned,
        pointsMax: result.pointsMax,
        xpEarned: result.xpEarned,
        completedAt: new Date().toISOString()
      };
      setCompletedExercises(updated);

      return result;
    } catch (e) {
      console.error('Erreur de soumission:', e);
      setExerciseError(e.message);
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }, [completedExercises]);

  // Handle exercise submission
  const handleSubmitExercise = useCallback(async () => {
    if (!activeExercise || (!userAnswer && activeExercise.type !== 'Code')) return;
    
    try {
      let submissionData = userAnswer;
      let extraData = {};

      // Special handling for Code exercises
      if (activeExercise.type === 'Code' && activeExercise._meta?.manualPass) {
        extraData.passed = true;
      }

      await submitExercise(activeExercise._id, submissionData, extraData);
    } catch (e) {
      // Error is already handled in submitExercise
    }
  }, [activeExercise, userAnswer, submitExercise]);

  // Handle test code
  const handleTestCode = useCallback(async (code) => {
    // Simulation of code testing
    return {
      success: true,
      message: 'Code exécuté avec succès',
      details: {
        lines: code.split('\n').length,
        language: activeExercise?.language || 'javascript'
      }
    };
  }, [activeExercise]);

  // Load exercises when level changes
  useEffect(() => {
    if (levelId) {
      loadExercises();
    }
  }, [levelId, loadExercises]);

  if (loading) return (
    <div style={{ 
      padding: 48, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: 'Inter, system-ui',
      color: '#666',
      minHeight: '100vh'
    }}>
      {t('loading')}...
    </div>
  );
  
  if (error) return (
    <div style={{ 
      padding: 48, 
      textAlign: 'center',
      fontFamily: 'Inter, system-ui',
      color: '#dc3545',
      minHeight: '100vh'
    }}>
      {error}
    </div>
  );
  
  if (!level) return (
    <div style={{ 
      padding: 48, 
      textAlign: 'center',
      fontFamily: 'Inter, system-ui',
      color: '#666',
      minHeight: '100vh'
    }}>
      {t('levelNotFound')}
    </div>
  );

  return (
    <CourseAccessGuard 
      pathId={level?.path?._id || pathInfo?._id} 
      pathName={pathInfo?.name || level?.path?.translations?.fr?.name || 'Parcours'}
      levelId={levelId}
    >
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)',
        fontFamily: 'Inter, system-ui'
      }}>
      {/* Header minimaliste */}
      <div style={{
        background: 'rgb(108, 79, 242)',
        backdropFilter: 'blur(8px)',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Logo GenesisCode */}
          <div 
            onClick={() => navigate('/dashboard')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              gap: '8px'
            }}
          >
            <div style={{ fontSize: '24px' }}>🚀</div>
            <span style={{ 
              color: 'white', 
              fontWeight: '700', 
              fontSize: '18px' 
            }}>
              GenesisCode
            </span>
            <img 
              src="/images/logo-removebg-preview.png" 
              alt="Logo" 
              style={{ 
                height: '40px',
                width: 'auto',
                filter: 'brightness(0) invert(1)'
              }}
            />
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.15rem',
            color: '#FFFFFFFF',
            fontWeight: 700
          }}>
            {level.translations?.[lang]?.title || level.translations?.fr?.title}
          </h1>
        </div>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select 
            value={lang} 
            onChange={e => setLang(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e6e9ef',
              background: 'white',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          
          <button 
            onClick={() => {
              const url = pdfMode === 'proxy' 
                ? `${PROXY_FILE}?url=${encodeURIComponent(pdfDirectUrl)}` 
                : pdfDirectUrl;
              if (url) window.open(url, '_blank', 'noopener');
            }}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
             >
               📄 {t('openPdf')}
             </button>
        </div>
      </div>

      {/* Main Content - Full screen PDF with wider sidebar for bigger video */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: showExercises ? '1fr 1fr' : (isCompactLayout ? '1fr' : '1fr 480px'),
        height: 'calc(100vh - 64px)'
      }}>
        {/* PDF Section - MODIFIÉ pour supprimer l'espace entre les pages */}
        <section style={{ 
          position: 'relative',
          background: '#fff',
          margin: 0,
          padding: 0,
          overflow: 'hidden'
        }}>
          {/* PDF Status Message - Minimal */}
          {pdfStatusMsg && (
            <div style={{ 
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(255, 193, 7, 0.95)',
              color: '#856404',
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: '0.85rem',
              zIndex: 10
            }}>
              {pdfStatusMsg}
            </div>
          )}

          {/* PDF Viewer - MODIFIÉ pour pages fusionnées sans espace */}
          <div style={{ 
            width: '100%',
            height: '100%',
            background: '#fff',
            margin: 0,
            padding: 0,
            border: 'none'
          }}>
            {!pdfEffectiveUrl ? (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#6c757d'
              }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📄</div>
                 <div style={{ fontSize: '1.1rem' }}>{t('noPdfAvailable')}</div>
                 <div style={{ fontSize: '0.9rem', marginTop: 8 }}>{t('selectOtherLanguage')}</div>
              </div>
            ) : (
              <iframe
                title="PDF Viewer"
                src={pdfEffectiveUrl}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  border: 'none',
                  display: 'block',
                  margin: 0,
                  padding: 0
                }}
              />
            )}
          </div>

          {/* Floating video button for compact layouts */}
          {isCompactLayout && (
            <button
              onClick={() => setShowVideoOverlay(true)}
              aria-label="Ouvrir la vidéo"
              style={{
                position: 'absolute',
                right: 16,
                top: 16,
                width: 56,
                height: 56,
                borderRadius: 56,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                zIndex: 20
              }}
            >
              🎬
            </button>
          )}
        </section>
        {/* Video Sidebar (hidden in compact layout; use overlay instead) */}
        {!isCompactLayout && (
        <aside style={{ 
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.95) 100%)',
          borderLeft: '1px solid rgba(15,23,42,0.06)',
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* Video Section */}
          <div>
            <div style={{ 
              fontWeight: 700, 
              marginBottom: 10,
              color: '#0f172a',
              fontSize: '0.95rem'
            }}>
               🎬 {t('video')} — {LANGS.find(l => l.code === lang)?.label}
            </div>

            <div ref={videoContainerRef} style={{ 
              background: '#000', 
              borderRadius: 12, 
              overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(15,23,42,0.08)'
            }}>
              {videoEffectiveUrl ? (
                <div style={{ position: 'relative', width: '100%', height: 360 }}>
                  <video
                    ref={videoRef}
                    key={videoEffectiveUrl}
                    src={videoEffectiveUrl}
                    controls
                    style={{ 
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      background: '#000'
                    }}
                    onError={handleVideoError}
                  />

                  {/* Play overlay when paused */}
                  {!isPlaying && (
                    <div onClick={togglePlay} style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.35))'
                    }}>
                      <div style={{
                        width: 84,
                        height: 84,
                        borderRadius: 84,
                        background: 'rgba(255,255,255,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{ fontSize: 34, color: 'white' }}>▶</div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div style={{ 
                  color: '#6c757d', 
                  textAlign: 'center',
                  padding: 36,
                  height: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                   <div style={{ fontSize: '0.95rem' }}>{t('noVideo')}</div>
                </div>
              )}
            </div>

            {videoStatusMsg && (
              <div style={{ 
                background: 'rgba(255, 193, 7, 0.1)',
                color: '#856404',
                padding: 8,
                borderRadius: 8,
                marginTop: 8,
                fontSize: '0.85rem'
              }}>
                {videoStatusMsg}
              </div>
            )}

            {/* Progress and controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <div onClick={togglePlay} style={{
                background: 'transparent',
                border: '1px solid rgba(15,23,42,0.06)',
                padding: 8,
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 700
               }}>{isPlaying ? t('pause') : t('play')}</div>

              <div onClick={openVideoFullscreen} style={{
                background: 'transparent',
                border: '1px solid rgba(15,23,42,0.06)',
                padding: 8,
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 700
               }}>
                 {t('enlargeVideo')}
               </div>

              <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#6b7280' }}>
                {duration ? `${Math.floor(progress/60)}:${String(Math.floor(progress%60)).padStart(2,'0')} / ${Math.floor(duration/60)}:${String(Math.floor(duration%60)).padStart(2,'0')}` : ''}
              </div>
            </div>

            {/* Clickable progress bar */}
            <div onClick={seek} style={{
              height: 8,
              background: 'rgba(15,23,42,0.06)',
              borderRadius: 8,
              marginTop: 8,
              cursor: 'pointer',
              overflow: 'hidden'
            }}>
              <div style={{ width: duration ? `${(progress/duration)*100}%` : '0%', height: '100%', background: 'linear-gradient(90deg,#667eea,#764ba2)' }} />
            </div>

          </div>

          {/* Navigation Section */}
          <div style={{ 
            background: 'white',
            borderRadius: 12,
            padding: 1,
            border: '1px solid rgba(15,23,42,0.04)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                {level.translations?.[lang]?.title}
              </div>
              {level.tags?.length > 0 && (
                <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
                  {level.tags.join(', ')}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button 
                onClick={() => {
                  const fromSpecific = location.state?.fromSpecific;
                  const backCategoryId = location.state?.categoryId;
                  const backPathId = location.state?.pathId;
                  if (fromSpecific && backCategoryId && backPathId) {
                    navigate(`/learning/specific/${backCategoryId}/paths/${backPathId}`);
                  } else {
                    prevId ? navigate(`/courses/levels/${prevId}`) : navigate('/courses');
                  }
                }}
                style={{
                  background: prevId ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e6e9ef',
                  color: prevId ? 'white' : '#94a3b8',
                  border: 'none',
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: prevId ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }}
              >
                 ← {t('previousLesson')}
               </button>
              
              <button 
                onClick={openExercises}
                style={{
                  background: showExercises ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #06b6d4)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }}
              >
                 📝 {showExercises ? 'Masquer' : t('exercises')} {showExercises ? '←' : '→'}
               </button>

              {nextId && (
                <button 
                  onClick={() => navigate(`/courses/levels/${nextId}`)}
                  style={{
                    background: 'linear-gradient(135deg, #fb7c2a, #ef4444)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.95rem'
                  }}
                >
                   {t('nextLesson')} →
                 </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ 
            background: 'white',
            borderRadius: 12,
            padding: 12,
            border: '1px solid rgba(15,23,42,0.04)'
          }}>
             <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.95rem', color: '#0f172a' }}>
               {t('quickActions')}
             </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button 
                onClick={() => window.print()}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(15,23,42,0.06)',
                  padding: '8px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                 🖨️ {t('print')}
               </button>
              <button 
                onClick={() => {
                  const currentUrl = window.location.href;
                  navigator.clipboard.writeText(currentUrl);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(15,23,42,0.06)',
                  padding: '8px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                 🔗 {t('copyLink')}
               </button>
            </div>
          </div>

        </aside>
        )}

        {/* Exercise Section - Only shown when showExercises is true */}
        {showExercises && (
          <section style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.95) 100%)',
            borderLeft: '1px solid rgba(15,23,42,0.06)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflow: 'auto'
          }}>
            {/* Exercise Header */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 16,
              border: '1px solid rgba(15,23,42,0.04)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#0f172a'
                }}>
                  📝 Exercices du Niveau
                </h3>
                <button
                  onClick={() => navigate(`/courses/levels/${levelId}/exercises`)}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  📋 Voir tous les exercices
                </button>
                
                <button
                  onClick={() => navigate(`/level-exercise-tester/${levelId}`)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  🔧 Tester les Exercices
                </button>
              </div>
              <div style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap'
              }}>
                {exercises.map((exercise, index) => {
                  const isCompleted = completedExercises[exercise._id]?.completed || false;
                  const progress = completedExercises[exercise._id];
                  
                  return (
                    <button
                      key={exercise._id}
                      onClick={() => {
                        // Navigation vers la page d'exercice individuel
                        navigate(`/courses/levels/${levelId}/exercises/${exercise._id}`);
                      }}
                      style={{
                        background: isCompleted 
                          ? 'linear-gradient(135deg, #10b981, #06b6d4)' 
                          : 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                    >
                      {isCompleted ? '✅' : '📝'} {exercise.name || `Exercice ${index + 1}`}
                      {progress && (
                        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                          ({progress.pointsEarned}/{progress.pointsMax})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Exercise */}
            {activeExercise && (
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 20,
                border: '1px solid rgba(15,23,42,0.04)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}>
                {/* Exercise Header */}
                <ExerciseHeader
                  title={activeExercise.name}
                  difficulty={activeExercise.difficulty}
                  points={activeExercise.points}
                  type={activeExercise.type}
                  timeLimit={activeExercise.timeLimit}
                />

                {/* Exercise Content */}
                <div style={{ flex: 1 }}>
                  <ExerciseAnswerInterface
                    exercise={activeExercise}
                    answer={userAnswer}
                    onAnswer={setUserAnswer}
                    onSubmit={handleSubmitExercise}
                    onTest={handleTestCode}
                    attempts={0}
                    maxAttempts={activeExercise.attemptsAllowed || 3}
                    isSubmitting={isSubmitting}
                    submissionResult={submissionResult}
                    error={exerciseError}
                  />
                </div>

                {/* Submission Panel */}
                <SubmissionPanel
                  onSubmit={handleSubmitExercise}
                  result={submissionResult}
                  isSubmitting={isSubmitting}
                  attemptsAllowed={activeExercise.attemptsAllowed || 3}
                  currentAttempts={0}
                  userAnswer={userAnswer}
                />

                {/* Close Exercise Button */}
                <button
                  onClick={() => {
                    setActiveExercise(null);
                    setUserAnswer(null);
                    setSubmissionResult(null);
                    setExerciseError(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(15,23,42,0.1)',
                    color: '#6b7280',
                    padding: '8px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  ✕ Fermer l'exercice
                </button>
              </div>
            )}

            {/* No Exercise Selected */}
            {!activeExercise && (
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 40,
                border: '1px solid rgba(15,23,42,0.04)',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>
                  Sélectionnez un exercice
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Cliquez sur un exercice ci-dessus pour commencer
                </p>
              </div>
            )}
          </section>
        )}
      </div>
      {/* Compact video overlay modal */}
      {isCompactLayout && showVideoOverlay && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
          onClick={() => setShowVideoOverlay(false)}
        >
          <div style={{
            width: '92vw',
            maxWidth: 800,
            aspectRatio: '16 / 9',
            background: '#000',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
          }}
            onClick={(e) => e.stopPropagation()}
          >
            {videoEffectiveUrl ? (
              <video
                ref={videoRef}
                key={videoEffectiveUrl}
                src={videoEffectiveUrl}
                controls
                style={{ width: '100%', height: '100%', display: 'block', background: '#000' }}
                onError={handleVideoError}
              />
            ) : (
              <div style={{ color: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                {t('noVideo')}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowVideoOverlay(false)}
            aria-label="Fermer la vidéo"
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: 40,
              border: 'none',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.9)',
              color: '#111827',
              fontSize: 18,
              fontWeight: 700
            }}
          >
            ✕
          </button>
        </div>
      )}
      </div>
    </CourseAccessGuard>
  );
}