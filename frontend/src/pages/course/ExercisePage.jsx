import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import ExerciseAnswerInterface from '../../components/ExerciseAnswerInterface';
import { getApiUrl } from '../../utils/apiConfig';

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
  Center
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconCheck, 
  IconX, 
  IconPlayerPlay, 
  IconTrophy,
  IconAlertCircle,
  IconFileText,
  IconRefresh
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const API_BASE = getApiUrl('/api/courses');

// =========================
// HELPER FUNCTIONS
// =========================

// Fonction pour trouver un level dans les paths accessibles (fallback si accès direct refusé)
async function findLevelInAccessiblePaths(levelId, token) {
  try {
    // Récupérer les catégories
    const catsRes = await fetch(`${API_BASE}/categories`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!catsRes.ok) return null;
    const cats = await catsRes.json();

    // Chercher dans chaque catégorie
    for (const cat of cats) {
      const pRes = await fetch(`${API_BASE}/categories/${cat._id}/paths`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!pRes.ok) continue;
      const paths = await pRes.json();

      // Chercher dans chaque path
      for (const path of paths) {
        const lvRes = await fetch(`${API_BASE}/paths/${path._id}/levels`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => ({ json: () => [] }));
        if (!lvRes.ok) continue;
        const levels = await lvRes.json();

        // Chercher le level spécifique
        const targetLevel = levels.find(level => level._id === levelId);
        if (targetLevel) {
          console.log(`[ExercisePage] Level trouvé dans path ${path._id}`);
          // Ajouter l'information du path au level
          return {
            ...targetLevel,
            path: {
              _id: path._id,
              name: path.name,
              translations: path.translations
            }
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[ExercisePage] Erreur lors de la recherche du level:', error);
    return null;
  }
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

  // Helper pour faire une requête avec retry et gestion d'authentification
  const fetchWithRetry = useCallback(async (url, options = {}, retries = 2) => {
    const makeRequest = async (attempt = 0) => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          ...options.headers
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include'
        });
        
        // Si 401 et on a encore des tentatives, essayer de rafraîchir le token
        if (response.status === 401 && attempt < retries) {
          console.log('[ExercisePage] Token expiré, tentative de rafraîchissement...', { attempt, retries });
          
          // Essayer de rafraîchir le token via l'API auth
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
                  console.log('[ExercisePage] Token rafraîchi avec succès');
                  // Réessayer la requête avec le nouveau token
                  return makeRequest(attempt + 1);
                }
              }
            }
          } catch (refreshError) {
            console.warn('[ExercisePage] Erreur lors du rafraîchissement du token:', refreshError);
          }
          
          // Si le rafraîchissement échoue, rediriger vers la connexion
          if (attempt === retries - 1) {
            throw new Error('Session expirée. Veuillez vous reconnecter.');
          }
        }
        
        return response;
      } catch (error) {
        if (attempt < retries && error.message.includes('Session expirée')) {
          throw error; // Ne pas retry si c'est une erreur de session
        }
        if (attempt < retries) {
          console.log(`[ExercisePage] Tentative ${attempt + 1}/${retries} échouée, nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Backoff exponentiel
          return makeRequest(attempt + 1);
        }
        throw error;
      }
    };
    
    return makeRequest();
  }, []);

  // Charger les données du niveau
  const fetchLevelData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('[ExercisePage] Fetching level data:', { 
        levelId, 
        API_BASE, 
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      });
      
      // Essayer d'abord de charger le level individuellement (comme dans LevelPage)
      let response;
      try {
        response = await fetchWithRetry(`${API_BASE}/levels/${levelId}`);
      } catch (fetchError) {
        console.error('[ExercisePage] Erreur lors de fetchWithRetry:', fetchError);
        // Si c'est une erreur réseau, essayer directement
        response = await fetch(`${API_BASE}/levels/${levelId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          credentials: 'include'
        });
      }
      
      console.log('[ExercisePage] Response status:', response.status, response.statusText);
      
      let data;
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ExercisePage] Error response:', errorData);
        
        if (response.status === 401) {
          // Rediriger vers la page de connexion
          notifications.show({
            title: 'Session expirée',
            message: 'Votre session a expiré. Veuillez vous reconnecter.',
            color: 'orange',
            icon: <IconAlertCircle size={18} />
          });
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          throw new Error('Authentification requise. Veuillez vous connecter.');
        } else if (response.status === 403) {
          // Si accès refusé, essayer de trouver le level dans les paths accessibles
          console.log('[ExercisePage] Level non accessible directement (403), recherche dans les paths...');
          const levelFromPaths = await findLevelInAccessiblePaths(levelId, token);
          
          if (levelFromPaths) {
            console.log('[ExercisePage] Level trouvé via paths accessibles');
            data = levelFromPaths;
          } else {
            // Si pas trouvé, lancer l'erreur
            throw new Error(errorData.message || errorData.error || 'Accès refusé - Niveau verrouillé');
          }
        } else if (response.status === 404) {
          throw new Error('Niveau introuvable');
        } else {
          throw new Error(errorData.error || errorData.message || `Erreur ${response.status}: Impossible de charger le niveau`);
        }
      } else {
        // Réponse OK, parser les données
        data = await response.json();
      }
      
      console.log('[ExercisePage] Level data received:', { 
        levelId: data._id, 
        title: data.title || data.translations?.fr?.title, 
        exercisesCount: data.exercises?.length || 0 
      });
      
      // Normaliser les exercices avec support multilingue
      const normalizedExercises = (data.exercises || []).map((ex, index) => ({
        ...ex,
        name: ex.name || ex.translations?.[language]?.name || ex.translations?.fr?.name || `Exercice ${index + 1}`,
        question: ex.question || ex.translations?.[language]?.question || ex.translations?.fr?.question || 'Question non disponible',
        explanation: ex.explanation || ex.translations?.[language]?.explanation || ex.translations?.fr?.explanation || ''
      }));
      
      setLevel({ ...data, exercises: normalizedExercises });
    } catch (e) {
      console.error('[ExercisePage] Erreur de chargement complète:', e);
      console.error('[ExercisePage] Stack trace:', e.stack);
      const errorMessage = e.message || 'Erreur lors du chargement du niveau';
      setError(errorMessage);
      
      notifications.show({
        title: 'Erreur de chargement',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={18} />
      });
    } finally {
      setLoading(false);
    }
  }, [levelId, language, fetchWithRetry, navigate]);

  useEffect(() => {
    fetchLevelData();
  }, [fetchLevelData]);

  // Soumettre un exercice
  const submitExercise = useCallback(async (exerciseId, answer, extraData = {}) => {
    try {
      setIsSubmitting(true);
      setError(null);

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

      // Utiliser fetchWithRetry pour la soumission aussi
      const response = await fetchWithRetry(`${API_BASE}/exercises/${exerciseId}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || result.message || `Erreur HTTP: ${response.status}`;
        console.error('Erreur de soumission:', errorMessage, result);
        throw new Error(errorMessage);
      }

      if (!result.success && result.error) {
        throw new Error(result.error);
      }

      setSubmissionResult(result);
      setAttempts(prev => prev + 1);
      
      // Marquer comme complété localement
      const updated = markExerciseCompleted(exerciseId, result);
      setCompletedExercises(updated);

      // Notification de succès
      notifications.show({
        title: result.correct ? 'Correct !' : 'Incorrect',
        message: result.correct 
          ? `Vous avez gagné ${result.pointsEarned} points !` 
          : 'Essayez encore !',
        color: result.correct ? 'green' : 'orange',
        icon: result.correct ? <IconCheck size={18} /> : <IconX size={18} />
      });

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
      
      notifications.show({
        title: 'Erreur de soumission',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={18} />
      });
      
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
    setAttempts(0);
  }, []);

  const handleCloseExercise = useCallback(() => {
    setActiveExercise(null);
    setUserAnswer(null);
    setSubmissionResult(null);
    setError(null);
    setAttempts(0);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!activeExercise || (!userAnswer && activeExercise.type !== 'Code')) return;
    
    try {
      let submissionData = userAnswer;
      let extraData = {};

      if (activeExercise.type === 'Code' && activeExercise._meta?.manualPass) {
        extraData.passed = true;
      }

      await submitExercise(activeExercise._id, submissionData, extraData);
    } catch (e) {
      // L'erreur est déjà gérée dans submitExercise
    }
  }, [activeExercise, userAnswer, submitExercise]);

  const handleAnswer = useCallback((answer) => {
    setUserAnswer(answer);
  }, []);

  const handleTest = useCallback(async (userAnswer) => {
    // Simulation d'un test de code
    return {
      success: true,
      message: 'Code exécuté avec succès',
      details: {
        lines: userAnswer.split('\n').length,
        language: activeExercise?.language || 'javascript'
      }
    };
  }, [activeExercise]);

  // Statistiques du niveau
  const levelStats = useMemo(() => {
    if (!level?.exercises) return { total: 0, completed: 0, progress: 0 };
    
    const total = level.exercises.length;
    const completed = level.exercises.filter(ex => 
      completedExercises[ex._id]?.completed
    ).length;
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
          <Button 
            onClick={fetchLevelData} 
            leftSection={<IconRefresh size={16} />}
          >
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
      {/* Header du niveau */}
      <Paper 
        p="lg" 
        radius="md" 
        mb="xl" 
        withBorder 
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
        }}
      >
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

      {/* Modal d'exercice */}
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
            setUserAnswer={handleAnswer}
            submissionResult={submissionResult}
            isSubmitting={isSubmitting}
            error={error}
            attempts={attempts}
            maxAttempts={activeExercise.attemptsAllowed || 3}
            onClose={handleCloseExercise}
            onSubmit={handleSubmit}
            onTest={handleTest}
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
              onClick={handleStartClick}
              variant="gradient"
              gradient={{ from: 'blue', to: 'violet', deg: 90 }}
            >
              <Group gap={8}>
                <IconPlayerPlay size={16} />
                <span>Commencer</span>
              </Group>
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

function ExerciseModalContent({ 
  exercise, 
  userAnswer, 
  setUserAnswer, 
  submissionResult, 
  isSubmitting, 
  error, 
  attempts,
  maxAttempts,
  onClose, 
  onSubmit,
  onTest
}) {
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
        {attempts > 0 && (
          <Text size="sm" c="dimmed">
            Tentatives: {attempts}/{maxAttempts}
          </Text>
        )}
      </Group>

      <Divider />

      {/* Question */}
      <Box>
        <Text fw={600} mb="xs">Question :</Text>
        <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
          {exercise.question || 'Aucune question disponible'}
        </Text>
      </Box>

      {/* Interface de réponse */}
      <Box>
        <ExerciseAnswerInterface
          exercise={exercise}
          onAnswer={setUserAnswer}
          onTest={onTest}
          attempts={attempts}
          maxAttempts={maxAttempts}
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

      {/* Boutons d'action */}
      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        <Button
          onClick={onSubmit}
          loading={isSubmitting}
          disabled={!userAnswer && exercise.type !== 'Code'}
          leftSection={<IconCheck size={16} />}
        >
          Soumettre
        </Button>
      </Group>
    </Stack>
  );
}

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
