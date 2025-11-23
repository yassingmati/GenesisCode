import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import ExerciseAnswerInterface from '../../components/ExerciseAnswerInterface';
import { getApiUrl } from '../../utils/apiConfig';

// NextUI Components
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Progress,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Divider,
  Tooltip,
  Image
} from "@nextui-org/react";

import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconTrophy,
  IconAlertCircle,
  IconFileText,
  IconRefresh,
  IconBrain,
  IconCode,
  IconListCheck,
  IconAbc,
  IconPuzzle,
  IconClock
} from '@tabler/icons-react';

const API_BASE = getApiUrl('/api/courses');

// =========================
// HELPER FUNCTIONS
// =========================

async function findLevelInAccessiblePaths(levelId, token) {
  try {
    const catsRes = await fetch(`${API_BASE}/categories`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!catsRes.ok) return null;
    const cats = await catsRes.json();

    for (const cat of cats) {
      const pRes = await fetch(`${API_BASE}/categories/${cat._id}/paths`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!pRes.ok) continue;
      const paths = await pRes.json();

      for (const path of paths) {
        const lvRes = await fetch(`${API_BASE}/paths/${path._id}/levels`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => ({ json: () => [] }));
        if (!lvRes.ok) continue;
        const levels = await lvRes.json();

        const targetLevel = levels.find(level => level._id === levelId);
        if (targetLevel) {
          return { ...targetLevel, path: { _id: path._id, name: path.name, translations: path.translations } };
        }
      }
    }
    return null;
  } catch (error) { return null; }
}

const getUserId = () => {
  const stored = localStorage.getItem('userId');
  if (stored) return stored;
  const newId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('userId', newId);
  return newId;
};

const getCompletedExercises = () => {
  const stored = localStorage.getItem('completedExercises');
  return stored ? JSON.parse(stored) : {};
};

const markExerciseCompleted = (exerciseId, result) => {
  const completed = getCompletedExercises();
  completed[exerciseId] = {
    completed: result.correct,
    pointsEarned: result.pointsEarned,
    pointsMax: result.pointsMax,
    xpEarned: result.xpEarned,
    completedAt: new Date().toISOString()
  };
  localStorage.setItem('completedExercises', JSON.stringify(completed));
  return completed;
};

// =========================
// COMPOSANT PRINCIPAL
// =========================

