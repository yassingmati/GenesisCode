import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import CourseAccessGuard from '../../components/CourseAccessGuard';
import { getApiUrl } from '../../utils/apiConfig';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
  Button, Select, SelectItem, Card, CardBody,
  Tooltip, Progress, Spinner,
  Modal, ModalContent, ModalBody, ModalHeader, useDisclosure
} from "@nextui-org/react";
import {
  IconArrowLeft, IconArrowRight, IconPlayerPlay, IconPlayerPause,
  IconFileText, IconPrinter, IconLink, IconList, IconMaximize, IconMinimize,
  IconClock, IconTrophy, IconSchool
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Logo from '../../assets/images/logo-removebg-preview.png';

const API_BASE = getApiUrl('/api/courses');
const LANGS = [{ code: 'fr', label: 'Français', flag: '🇫🇷' }, { code: 'en', label: 'English', flag: '🇺🇸' }, { code: 'ar', label: 'العربية', flag: '🇹🇳' }];

// Helper functions (kept from original)
async function findAccessiblePath(token) {
  try {
    const catsRes = await fetch(`${API_BASE}/categories`, { headers: { 'Authorization': `Bearer ${token}` } });
    const cats = await catsRes.json();
    for (const cat of cats) {
      const pRes = await fetch(`${API_BASE}/categories/${cat._id}/paths`, { headers: { 'Authorization': `Bearer ${token}` } });
      const paths = await pRes.json();
      if (paths && paths.length > 0) return paths[0];
    }
    return null;
  } catch (error) { return null; }
}

async function findLevelInAccessiblePaths(levelId, token) {
  try {
    const catsRes = await fetch(`${API_BASE}/categories`, { headers: { 'Authorization': `Bearer ${token}` } });
    const cats = await catsRes.json();
    for (const cat of cats) {
      const pRes = await fetch(`${API_BASE}/categories/${cat._id}/paths`, { headers: { 'Authorization': `Bearer ${token}` } });
      const paths = await pRes.json();
      for (const path of paths) {
        const lvRes = await fetch(`${API_BASE}/paths/${path._id}/levels`, { headers: { 'Authorization': `Bearer ${token}` } });
        const levels = await lvRes.json();
        const targetLevel = levels.find(level => level._id === levelId);
        if (targetLevel) return { ...targetLevel, path: { _id: path._id, name: path.name, translations: path.translations } };
      }
    }
    return null;
  } catch (error) { return null; }
}

import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function LevelPage() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation(); // Use global language
  const { isOpen: isVideoOpen, onOpen: onVideoOpen, onOpenChange: onVideoOpenChange } = useDisclosure();

  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pathInfo, setPathInfo] = useState(null);

  // Use global language for content
  const lang = language;

  // PDF state
  const [pdfEffectiveUrl, setPdfEffectiveUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);

  // Debounce helper
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // ResizeObserver for PDF container
  const onResize = useCallback(debounce((entries) => {
    if (entries && entries[0]) {
      // Use contentRect to get width excluding padding/border if box-sizing is content-box,
      // but ResizeObserver contentRect behavior with padding can be browser specific. 
      // safer is generally checking contentBoxSize or clientWidth of target
      const width = entries[0].contentRect.width;
      setContainerWidth(width);
    }
  }, 100), []);

  const resizeObserverRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const setPdfContainerRef = useCallback(node => {
    pdfContainerRef.current = node;

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (node) {
      resizeObserverRef.current = new ResizeObserver(onResize);
      resizeObserverRef.current.observe(node);
    }
  }, [onResize]);

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!pdfContainerRef.current) return;

    if (!document.fullscreenElement) {
      pdfContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  // Video state
  const [videoEffectiveUrl, setVideoEffectiveUrl] = useState(null);

  // Video controls
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Load level metadata
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        let res = await fetch(`${API_BASE}/levels/${levelId}`, { headers: { 'Authorization': `Bearer ${token}` } });

        let l;
        if (!res.ok) {
          if (res.status === 403) {
            l = await findLevelInAccessiblePaths(levelId, token);
            if (!l) throw new Error('Accès refusé - Niveau verrouillé');
          } else if (res.status === 404) throw new Error('Niveau introuvable');
          else throw new Error('Erreur lors du chargement du niveau');
        } else {
          l = await res.json();
        }

        // Normalize URLs logic
        const vids = {};
        const pdfs = {};
        // Helper to sanitize URLs
        const sanitizeUrl = (url, type) => {
          if (!url) return null;
          // If it's a localhost URL, replace with current API_BASE (without /api/courses suffix if needed)
          if (url.includes('localhost:5000')) {
            // Get base url from config, not the /api/courses one
            const baseUrl = getApiUrl('').replace(/\/$/, '');
            return url.replace('http://localhost:5000', baseUrl);
          }
          return url.startsWith('http') ? url : `${API_BASE}/levels/${levelId}/${type}?lang=${k}`;
        };

        ['fr', 'en', 'ar'].forEach(k => {
          if (l.videos?.[k]) {
            // Logic adjusted to use helper
            const videoUrl = l.videos[k];
            vids[k] = videoUrl.includes('localhost:5000')
              ? videoUrl.replace('http://localhost:5000', getApiUrl('').replace(/\/$/, ''))
              : (videoUrl.startsWith('http') ? videoUrl : `${API_BASE}/levels/${levelId}/video?lang=${k}`);
          }
          if (l.pdfs?.[k]) {
            const pdfUrl = l.pdfs[k];
            pdfs[k] = pdfUrl.includes('localhost:5000')
              ? pdfUrl.replace('http://localhost:5000', getApiUrl('').replace(/\/$/, ''))
              : (pdfUrl.startsWith('http') ? pdfUrl : `${API_BASE}/levels/${levelId}/pdf?lang=${k}`);
          }
        });
        if (l.video && !l.videos) {
          const videoUrl = l.video;
          vids.fr = videoUrl.includes('localhost:5000')
            ? videoUrl.replace('http://localhost:5000', getApiUrl('').replace(/\/$/, ''))
            : (videoUrl.startsWith('http') ? videoUrl : `${API_BASE}/levels/${levelId}/video?lang=fr`);
        }
        if (l.pdf && !l.pdfs) {
          const pdfUrl = l.pdf;
          pdfs.fr = pdfUrl.includes('localhost:5000')
            ? pdfUrl.replace('http://localhost:5000', getApiUrl('').replace(/\/$/, ''))
            : (pdfUrl.startsWith('http') ? pdfUrl : `${API_BASE}/levels/${levelId}/pdf?lang=fr`);
        }

        l.videos = vids;
        l.pdfs = pdfs;

        if (!mounted) return;
        setLevel(l);

        // Path info logic
        if (l.path) {
          const pId = typeof l.path === 'object' ? l.path._id : l.path;
          const pName = (typeof l.path === 'object' && l.path.translations)
            ? (l.path.translations?.[lang]?.name || l.path.translations?.fr?.name)
            : 'Parcours';

          setPathInfo({ _id: pId, name: pName });
        } else {
          const accessiblePath = await findAccessiblePath(token);
          setPathInfo({ _id: accessiblePath?._id || 'default', name: accessiblePath?.name || 'Parcours' });
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => mounted = false;
  }, [levelId]);

  // PDF Probe
  useEffect(() => {
    setPdfEffectiveUrl(null);
    if (!level) return;
    const candidate = level.pdfs?.[lang];
    if (!candidate) return;
    setPdfEffectiveUrl(`${candidate}#toolbar=0&scroll=continuous&view=FitH`);
  }, [level, lang]);

  // Video Probe
  useEffect(() => {
    setVideoEffectiveUrl(null);
    if (!level) return;
    const candidate = level.videos?.[lang];
    if (!candidate) return;
    setVideoEffectiveUrl(candidate);
  }, [level, lang]);

  // Video UI handlers
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => {
      if (v.duration) {
        setProgress(v.currentTime);
        setDuration(v.duration);
      }
    };
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('timeupdate', onTime);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('timeupdate', onTime);
    };
  }, [videoEffectiveUrl]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (v) v.paused ? v.play() : v.pause();
  };

  const handleSeek = (value) => {
    const v = videoRef.current;
    if (v && v.duration) {
      v.currentTime = (value / 100) * v.duration;
    }
  };

  const levelTitle = level?.translations?.[lang]?.title || level?.translations?.fr?.title || 'Niveau';
  const levelDescription = level?.translations?.[lang]?.description || level?.translations?.fr?.description || '';

  return (
    <CourseAccessGuard pathId={pathInfo?._id || (typeof level?.path === 'object' ? level?.path?._id : level?.path)} levelId={levelId}>
      <ClientPageLayout
        title={levelTitle}
        subtitle="Contenu du cours"
        breadcrumbs={[]}
        loading={loading}
        error={error}
        onRetry={() => window.location.reload()}
        backPath={-1}
        backLabel="Retour"
        className="bg-[#0a0a0c] min-h-screen"
        fullWidth={true}
        isLite={true}
      >
        <div className="max-w-[1800px] mx-auto relative px-6 lg:px-10 pb-10 min-h-[calc(100vh-80px)]">

          {/* Premium Background Elements */}
          <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-3xl opacity-30 pointer-events-none z-0" />
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] opacity-40 pointer-events-none z-0" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-10 flex flex-col gap-8 h-full"
          >
            {/* 1. New Premium Hero Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pt-8 pb-6 border-b border-white/5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/20 flex items-center gap-1">
                    <IconSchool size={14} /> Cours
                  </span>
                  {pathInfo && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 transition-colors">
                      {pathInfo.name}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                    <IconTrophy size={14} /> +50 XP
                  </span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500">
                    {levelTitle}
                  </span>
                </h1>

                {levelDescription && (
                  <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
                    {levelDescription}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg backdrop-blur-md transition-all"
                  size="lg"
                  radius="full"
                  startContent={<IconFileText size={20} className="text-primary" />}
                  onPress={() => pdfEffectiveUrl && window.open(pdfEffectiveUrl, '_blank')}
                >
                  Ouvrir PDF
                </Button>
              </div>
            </div>


            {/* 2. Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-8 h-[calc(100vh-350px)] min-h-[600px]">

              {/* PDF Viewer - Window Style */}
              <div className="h-full flex flex-col">
                <motion.div
                  className="flex-1 flex flex-col rounded-3xl overflow-hidden bg-[#1e1e24] border border-white/10 shadow-2xl relative group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  {/* Window Header */}
                  <div className="h-12 bg-[#27272a] border-b border-white/5 flex items-center justify-between px-4 select-none">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors shadow-inner" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors shadow-inner" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors shadow-inner" />
                    </div>
                    <div className="text-xs font-medium text-gray-500 flex items-center gap-2">
                      <IconFileText size={12} />
                      document_cours.pdf
                    </div>
                    <div className="w-16"></div> {/* Spacer for centering */}
                  </div>

                  {/* PDF Content */}
                  <div className="flex-1 relative overflow-hidden bg-[#18181b]" ref={setPdfContainerRef}>
                    {pdfEffectiveUrl ? (
                      <>
                        <div className="w-full h-full overflow-y-auto overflow-x-hidden flex justify-center p-6 lg:p-10 custom-scrollbar scroll-smooth">
                          <Document
                            file={pdfEffectiveUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#18181b] z-50">
                                <div className="relative">
                                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <IconFileText size={20} className="text-primary/50" />
                                  </div>
                                </div>
                                <p className="text-gray-400 font-medium tracking-wide text-sm uppercase">Chargement...</p>
                              </div>
                            }
                            error={
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#18181b] z-50 text-danger">
                                <IconFileText size={64} className="opacity-20" />
                                <p className="font-bold text-lg">Impossible d'afficher le document</p>
                                <Button size="sm" color="danger" variant="flat" onPress={() => window.open(pdfEffectiveUrl, '_blank')}>
                                  Ouvrir dans un nouvel onglet
                                </Button>
                              </div>
                            }
                            className="max-w-full"
                          >
                            <Page
                              pageNumber={pageNumber}
                              width={Math.min(Math.max(containerWidth - 90, 300), 1000)}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border border-white/5"
                            />
                          </Document>
                        </div>

                        {/* Floating Controls */}
                        {numPages && numPages > 1 && (
                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#27272a]/90 backdrop-blur-xl shadow-2xl rounded-2xl px-2 py-2 flex items-center gap-1 z-30 border border-white/10 ring-1 ring-black/50">
                            <Button isIconOnly size="sm" variant="light" className="text-gray-400 hover:text-white rounded-xl" isDisabled={pageNumber <= 1} onPress={() => setPageNumber(prev => prev - 1)}>
                              <IconArrowLeft size={18} />
                            </Button>

                            <div className="px-4 py-1 bg-black/40 rounded-lg mx-1 min-w-[80px] text-center border border-white/5">
                              <span className="text-white font-bold font-mono text-sm tracking-wider">
                                {pageNumber} <span className="text-gray-600">/</span> {numPages}
                              </span>
                            </div>

                            <Button isIconOnly size="sm" variant="light" className="text-gray-400 hover:text-white rounded-xl" isDisabled={pageNumber >= numPages} onPress={() => setPageNumber(prev => prev + 1)}>
                              <IconArrowRight size={18} />
                            </Button>

                            <div className="h-6 w-px bg-white/10 mx-2"></div>

                            <Tooltip content={isFullscreen ? "Quitter plein écran" : "Plein écran"} className="bg-black border border-white/10 text-white rounded-lg">
                              <Button isIconOnly size="sm" variant="light" className="text-gray-400 hover:text-primary rounded-xl" onPress={toggleFullscreen}>
                                {isFullscreen ? <IconMinimize size={18} /> : <IconMaximize size={18} />}
                              </Button>
                            </Tooltip>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                        <div className="text-center max-w-md p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
                          <div className="w-20 h-20 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20 rotate-3">
                            <IconClock size={40} className="text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Bientôt disponible</h3>
                          <p className="text-gray-400 leading-relaxed">Ce contenu est en cours de création. Nos experts travaillent dur pour vous offrir le meilleur.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar - Control Center Style */}
              <motion.div
                className="flex flex-col gap-6 h-full overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >

                {/* 1. Video Card */}
                <Card className="bg-[#18181b] border border-white/10 shadow-xl overflow-hidden rounded-3xl shrink-0">
                  <CardBody className="p-0 overflow-hidden relative aspect-video group cursor-pointer">
                    {videoEffectiveUrl ? (
                      <>
                        <video
                          ref={videoRef}
                          src={videoEffectiveUrl}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500"
                          poster={level?.thumbnail}
                        />
                        {!isPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors" onClick={togglePlay}>
                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                              <IconPlayerPlay size={32} className="text-white ml-1" fill="currentColor" />
                            </div>
                          </div>
                        )}
                        {/* Video Progress Bar (Visual only for now) */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                          <div className="h-full bg-primary" style={{ width: `${(progress / duration) * 100}%` }}></div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#202023] to-[#121214] flex flex-col items-center justify-center text-center p-6">
                        <IconPlayerPause size={48} className="text-white/10 mb-4" />
                        <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Vidéo Indisponible</p>
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* 2. Navigation Pod */}
                <div className="flex-1 bg-[#18181b] border border-white/10 rounded-3xl shadow-xl p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                      <IconList size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Navigation</h3>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Contrôles du chapitre</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4">
                    <Button
                      className="w-full bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 hover:text-white border border-white/5 h-14 justify-start px-4 group transition-all"
                      radius="lg"
                      onPress={() => navigate(-1)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center mr-3 group-hover:bg-white/10 transition-colors">
                        <IconArrowLeft size={16} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-gray-500">Retour</span>
                        <span className="font-semibold">Précédent</span>
                      </div>
                    </Button>

                    <Button
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 h-16 justify-between px-4 group hover:scale-[1.02] transition-transform"
                      radius="lg"
                      onPress={() => navigate(`/courses/levels/${levelId}/exercises`)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-white/60">Étape suivante</span>
                        <span className="font-bold text-lg">Exercices Pratiques</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <IconArrowRight size={20} />
                      </div>
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-3">
                    <Button className="bg-[#27272a] hover:bg-[#3f3f46] text-gray-400 border border-white/5" size="sm" startContent={<IconPrinter size={16} />} onPress={() => window.print()}>
                      Imprimer
                    </Button>
                    <Button className="bg-[#27272a] hover:bg-[#3f3f46] text-gray-400 border border-white/5" size="sm" startContent={<IconLink size={16} />} onPress={() => navigator.clipboard.writeText(window.location.href)}>
                      Copier
                    </Button>
                  </div>
                </div>

              </motion.div>

            </div>

          </motion.div>
        </div >

        {/* Video Fullscreen Modal */}
        < Modal isOpen={isVideoOpen} onOpenChange={onVideoOpenChange} size="full" backdrop="blur" classNames={{ base: "bg-black/90" }} motionProps={{
          variants: {
            enter: { opacity: 0, scale: 0.95 },
            exit: { opacity: 0, scale: 0.95 },
          }
        }}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="absolute top-0 left-0 z-50 text-white bg-gradient-to-b from-black/80 to-transparent w-full p-6">
                  <Button isIconOnly variant="light" className="text-white" onPress={onClose}>
                    <IconArrowLeft />
                  </Button>
                  <span className="ml-4 font-bold text-xl">{levelTitle} - Vidéo</span>
                </ModalHeader>
                <ModalBody className="p-0 h-full flex items-center justify-center bg-black">
                  {videoEffectiveUrl && (
                    <video
                      src={videoEffectiveUrl}
                      controls
                      autoPlay
                      className="max-h-full max-w-full shadow-2xl"
                    />
                  )}
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal >

      </ClientPageLayout >
    </CourseAccessGuard >
  );
}