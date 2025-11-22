import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import ExerciseAnswerInterface from '../../components/ExerciseAnswerInterface';
import './CourseStyles.css';
import './ExerciseEnhancements.css';

// Mantine UI Components
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Button, 
  Group, 
  Badge, 
  Progress, 
  Card, 
  Stack, 
  Grid, 
  Loader, 
  Alert,
  Modal,
  Box,
  Divider,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconCheck, 
  IconX, 
  IconPlay, 
  IconTrophy,
  IconAlertCircle,
  IconFileText
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import { getApiUrl } from '../../utils/apiConfig';
const API_BASE = getApiUrl('/api/courses');

// =========================
// HELPER FUNCTIONS
// =========================

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

  // Charger les données du niveau
  const fetchLevelData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/levels/${levelId}`);
      if (!response.ok) {
        throw new Error('Impossible de charger le niveau');
      }
      
      const data = await response.json();
      
      // Les données arrivent déjà normalisées du backend avec la langue appropriée
      const normalizedExercises = (data.exercises || []).map((ex, index) => ({
        ...ex,
        name: ex.name || `Exercice ${index + 1}`,
        question: ex.question || 'Question non disponible',
        explanation: ex.explanation || ''
      }));
      
      setLevel({ ...data, exercises: normalizedExercises });
    } catch (e) {
      console.error('Erreur de chargement:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [levelId, language]);

  useEffect(() => {
    fetchLevelData();
  }, [fetchLevelData]);

  // Soumettre un exercice
  const submitExercise = useCallback(async (exerciseId, answer, extraData = {}) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validation des paramètres
      if (!exerciseId) {
        throw new Error('ID d\'exercice requis');
      }

      if (!answer && activeExercise?.type !== 'Code') {
        throw new Error('Veuillez fournir une réponse avant de soumettre');
      }

      const payload = {
        answer,
        userId: getUserId(),
        ...extraData
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/exercises/${exerciseId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        // Extraire le message d'erreur du backend
        const errorMessage = result.error || result.message || `Erreur HTTP: ${response.status}`;
        console.error('Erreur de soumission:', errorMessage, result);
        throw new Error(errorMessage);
      }

      // Vérifier que la réponse contient les données attendues
      if (!result.success && result.error) {
        throw new Error(result.error);
      }

      setSubmissionResult(result);
      
      // Marquer comme complété localement
      const updated = markExerciseCompleted(exerciseId, result);
      setCompletedExercises(updated);

      console.log('✅ Exercice soumis avec succès', { 
        exerciseId, 
        correct: result.correct,
        pointsEarned: result.pointsEarned 
      });

      return result;
    } catch (e) {
      console.error('Erreur de soumission:', e);
      const errorMessage = e.message || 'Erreur lors de la soumission de l\'exercice. Veuillez réessayer.';
      setError(errorMessage);
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }, [activeExercise]);

  // Gestionnaires d'événements
  const handleExerciseClick = useCallback((exercise) => {
    setActiveExercise(exercise);
    setUserAnswer(null);
    setSubmissionResult(null);
    setError(null);
  }, []);

  const handleCloseExercise = useCallback(() => {
    setActiveExercise(null);
    setUserAnswer(null);
    setSubmissionResult(null);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!activeExercise || (!userAnswer && activeExercise.type !== 'Code')) return;
    
    try {
      let submissionData = userAnswer;
      let extraData = {};

      // Gestion spéciale pour les exercices Code
      if (activeExercise.type === 'Code' && activeExercise._meta?.manualPass) {
        extraData.passed = true;
      }

      await submitExercise(activeExercise._id, submissionData, extraData);
    } catch (e) {
      // L'erreur est déjà gérée dans submitExercise
    }
  }, [activeExercise, userAnswer, submitExercise]);

  // Statistiques du niveau
  const levelStats = useMemo(() => {
    if (!level?.exercises) return { total: 0, completed: 0, progress: 0 };
    
    const total = level.exercises.length;
    const completed = Object.values(completedExercises).filter(ex => ex.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, progress };
  }, [level, completedExercises]);

  // États de chargement
  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text size="lg" c="dimmed">Chargement des exercices...</Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (error && !level) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={24} />} 
          title="Erreur de chargement" 
          color="red"
          radius="md"
        >
          <Text mb="md">{error}</Text>
          <Button onClick={fetchLevelData} leftSection={<IconPlay size={16} />}>
            Réessayer
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!level) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconX size={24} />} 
          title="Niveau non trouvé" 
          color="red"
          radius="md"
        >
          <Button 
            onClick={() => navigate('/courses')} 
            leftSection={<IconArrowLeft size={16} />}
            mt="md"
          >
            Retour aux cours
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      {/* Header du niveau avec Mantine */}
      <Paper p="lg" radius="md" mb="xl" withBorder style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Group gap="md">
            <Button
              variant="white"
              color="dark"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => navigate(`/courses/levels/${levelId}`)}
            >
              Retour au niveau
            </Button>
            <Box>
              <Title order={1} c="white" mb="xs">
                {level.title || 'Niveau sans nom'}
              </Title>
              <Group gap="xs">
                <Badge variant="light" color="white" size="lg">
                  {levelStats.completed}/{levelStats.total} exercices
                </Badge>
              </Group>
            </Box>
          </Group>
          
          <Box style={{ minWidth: 200 }}>
            <Text size="sm" c="white" mb="xs" fw={500}>
              Progression: {levelStats.progress}%
            </Text>
            <Progress 
              value={levelStats.progress} 
              color="white"
              size="lg"
              radius="xl"
            />
          </Box>
        </Group>
      </Paper>

      {/* Liste des exercices */}
      <Box>
        <Title order={2} mb="lg">Exercices</Title>
        
        {!level.exercises || level.exercises.length === 0 ? (
          <Paper p="xl" radius="md" withBorder>
            <Stack align="center" gap="md">
              <IconFileText size={64} stroke={1.5} color="var(--mantine-color-gray-5)" />
              <Title order={3} c="dimmed">Aucun exercice disponible</Title>
              <Text c="dimmed">Ce niveau ne contient pas encore d'exercices.</Text>
            </Stack>
          </Paper>
        ) : (
          <Grid>
            {level.exercises.map((exercise, index) => {
              const isCompleted = completedExercises[exercise._id]?.completed || false;
              const exerciseProgress = completedExercises[exercise._id];
              
              return (
                <Grid.Col key={exercise._id} span={{ base: 12, sm: 6, md: 4 }}>
                  <ExerciseCard
                    exercise={exercise}
                    index={index}
                    isCompleted={isCompleted}
                    progress={exerciseProgress}
                    onClick={() => handleExerciseClick(exercise)}
                  />
                </Grid.Col>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Modal d'exercice avec Mantine */}
      <Modal
        opened={!!activeExercise}
        onClose={handleCloseExercise}
        title={activeExercise?.name || 'Exercice'}
        size="xl"
        centered
        radius="md"
      >
        {activeExercise && (
          <ExerciseModalContent
            exercise={activeExercise}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            submissionResult={submissionResult}
            isSubmitting={isSubmitting}
            error={error}
            onClose={handleCloseExercise}
            onSubmit={handleSubmit}
          />
        )}
      </Modal>
    </Container>
  );
}

// =========================
// COMPOSANT CARTE D'EXERCICE
// =========================

function ExerciseCard({ exercise, index, isCompleted, progress, onClick }) {
  const navigate = useNavigate();
  const { levelId } = useParams();
  
  const getDifficultyInfo = (difficulty) => {
    switch (difficulty) {
      case 'easy': return { color: 'green', label: 'Facile' };
      case 'hard': return { color: 'red', label: 'Difficile' };
      default: return { color: 'orange', label: 'Moyen' };
    }
  };

  const difficultyInfo = getDifficultyInfo(exercise.difficulty);
  const points = exercise.points || 10;

  const handleStartClick = (e) => {
    e.stopPropagation();
    navigate(`/courses/levels/${levelId}/exercises/${exercise._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        shadow="sm" 
        padding="lg" 
        radius="md" 
        withBorder
        style={{ 
          height: '100%',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onClick={onClick}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <Card.Section withBorder inheritPadding py="xs" bg={isCompleted ? 'green.0' : 'gray.0'}>
          <Group justify="space-between">
            <Badge size="lg" variant="filled" color="blue">
              #{index + 1}
            </Badge>
            <Badge color={difficultyInfo.color} variant="light">
              {difficultyInfo.label}
            </Badge>
            <Badge color="violet" variant="light">
              {points} pts
            </Badge>
          </Group>
        </Card.Section>

        <Stack gap="md" mt="md">
          <Box>
            <Title order={4} mb="xs">{exercise.name}</Title>
            <Text size="sm" c="dimmed" lineClamp={3}>
              {exercise.question?.length > 100 
                ? `${exercise.question.substring(0, 100)}...` 
                : exercise.question || 'Aucune description'}
            </Text>
          </Box>
          
          <Badge variant="outline" color="gray">
            {exercise.type}
          </Badge>
        </Stack>

        <Divider my="md" />

        <Group justify="space-between" mt="auto">
          {isCompleted ? (
            <Group gap="xs">
              <Badge color="green" leftSection={<IconCheck size={14} />}>
                Terminé
              </Badge>
              {progress && (
                <Group gap={4}>
                  <Text size="xs" c="dimmed">
                    {progress.pointsEarned}/{progress.pointsMax}
                  </Text>
                  <Badge size="sm" color="yellow" variant="light" leftSection={<IconTrophy size={12} />}>
                    +{progress.xpEarned} XP
                  </Badge>
                </Group>
              )}
            </Group>
          ) : (
            <Button
              fullWidth
              leftSection={<IconPlay size={16} />}
              onClick={handleStartClick}
              variant="gradient"
              gradient={{ from: 'blue', to: 'violet', deg: 90 }}
            >
              Commencer
            </Button>
          )}
        </Group>
      </Card>
    </motion.div>
  );
}

// =========================
// MODAL D'EXERCICE CONTENT
// =========================

function ExerciseModalContent({ exercise, userAnswer, setUserAnswer, submissionResult, isSubmitting, error, onClose, onSubmit }) {
  const [attempts, setAttempts] = useState(0);

  const handleAnswer = (answer) => {
    setUserAnswer(answer);
    onSubmit();
  };

  const handleTest = async (userAnswer) => {
    // Simulation d'un test de code
    return {
      success: true,
      message: 'Code exécuté avec succès',
      details: {
        lines: userAnswer.split('\n').length,
        language: exercise?.language || 'javascript'
      }
    };
  };

  return (
    <Stack gap="md">
      {/* Métadonnées de l'exercice */}
      <Group justify="space-between">
        <Group gap="xs">
          <Badge color="blue" variant="light">{exercise.type}</Badge>
          <Badge color="violet" variant="light">{exercise.points || 10} points</Badge>
          {exercise.difficulty && (
            <Badge 
              color={exercise.difficulty === 'easy' ? 'green' : exercise.difficulty === 'hard' ? 'red' : 'orange'}
              variant="light"
            >
              {exercise.difficulty === 'easy' ? 'Facile' : exercise.difficulty === 'hard' ? 'Difficile' : 'Moyen'}
            </Badge>
          )}
        </Group>
      </Group>

      <Divider />

      {/* Interface de réponse */}
      <Box>
        <ExerciseAnswerInterface
          exercise={exercise}
          onAnswer={handleAnswer}
          onTest={handleTest}
          attempts={attempts}
          maxAttempts={exercise.attemptsAllowed || 3}
          isSubmitting={isSubmitting}
        />
      </Box>
      
      {/* Affichage des erreurs */}
      {error && (
        <Alert 
          icon={<IconAlertCircle size={20} />} 
          title="Erreur" 
          color="red"
          radius="md"
        >
          {error}
        </Alert>
      )}
      
      {/* Résultat de soumission */}
      {submissionResult && (
        <SubmissionResult result={submissionResult} />
      )}
    </Stack>
  );
}

// =========================
// COMPOSANTS D'EXERCICES SPÉCIFIQUES (LEGACY - À SUPPRIMER)
// =========================

// =========================
// RÉSULTAT DE SOUMISSION
// =========================

function SubmissionResult({ result }) {
  const scorePercentage = result.pointsMax > 0 ? Math.round((result.pointsEarned / result.pointsMax) * 100) : 0;
  
  return (
    <Alert 
      icon={result.correct ? <IconCheck size={20} /> : <IconX size={20} />}
      title={result.correct ? 'Correct !' : 'Incorrect'}
      color={result.correct ? 'green' : 'red'}
      radius="md"
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600}>
            Score: {result.pointsEarned}/{result.pointsMax} ({scorePercentage}%)
          </Text>
          {result.xpEarned > 0 && (
            <Badge color="yellow" variant="light" leftSection={<IconTrophy size={14} />}>
              +{result.xpEarned} XP
            </Badge>
          )}
        </Group>
        
        {result.explanation && (
          <Box>
            <Text fw={600} mb="xs">Explication :</Text>
            <Text size="sm">{result.explanation}</Text>
          </Box>
        )}
        
        {result.details && result.details.type === 'QCM' && (
          <Box>
            <Text fw={600} mb="xs">Détails QCM :</Text>
            <Stack gap="xs">
              <Text size="sm">
                <strong>Vos réponses :</strong> {result.details.user?.join(', ') || 'Aucune'}
              </Text>
              <Text size="sm">
                <strong>Bonnes réponses :</strong> {result.details.correct?.join(', ') || 'N/A'}
              </Text>
            </Stack>
          </Box>
        )}
        
        {result.details && result.details.tests && (
          <Box>
            <Text fw={600} mb="xs">Résultats des tests :</Text>
            <Stack gap="xs">
              {result.details.tests.map((test, i) => (
                <Group key={i} justify="space-between">
                  <Text size="sm" fw={500}>{test.name || `Test ${i+1}`}</Text>
                  <Badge 
                    color={test.passed ? 'green' : 'red'} 
                    variant="light"
                    leftSection={test.passed ? <IconCheck size={12} /> : <IconX size={12} />}
                  >
                    {test.passed ? 'Réussi' : 'Échec'}
                    {test.points && ` (+${test.points} pts)`}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Alert>
  );
}