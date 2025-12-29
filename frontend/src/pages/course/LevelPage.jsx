import React, { useEffect, useState, useRef } from 'react';
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
  IconFileText, IconPrinter, IconLink, IconList
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

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
  const pdfWrapperRef = useRef(null);

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
        ['fr', 'en', 'ar'].forEach(k => {
          if (l.videos?.[k]) {
            const videoUrl = l.videos[k];
            vids[k] = videoUrl.startsWith('http') ? videoUrl : `${API_BASE}/levels/${levelId}/video?lang=${k}`;
          }
          if (l.pdfs?.[k]) {
            const pdfUrl = l.pdfs[k];
            pdfs[k] = pdfUrl.startsWith('http') ? pdfUrl : `${API_BASE}/levels/${levelId}/pdf?lang=${k}`;
          }
        });
        if (l.video && !l.videos) {
          const videoUrl = l.video;
          vids.fr = videoUrl.startsWith('http') ? videoUrl : `${API_BASE}/levels/${levelId}/video?lang=fr`;
        }
        if (l.pdf && !l.pdfs) {
          const pdfUrl = l.pdf;
          pdfs.fr = pdfUrl.startsWith('http') ? pdfUrl : `${API_BASE}/levels/${levelId}/pdf?lang=fr`;
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

  // Handle Resize for PDF
  useEffect(() => {
    const updateWidth = debounce((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    }, 100);

    const observer = new ResizeObserver(updateWidth);
    if (pdfWrapperRef.current) observer.observe(pdfWrapperRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loading]);

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
        className="bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-950 dark:to-slate-900"
        heroContent={
          <div className="mt-6 flex flex-wrap gap-4 items-center">

            <Button
              className="bg-white/20 text-white backdrop-blur-md border border-white/20"
              startContent={<IconFileText size={18} />}
              onPress={() => pdfEffectiveUrl && window.open(pdfEffectiveUrl, '_blank')}
            >
              Ouvrir PDF
            </Button>
          </div>
        }
      >
        <div className="max-w-[1600px] mx-auto relative px-4 pb-0 h-[calc(100vh-140px)] overflow-hidden">

          {/* Background Animations */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 xl:gap-8 h-full"
          >

            {/* Main Content Area (PDF) - Order 1 on mobile, 1 on desktop */}
            <div className="flex flex-col gap-6 order-1 lg:order-1 h-full overflow-hidden">
              <Card className="h-full shadow-lg border-none bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex flex-col">
                <CardBody className="p-0 overflow-hidden relative flex-1 bg-gray-50/50 dark:bg-black/20" ref={pdfWrapperRef}>
                  {pdfEffectiveUrl ? (
                    <div className="w-full h-full overflow-y-auto overflow-x-hidden flex justify-center p-0 lg:p-6 custom-scrollbar">
                      <Document
                        file={pdfEffectiveUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                          <div className="flex flex-col items-center gap-4 mt-20">
                            <Spinner size="lg" color="primary" />
                          </div>
                        }
                        error={
                          <div className="flex flex-col items-center gap-4 mt-20 text-danger">
                            <IconFileText size={64} className="opacity-50" />
                            <p className="font-medium">Impossible d'afficher le PDF.</p>
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              onPress={() => window.open(pdfEffectiveUrl, '_blank')}
                            >
                              Ouvrir
                            </Button>
                          </div>
                        }
                        className="max-w-full shadow-xl"
                      >
                        <Page
                          pageNumber={pageNumber}
                          width={Math.min(containerWidth, 1000)}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          className="shadow-sm border border-gray-100 dark:border-gray-800"
                        />
                      </Document>

                      {numPages && numPages > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md shadow-lg rounded-full px-6 py-2 flex items-center gap-6 z-20 border border-gray-100 dark:border-gray-700">
                          <Button isIconOnly size="sm" variant="light" isDisabled={pageNumber <= 1} onPress={() => setPageNumber(prev => prev - 1)}>
                            <IconArrowLeft size={18} />
                          </Button>
                          <span className="text-sm font-semibold font-mono">
                            {pageNumber} / {numPages}
                          </span>
                          <Button isIconOnly size="sm" variant="light" isDisabled={pageNumber >= numPages} onPress={() => setPageNumber(prev => prev + 1)}>
                            <IconArrowRight size={18} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                      <IconFileText size={80} className="mb-2 opacity-20" />
                      <p className="text-lg font-medium">Aucun document</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Sidebar Area (Video + Actions) - Order 2 on mobile, 2 on desktop */}
            <div className="flex flex-col gap-6 order-2 lg:order-2 h-full overflow-y-auto custom-scrollbar pb-6">

              {/* Mobile FAB for Video */}
              {videoEffectiveUrl && (
                <div className="lg:hidden absolute top-0 right-0 z-50 m-4">
                  <Tooltip content="Voir la vidéo">
                    <Button
                      isIconOnly
                      className="bg-black/80 text-white shadow-2xl border border-white/20"
                      radius="full"
                      size="lg"
                      onPress={onVideoOpen}
                    >
                      <IconPlayerPlay size={24} fill="currentColor" />
                    </Button>
                  </Tooltip>
                </div>
              )}

              {/* 1. Desktop Video Player - Standard Native */}
              <div className="hidden lg:block">
                <Card className="bg-black border-none shadow-xl overflow-hidden rounded-xl">
                  <CardBody className="p-0 overflow-hidden relative aspect-video">
                    {videoEffectiveUrl ? (
                      <video
                        ref={videoRef}
                        src={videoEffectiveUrl}
                        className="w-full h-full object-contain"
                        controls
                        poster={level?.thumbnail}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-500 bg-zinc-900/50">
                        <IconPlayerPlay size={48} className="opacity-20 mb-2" />
                        <p className="font-medium text-sm">Vidéo non disponible</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>

              {/* Mobile Floating Video Button (Only visible on mobile if video exists) */}
              {videoEffectiveUrl && (
                <div className="lg:hidden absolute top-4 right-4 z-50">
                  <Button
                    isIconOnly
                    className="bg-black/50 backdrop-blur-md text-white border border-white/20 shadow-xl"
                    size="lg"
                    radius="full"
                    onPress={onVideoOpen}
                  >
                    <IconPlayerPlay size={24} fill="currentColor" />
                  </Button>
                </div>
              )}

              {/* 2. Actions & Navigation */}
              <Card className="shadow-lg border-none bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl">
                <CardBody className="gap-5 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-1 bg-primary rounded-full"></div>
                    <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">Navigation</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      className="w-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-medium shadow-sm"
                      variant="flat"
                      startContent={<IconArrowLeft size={18} />}
                      onPress={() => navigate(-1)}
                    >
                      Précédent
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-md shadow-primary/20"
                      endContent={<IconArrowRight size={18} />}
                      onPress={() => navigate(`/courses/levels/${levelId}/exercises`)}
                    >
                      Exercices
                    </Button>
                  </div>

                  <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex justify-center gap-4">
                    <Tooltip content="Imprimer le support">
                      <Button isIconOnly variant="light" className="text-gray-400 hover:text-primary" onPress={() => window.print()}>
                        <IconPrinter size={22} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Copier le lien permanent">
                      <Button isIconOnly variant="light" className="text-gray-400 hover:text-primary" onPress={() => {
                        navigator.clipboard.writeText(window.location.href);
                        // Could add toast here
                      }}>
                        <IconLink size={22} />
                      </Button>
                    </Tooltip>
                  </div>
                </CardBody>
              </Card>
            </div>

          </motion.div>

        </div>

        {/* Video Viewer Modal (Optional for expanding) */}
        <Modal isOpen={isVideoOpen} onOpenChange={onVideoOpenChange} size="full" backdrop="blur" classNames={{ base: "bg-black" }}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="absolute top-0 left-0 z-50 text-white bg-gradient-to-b from-black/80 to-transparent w-full">Vidéo du cours</ModalHeader>
                <ModalBody className="p-0 h-full flex items-center justify-center bg-black">
                  {videoEffectiveUrl && (
                    <video
                      src={videoEffectiveUrl}
                      controls
                      autoPlay
                      className="max-h-full max-w-full"
                    />
                  )}
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </ClientPageLayout >
    </CourseAccessGuard >
  );
}