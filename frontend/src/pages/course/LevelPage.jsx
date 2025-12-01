import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import CourseAccessGuard from '../../components/CourseAccessGuard';
import { getApiUrl } from '../../utils/apiConfig';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
  Button, Select, SelectItem, Card, CardBody,
  Divider, Chip, Tooltip, Spinner,
  Modal, ModalContent, ModalBody, ModalHeader, useDisclosure
} from "@nextui-org/react";
import {
  IconArrowLeft, IconArrowRight, IconPlayerPlay,
  IconFileText, IconPrinter, IconLink
} from '@tabler/icons-react';

import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF worker using CDN to avoid local file serving issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const API_BASE = getApiUrl('/api/courses');
const LANGS = [{ code: 'fr', label: 'Français', flag: '🇫🇷' }, { code: 'en', label: 'English', flag: '🇺🇸' }, { code: 'ar', label: 'العربية', flag: '🇸🇦' }];

// Helper functions
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

export default function LevelPage() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isOpen: isVideoOpen, onOpen: onVideoOpen, onOpenChange: onVideoOpenChange } = useDisclosure();

  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pathInfo, setPathInfo] = useState(null);
  const [lang, setLang] = useState('fr');

  // PDF state
  const [pdfEffectiveUrl, setPdfEffectiveUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfContainerWidth, setPdfContainerWidth] = useState(null);
  const pdfContainerRef = useRef(null);

  // Resize observer for PDF container
  useEffect(() => {
    if (!pdfContainerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setPdfContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(pdfContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  // Video state
  const [videoEffectiveUrl, setVideoEffectiveUrl] = useState(null);
  const [isCompactLayout, setIsCompactLayout] = useState(() => window.innerWidth <= 1024);

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
        if (l.path && l.path._id) {
          setPathInfo({ _id: l.path._id, name: l.path.translations?.[lang]?.name || l.path.translations?.fr?.name || 'Parcours' });
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

  // Responsive
  useEffect(() => {
    const onResize = () => setIsCompactLayout(window.innerWidth <= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const levelTitle = level?.translations?.[lang]?.title || level?.translations?.fr?.title || 'Niveau';
  const pathName = pathInfo?.name || 'Parcours';

  return (
    <CourseAccessGuard pathId={level?.path?._id || pathInfo?._id} levelId={levelId}>
      <ClientPageLayout
        title={levelTitle}
        subtitle={`Cours et exercices pour maîtriser ce niveau.`}
        breadcrumbs={[]}
        loading={loading}
        error={error}
        onRetry={() => window.location.reload()}
        backPath={-1}
        backLabel="Retour"
        heroContent={
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <Select
              className="w-40"
              selectedKeys={[lang]}
              onChange={(e) => setLang(e.target.value)}
              size="sm"
              classNames={{
                trigger: "bg-white/20 backdrop-blur-md text-white",
                value: "text-white group-data-[has-value=true]:text-white"
              }}
            >
              {LANGS.map(l => <SelectItem key={l.code} value={l.code} startContent={<span>{l.flag}</span>}>{l.label}</SelectItem>)}
            </Select>
            <Button
              color="primary"
              variant="flat"
              className="bg-white/20 text-white backdrop-blur-md"
              startContent={<IconFileText size={18} />}
              onPress={() => pdfEffectiveUrl && window.open(pdfEffectiveUrl, '_blank')}
            >
              Ouvrir PDF
            </Button>
          </div>
        }
      >
        <div className={`grid ${isCompactLayout ? 'grid-cols-1' : 'grid-cols-[1fr_400px]'} gap-6 h-[calc(100vh-140px)] min-h-[600px] p-4`}>

          {/* PDF Viewer Area - Left Column */}
          <Card className="h-full shadow-lg border-none overflow-hidden bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <CardBody className="p-0 h-full relative group">
              {pdfEffectiveUrl ? (
                <div className="w-full h-full overflow-hidden relative flex flex-col" ref={pdfContainerRef}>
                  <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900/50 custom-scrollbar">
                    <Document
                      file={pdfEffectiveUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                          <Spinner size="lg" color="primary" />
                          <p className="text-gray-500 font-medium animate-pulse">Chargement du document...</p>
                        </div>
                      }
                      error={
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-danger p-6 text-center">
                          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-2">
                            <IconFileText size={32} />
                          </div>
                          <h3 className="text-lg font-bold">Impossible de charger le PDF</h3>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => window.open(pdfEffectiveUrl, '_blank')}
                            startContent={<IconLink size={16} />}
                          >
                            Ouvrir dans un nouvel onglet
                          </Button>
                        </div>
                      }
                      className="flex flex-col items-center min-h-full"
                    >
                      <Page
                        pageNumber={pageNumber}
                        width={pdfContainerWidth ? pdfContainerWidth : undefined}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-sm"
                      />
                    </Document>
                  </div>

                  {/* Floating PDF Controls */}
                  {numPages && numPages > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white shadow-2xl rounded-full px-4 py-2 flex items-center gap-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-white hover:bg-white/20 rounded-full"
                        isDisabled={pageNumber <= 1}
                        onPress={() => setPageNumber(prev => prev - 1)}
                      >
                        <IconArrowLeft size={18} />
                      </Button>
                      <span className="text-sm font-bold font-mono">
                        {pageNumber} / {numPages}
                      </span>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-white hover:bg-white/20 rounded-full"
                        isDisabled={pageNumber >= numPages}
                        onPress={() => setPageNumber(prev => prev + 1)}
                      >
                        <IconArrowRight size={18} />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <IconFileText size={48} className="opacity-20" />
                  </div>
                  <p className="font-medium text-lg">Aucun document disponible</p>
                </div>
              )}

              {/* Mobile Video Toggle */}
              {isCompactLayout && videoEffectiveUrl && (
                <Button
                  isIconOnly
                  color="primary"
                  size="lg"
                  className="absolute top-4 right-4 shadow-xl z-50 rounded-full animate-bounce-slow"
                  onPress={onVideoOpen}
                >
                  <IconPlayerPlay size={24} />
                </Button>
              )}
            </CardBody>
          </Card>

          {/* Sidebar (Video + Controls) - Right Column */}
          {!isCompactLayout && (
            <div className="flex flex-col gap-6 h-full overflow-y-auto pr-1 custom-scrollbar">

              {/* Standard Video Player */}
              <Card className="bg-black border-none shadow-xl aspect-video flex-shrink-0 overflow-hidden rounded-xl">
                <CardBody className="p-0 overflow-hidden h-full bg-black flex items-center justify-center">
                  {videoEffectiveUrl ? (
                    <video
                      src={videoEffectiveUrl}
                      controls
                      className="w-full h-full object-contain"
                      controlsList="nodownload"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <IconPlayerPlay size={40} className="mb-2 opacity-20" />
                      <p className="text-xs font-medium opacity-50">Vidéo non disponible</p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Actions Panel */}
              <Card className="flex-shrink-0 shadow-md border-none bg-white dark:bg-gray-800">
                <CardBody className="gap-4 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-gray-800 dark:text-white">Navigation</h3>
                    <Chip size="sm" variant="flat" color="primary" className="text-xs">Niveau {level?.order || 1}</Chip>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      color="primary"
                      variant="shadow"
                      className="w-full font-medium"
                      endContent={<IconArrowRight size={18} />}
                      onPress={() => navigate(`/courses/levels/${levelId}/exercises`)}
                    >
                      Suivant
                    </Button>

                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="flat"
                        className="w-full"
                        size="sm"
                        startContent={<IconArrowLeft size={16} />}
                        onPress={() => navigate(-1)}
                      >
                        Précédent
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Quick Tools */}
              <div className="flex gap-2 justify-center mt-auto p-3 bg-white/50 backdrop-blur-sm rounded-xl dark:bg-gray-800/50">
                <Tooltip content="Imprimer">
                  <Button isIconOnly size="sm" variant="light" onPress={() => window.print()}>
                    <IconPrinter size={18} className="text-gray-600 dark:text-gray-300" />
                  </Button>
                </Tooltip>
                <Tooltip content="Lien">
                  <Button isIconOnly size="sm" variant="light" onPress={() => navigator.clipboard.writeText(window.location.href)}>
                    <IconLink size={18} className="text-gray-600 dark:text-gray-300" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          )}
        </div>

        {/* Video Modal for Compact Layout */}
        <Modal isOpen={isVideoOpen} onOpenChange={onVideoOpenChange} size="5xl" backdrop="blur">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Vidéo du cours</ModalHeader>
                <ModalBody className="p-0 aspect-video bg-black">
                  {videoEffectiveUrl && (
                    <video
                      src={videoEffectiveUrl}
                      controls
                      className="w-full h-full"
                    />
                  )}
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </ClientPageLayout>
    </CourseAccessGuard>
  );
}