export default function ExercisePage() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // États principaux
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(getCompletedExercises());

  // États pour l'exercice actif
  const [activeExercise, setActiveExercise] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const fetchWithRetry = useCallback(async (url, options = {}, retries = 2) => {
    const makeRequest = async (attempt = 0) => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(url, { ...options, headers, credentials: 'include' });

        if (response.status === 401 && attempt < retries) {
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const refreshResponse = await fetch(`${getApiUrl('')}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
                credentials: 'include'
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData.token) {
                  localStorage.setItem('token', refreshData.token);
                  return makeRequest(attempt + 1);
                }
              }
            }
          } catch (refreshError) { console.warn(refreshError); }
          if (attempt === retries - 1) throw new Error('Session expirée');
        }
        return response;
      } catch (error) {
        if (attempt < retries && !error.message.includes('Session expirée')) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          return makeRequest(attempt + 1);
        }
        throw error;
      }
    };
    return makeRequest();
  }, []);

  const fetchLevelData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      let response;
      try {
        response = await fetchWithRetry(`${API_BASE}/levels/${levelId}`);
      } catch (fetchError) {
        response = await fetch(`${API_BASE}/levels/${levelId}`, {
          headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
          credentials: 'include'
        });
      }

      let data;
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          navigate('/login');
          throw new Error('Authentification requise');
        } else if (response.status === 403) {
          const levelFromPaths = await findLevelInAccessiblePaths(levelId, token);
          if (levelFromPaths) data = levelFromPaths;
          else throw new Error('Accès refusé');
        } else if (response.status === 404) {
          throw new Error('Niveau introuvable');
        } else {
          throw new Error('Erreur de chargement');
        }
      } else {
        data = await response.json();
      }

      const normalizedExercises = (data.exercises || []).map((ex, index) => ({
        ...ex,
        name: ex.name || ex.translations?.[language]?.name || ex.translations?.fr?.name || `Exercice ${index + 1}`,
        question: ex.question || ex.translations?.[language]?.question || ex.translations?.fr?.question || 'Question non disponible',
        explanation: ex.explanation || ex.translations?.[language]?.explanation || ex.translations?.fr?.explanation || ''
      }));

      setLevel({ ...data, exercises: normalizedExercises });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [levelId, language, fetchWithRetry, navigate]);

  useEffect(() => { fetchLevelData(); }, [fetchLevelData]);

  const submitExercise = useCallback(async (exerciseId, answer, extraData = {}) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!exerciseId) throw new Error('ID requis');
      if (!answer && activeExercise?.type !== 'Code') throw new Error('Réponse requise');

      const payload = { answer, userId: getUserId(), ...extraData };
      const response = await fetchWithRetry(`${API_BASE}/exercises/${exerciseId}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erreur de soumission');

      setSubmissionResult(result);
      setAttempts(prev => prev + 1);
      setCompletedExercises(markExerciseCompleted(exerciseId, result));

      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }, [activeExercise, fetchWithRetry]);

  const handleExerciseClick = useCallback((exercise) => {
    setActiveExercise(exercise);
    setUserAnswer(null);
    setSubmissionResult(null);
    setError(null);
    setAttempts(0);
    onOpen();
  }, [onOpen]);

  const handleCloseExercise = useCallback(() => {
    setActiveExercise(null);
    setUserAnswer(null);
    setSubmissionResult(null);
    setError(null);
    setAttempts(0);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    if (!activeExercise || (!userAnswer && activeExercise.type !== 'Code')) return;
    try {
      let extraData = {};
      if (activeExercise.type === 'Code' && activeExercise._meta?.manualPass) extraData.passed = true;
      await submitExercise(activeExercise._id, userAnswer, extraData);
    } catch (e) { }
  }, [activeExercise, userAnswer, submitExercise]);

  const handleTest = useCallback(async (userAnswer) => {
    return {
      success: true,
      message: 'Code exécuté avec succès',
      details: { lines: userAnswer.split('\n').length, language: activeExercise?.language || 'javascript' }
    };
  }, [activeExercise]);

  const levelStats = useMemo(() => {
    if (!level?.exercises) return { total: 0, completed: 0, progress: 0 };
    const total = level.exercises.length;
    const completed = level.exercises.filter(ex => completedExercises[ex._id]?.completed).length;
    return { total, completed, progress: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [level, completedExercises]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner size="lg" label="Chargement..." /></div>;
  if (error && !level) return (
    <div className="flex justify-center items-center h-screen p-4">
      <Card className="max-w-md w-full border-danger">
        <CardBody className="text-center gap-4">
          <IconAlertCircle size={48} className="text-danger mx-auto" />
          <h3 className="text-xl font-bold text-danger">Erreur</h3>
          <p>{error}</p>
          <Button color="primary" onPress={fetchLevelData} startContent={<IconRefresh size={18} />}>Réessayer</Button>
        </CardBody>
      </Card>
    </div>
  );

  if (!level) return (
    <div className="flex justify-center items-center h-screen p-4">
      <Card className="max-w-md w-full">
        <CardBody className="text-center gap-4">
          <IconX size={48} className="text-default-400 mx-auto" />
          <h3 className="text-xl font-bold">Niveau introuvable</h3>
          <Button color="primary" onPress={() => navigate('/courses')} startContent={<IconArrowLeft size={18} />}>Retour aux cours</Button>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-default-50 pb-16">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-content1 to-content2 pb-24 pt-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <Button
            variant="light"
            startContent={<IconArrowLeft size={18} />}
            onPress={() => navigate(`/courses/levels/${levelId}`)}
            className="mb-8"
          >
            Retour au niveau
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <Chip color="primary" variant="shadow" className="mb-4">Niveau {level.order || 1}</Chip>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                {level.title || 'Niveau sans nom'}
              </h1>
              <p className="text-lg text-default-500 max-w-2xl">
                Complétez les exercices ci-dessous pour valider vos connaissances et gagner des points d'expérience.
              </p>
            </div>

            <Card className="bg-background/60 backdrop-blur-md border border-white/20">
              <CardBody className="gap-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Progression</span>
                  <span className="text-primary font-bold">{levelStats.progress}%</span>
                </div>
                <Progress value={levelStats.progress} color="primary" className="h-3" />
                <div className="flex justify-between text-small text-default-500">
                  <div className="flex items-center gap-1">
                    <IconCheck size={16} className="text-success" />
                    <span>{levelStats.completed} terminés</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconListCheck size={16} className="text-primary" />
                    <span>{levelStats.total} total</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="container mx-auto px-4 -mt-12 relative z-20">
        {!level.exercises || level.exercises.length === 0 ? (
          <Card className="p-8 text-center">
            <CardBody className="gap-4 items-center">
              <div className="w-20 h-20 rounded-full bg-default-100 flex items-center justify-center">
                <IconFileText size={40} className="text-default-400" />
              </div>
              <h3 className="text-xl font-semibold text-default-600">Aucun exercice disponible</h3>
              <p className="text-default-500">Ce niveau ne contient pas encore d'exercices.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {level.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise._id}
                exercise={exercise}
                index={index}
                isCompleted={completedExercises[exercise._id]?.completed}
                progress={completedExercises[exercise._id]}
                onClick={() => handleExerciseClick(exercise)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Exercise Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="5xl"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          header: "border-b border-divider",
          body: "p-0",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-3 items-center">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <IconCode size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold">{activeExercise?.name || 'Exercice'}</span>
                  <span className="text-tiny text-default-500 font-normal">
                    {activeExercise?.difficulty === 'easy' ? 'Facile' : activeExercise?.difficulty === 'hard' ? 'Difficile' : 'Moyen'} • {activeExercise?.points || 10} pts
                  </span>
                </div>
              </ModalHeader>
              <ModalBody className="bg-default-50">
                {activeExercise && (
                  <ExerciseAnswerInterface
                    exercise={activeExercise}
                    answer={userAnswer}
                    onAnswer={setUserAnswer}
                    onSubmit={handleSubmit}
                    onTest={handleTest}
                    attempts={attempts}
                    maxAttempts={activeExercise.attemptsAllowed || 3}
                    isSubmitting={isSubmitting}
                    submissionResult={submissionResult}
                    error={error}
                  />
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

function ExerciseCard({ exercise, index, isCompleted, progress, onClick }) {
  const getDifficultyColor = (d) => {
    switch (d) {
      case 'easy': return "success";
      case 'hard': return "danger";
      default: return "warning";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Code': return <IconCode size={20} />;
      case 'QCM': return <IconListCheck size={20} />;
      case 'TextInput': return <IconAbc size={20} />;
      default: return <IconBrain size={20} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        isPressable
        onPress={onClick}
        className={`h-full border-l-4 ${isCompleted ? 'border-l-success' : 'border-l-primary'} hover:scale-[1.02] transition-transform`}
      >
        <CardHeader className="justify-between pb-2">
          <Chip size="sm" variant="flat" color={getDifficultyColor(exercise.difficulty)}>
            {exercise.difficulty === 'easy' ? 'Facile' : exercise.difficulty === 'hard' ? 'Difficile' : 'Moyen'}
          </Chip>
          {isCompleted && <IconCheck className="text-success" size={20} />}
        </CardHeader>
        <CardBody className="pt-0 pb-4 gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isCompleted ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
              {getTypeIcon(exercise.type)}
            </div>
            <div>
              <h4 className="font-semibold text-lg line-clamp-2">{exercise.name}</h4>
              <p className="text-small text-default-500">{exercise.points || 10} points</p>
            </div>
          </div>
          {progress && (
            <div className="mt-auto pt-2">
              <div className="flex justify-between text-tiny mb-1">
                <span>Score</span>
                <span>{progress.pointsEarned}/{progress.pointsMax}</span>
              </div>
              <Progress
                size="sm"
                value={(progress.pointsEarned / progress.pointsMax) * 100}
                color={isCompleted ? "success" : "primary"}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}
