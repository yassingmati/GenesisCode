import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import ExerciseAnswerInterface from '../../components/ExerciseAnswerInterface';
import ExerciseHeader from '../../components/ui/ExerciseHeader';
import CourseAccessGuard from '../../components/CourseAccessGuard';
import { getApiUrl } from '../../utils/apiConfig';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import {
  Button, Select, SelectItem, Card, CardBody,
  Divider, Chip, Tooltip, Progress, ScrollShadow, Spinner,
  Modal, ModalContent, ModalBody, ModalHeader, useDisclosure
} from "@nextui-org/react";
import {
  IconArrowLeft, IconArrowRight, IconPlayerPlay, IconPlayerPause,
  IconFileText, IconPrinter, IconLink, IconList,
  IconCheck, IconX
} from '@tabler/icons-react';

const API_BASE = getApiUrl('/api/courses');
const PROXY_FILE = `${API_BASE}/proxyFile`;
const PROXY_VIDEO = `${API_BASE}/proxyVideo`;
const LANGS = [{ code: 'fr', label: 'Français', flag: '🇫🇷' }, { code: 'en', label: 'English', flag: '🇺🇸' }, { code: 'ar', label: 'العربية', flag: '🇸🇦' }];

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

// Configure PDF worker using CDN to avoid local file serving issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

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

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  // Video state
  const [videoEffectiveUrl, setVideoEffectiveUrl] = useState(null);
  const [isCompactLayout, setIsCompactLayout] = useState(() => window.innerWidth <= 1024);

  // Video controls
  const videoRef = useRef(null);
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

  // Responsive
  useEffect(() => {
    const onResize = () => setIsCompactLayout(window.innerWidth <= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  // Exercise Logic
  const loadExercises = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/levels/${levelId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setExercises(data.exercises || []);
      }
    } catch (e) { console.error(e); }
  }, [levelId]);

  useEffect(() => { if (levelId) loadExercises(); }, [levelId, loadExercises]);

  const submitExercise = async (exerciseId, answer, extraData = {}) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/exercises/${exerciseId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ answer, userId: localStorage.getItem('userId'), ...extraData })
      });
      const result = await res.json();
      setSubmissionResult(result);
      setCompletedExercises(prev => ({ ...prev, [exerciseId]: { completed: result.correct, pointsEarned: result.pointsEarned, pointsMax: result.pointsMax } }));
    } catch (e) { setExerciseError(e.message); }
    finally { setIsSubmitting(false); }
  };

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
        <div className={`grid ${showExercises ? 'grid-cols-1 lg:grid-cols-2' : (isCompactLayout ? 'grid-cols-1' : 'grid-cols-[1fr_400px]')} gap-8 h-[calc(100vh-300px)] min-h-[600px]`}>

          {/* PDF Viewer Area */}
          <Card className="h-full shadow-md border-none overflow-hidden">
            <CardBody className="p-0 h-full bg-gray-100 flex flex-col items-center justify-center relative">
              {pdfEffectiveUrl ? (
                <div className="w-full h-full overflow-auto flex justify-center p-4">
                  <Document
                    file={pdfEffectiveUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size="lg" color="primary" />
                        <p className="text-gray-500">Chargement du PDF...</p>
                      </div>
                    }
                    error={
                      <div className="flex flex-col items-center gap-2 text-danger">
                        <IconFileText size={48} />
                        <p>Impossible de charger le PDF.</p>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => window.open(pdfEffectiveUrl, '_blank')}
                        >
                          Ouvrir dans un nouvel onglet
                        </Button>
                      </div>
                    }
                    className="max-w-full"
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={isCompactLayout ? window.innerWidth - 40 : undefined}
                      scale={isCompactLayout ? 1 : 1.2}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>

                  {numPages && numPages > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-lg rounded-full px-4 py-2 flex items-center gap-4 z-10">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        isDisabled={pageNumber <= 1}
                        onPress={() => setPageNumber(prev => prev - 1)}
                      >
                        <IconArrowLeft size={16} />
                      </Button>
                      <span className="text-sm font-medium">
                        {pageNumber} / {numPages}
                      </span>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        isDisabled={pageNumber >= numPages}
                        onPress={() => setPageNumber(prev => prev + 1)}
                      >
                        <IconArrowRight size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <IconFileText size={64} className="mb-4 opacity-50" />
                  <p>Aucun PDF disponible pour ce niveau</p>
                </div>
              )}

              {isCompactLayout && (
                <Button
                  isIconOnly
                  color="secondary"
                  className="absolute top-4 right-4 shadow-lg z-50"
                  onPress={onVideoOpen}
                >
                  <IconPlayerPlay />
                </Button>
              )}
            </CardBody>
          </Card>

          {/* Sidebar (Video + Controls) */}
          {!isCompactLayout && (
            <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
              {/* Video Player */}
              <Card className="bg-black border-none shadow-lg aspect-video flex-shrink-0">
                <CardBody className="p-0 overflow-hidden relative group h-full">
                  {videoEffectiveUrl ? (
                    <>
                      <video
                        ref={videoRef}
                        src={videoEffectiveUrl}
                        className="w-full h-full object-contain"
                        onClick={togglePlay}
                      />
                      {!isPlaying && (
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-opacity"
                          onClick={togglePlay}
                        >
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:scale-110 transition-transform">
                            <IconPlayerPlay size={32} className="text-white ml-1" />
                          </div>
                        </div>
                      )}

                      {/* Controls Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 mb-2">
                          <Button isIconOnly size="sm" variant="light" className="text-white" onPress={togglePlay}>
                            {isPlaying ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
                          </Button>
                          <Progress
                            size="sm"
                            value={(progress / duration) * 100 || 0}
                            color="primary"
                            className="cursor-pointer"
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const percent = (e.clientX - rect.left) / rect.width;
                              handleSeek(percent * 100);
                            }}
                          />
                          <span className="text-tiny text-white font-mono">
                            {Math.floor(progress / 60)}:{String(Math.floor(progress % 60)).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Vidéo non disponible</p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Navigation & Actions */}
              <Card className="flex-shrink-0 shadow-sm">
                <CardBody className="gap-3 p-5">
                  <h3 className="font-bold text-lg text-gray-800">Actions</h3>
                  <div className="flex flex-col gap-3">
                    <Button
                      color={showExercises ? "danger" : "success"}
                      variant="shadow"
                      className="w-full font-semibold text-white"
                      startContent={showExercises ? <IconX size={18} /> : <IconList size={18} />}
                      onPress={() => navigate(`/courses/levels/${levelId}/exercises`)}
                    >
                      Afficher les exercices
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant="flat"
                        startContent={<IconArrowLeft size={18} />}
                        onPress={() => navigate(-1)}
                      >
                        Précédent
                      </Button>
                      <Button
                        className="flex-1"
                        color="primary"
                        endContent={<IconArrowRight size={18} />}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Quick Actions */}
              <div className="flex gap-2 justify-center mt-auto">
                <Tooltip content="Imprimer">
                  <Button isIconOnly variant="light" onPress={() => window.print()}>
                    <IconPrinter size={20} className="text-gray-500" />
                  </Button>
                </Tooltip>
                <Tooltip content="Copier le lien">
                  <Button isIconOnly variant="light" onPress={() => navigator.clipboard.writeText(window.location.href)}>
                    <IconLink size={20} className="text-gray-500" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Exercises Panel (conditionally rendered) */}
          {showExercises && (
            <Card className="h-full shadow-lg border-none">
              <CardBody className="p-0 h-full">
                <ScrollShadow className="h-full p-6">
                  {!activeExercise ? (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold mb-6 text-gray-800">Exercices</h2>
                      <div className="grid grid-cols-1 gap-3">
                        {exercises.map((ex, idx) => (
                          <Card
                            key={ex._id}
                            isPressable
                            onPress={() => setActiveExercise(ex)}
                            className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${completedExercises[ex._id]?.completed ? 'border-l-success' : 'border-l-primary'}`}
                          >
                            <CardBody className="flex flex-row items-center justify-between p-4">
                              <div className="flex items-center gap-3">
                                <Chip size="sm" variant="flat" color="primary">{idx + 1}</Chip>
                                <span className="font-semibold text-gray-700">{ex.name}</span>
                              </div>
                              {completedExercises[ex._id]?.completed && (
                                <IconCheck className="text-success" size={20} />
                              )}
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                      <Button
                        className="w-full mt-6"
                        color="secondary"
                        variant="flat"
                        onPress={() => navigate(`/courses/levels/${levelId}/exercises`)}
                      >
                        Mode plein écran
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <Button
                        variant="light"
                        startContent={<IconArrowLeft size={18} />}
                        className="self-start mb-4"
                        onPress={() => setActiveExercise(null)}
                      >
                        Retour à la liste
                      </Button>

                      <div className="flex-1">
                        <ExerciseHeader
                          title={activeExercise.name}
                          difficulty={activeExercise.difficulty}
                          points={activeExercise.points}
                          type={activeExercise.type}
                          timeLimit={activeExercise.timeLimit}
                        />
                        <Divider className="my-4" />
                        <ExerciseAnswerInterface
                          exercise={activeExercise}
                          answer={userAnswer}
                          onAnswer={setUserAnswer}
                          onSubmit={() => submitExercise(activeExercise._id, userAnswer)}
                          isSubmitting={isSubmitting}
                          submissionResult={submissionResult}
                          error={exerciseError}
                        />
                      </div>
                    </div>
                  )}
                </ScrollShadow>
              </CardBody>
            </Card>
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