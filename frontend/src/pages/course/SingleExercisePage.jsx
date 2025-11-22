import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import UnifiedExerciseInterface from '../../components/UnifiedExerciseInterface';
import { getApiUrl } from '../../utils/apiConfig';
import './CourseStyles.css';
import './ExerciseEnhancements.css';

const API_BASE = getApiUrl('/api/courses');

// Fonctions helper
const getUserId = () => {
  const stored = localStorage.getItem('userId');
  if (stored) return stored;
  const newId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('userId', newId);
  return newId;
};

const markExerciseCompleted = (exerciseId, result) => {
  const completed = JSON.parse(localStorage.getItem('completedExercises') || '{}');
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
          console.log(`[SingleExercisePage] Level trouvé dans path ${path._id}`);
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
    console.error('[SingleExercisePage] Erreur lors de la recherche du level:', error);
    return null;
  }
}

export default function SingleExercisePage() {
  const { levelId, exerciseId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { t } = useTranslation();

  // États
  const [exercise, setExercise] = useState(null);
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
          console.log('[SingleExercisePage] Token expiré, tentative de rafraîchissement...', { attempt, retries });
          
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
                  console.log('[SingleExercisePage] Token rafraîchi avec succès');
                  // Réessayer la requête avec le nouveau token
                  return makeRequest(attempt + 1);
                }
              }
            }
          } catch (refreshError) {
            console.warn('[SingleExercisePage] Erreur lors du rafraîchissement du token:', refreshError);
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
          console.log(`[SingleExercisePage] Tentative ${attempt + 1}/${retries} échouée, nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Backoff exponentiel
          return makeRequest(attempt + 1);
        }
        throw error;
      }
    };
    
    return makeRequest();
  }, []);

  // Charger les données
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      console.log('[SingleExercisePage] Fetching level data:', { 
        levelId, 
        exerciseId,
        API_BASE, 
        hasToken: !!token 
      });

      // Essayer d'abord de charger le level individuellement
      let levelResponse;
      try {
        levelResponse = await fetchWithRetry(`${API_BASE}/levels/${levelId}`);
      } catch (fetchError) {
        console.error('[SingleExercisePage] Erreur lors de fetchWithRetry:', fetchError);
        // Si c'est une erreur réseau, essayer directement
        levelResponse = await fetch(`${API_BASE}/levels/${levelId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          credentials: 'include'
        });
      }
      
      console.log('[SingleExercisePage] Response status:', levelResponse.status, levelResponse.statusText);
      
      let levelData;
      
      if (!levelResponse.ok) {
        const errorData = await levelResponse.json().catch(() => ({}));
        console.error('[SingleExercisePage] Error response:', errorData);
        
        if (levelResponse.status === 401) {
          // Rediriger vers la page de connexion
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          throw new Error('Authentification requise. Veuillez vous connecter.');
        } else if (levelResponse.status === 403) {
          // Si accès refusé, essayer de trouver le level dans les paths accessibles
          console.log('[SingleExercisePage] Level non accessible directement (403), recherche dans les paths...');
          const levelFromPaths = await findLevelInAccessiblePaths(levelId, token);
          
          if (levelFromPaths) {
            console.log('[SingleExercisePage] Level trouvé via paths accessibles');
            levelData = levelFromPaths;
          } else {
            // Si pas trouvé, lancer l'erreur
            throw new Error(errorData.message || errorData.error || 'Accès refusé - Niveau verrouillé');
          }
        } else if (levelResponse.status === 404) {
          throw new Error('Niveau introuvable');
        } else {
          throw new Error(errorData.error || errorData.message || `Erreur ${levelResponse.status}: Impossible de charger le niveau`);
        }
      } else {
        // Réponse OK, parser les données
        levelData = await levelResponse.json();
      }

      console.log('[SingleExercisePage] Level data received:', { 
        levelId: levelData._id, 
        title: levelData.title || levelData.translations?.fr?.title, 
        exercisesCount: levelData.exercises?.length || 0 
      });

      setLevel(levelData);

      // Trouver l'exercice dans le niveau
      const exerciseData = levelData.exercises?.find(ex => ex._id === exerciseId);
      if (!exerciseData) {
        throw new Error('Exercice non trouvé');
      }
      setExercise(exerciseData);

    } catch (e) {
      console.error('[SingleExercisePage] Erreur de chargement complète:', e);
      console.error('[SingleExercisePage] Stack trace:', e.stack);
      setError(e.message || 'Erreur lors du chargement du niveau');
    } finally {
      setLoading(false);
    }
  }, [levelId, exerciseId, fetchWithRetry, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Soumettre un exercice
  const submitExercise = useCallback(async (userAnswer) => {
    if (!exercise) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        answer: userAnswer,
        userId: getUserId()
      };

      console.log('[SingleExercisePage] Submitting exercise:', { exerciseId: exercise._id });

      const response = await fetchWithRetry(`${API_BASE}/exercises/${exercise._id}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[SingleExercisePage] Submission error:', errorData);
        
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          throw new Error('Accès refusé à cet exercice');
        } else {
          throw new Error(errorData.error || errorData.message || 'Erreur de soumission');
        }
      }

      const result = await response.json();
      console.log('[SingleExercisePage] Submission result:', result);
      
      setSubmissionResult(result);
      setAttempts(prev => prev + 1);
      
      // Marquer comme complété localement
      markExerciseCompleted(exercise._id, result);

      return result;
    } catch (e) {
      console.error('[SingleExercisePage] Erreur de soumission:', e);
      setError(e.message);
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }, [exercise, fetchWithRetry]);

  // Fonction de test pour les exercices de code
  const handleTest = useCallback(async (userAnswer) => {
    // Simulation d'un test de code
    return {
      success: true,
      message: 'Code exécuté avec succès',
      details: {
        lines: userAnswer.split('\n').length,
        language: exercise?.language || 'javascript'
      }
    };
  }, [exercise]);

  // États de chargement
  if (loading) {
    return (
      <div className="single-exercise-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de l'exercice...</p>
        </div>
      </div>
    );
  }

  if (error && !exercise) {
    return (
      <div className="single-exercise-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchData}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="single-exercise-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Exercice non trouvé</h2>
          <button className="btn-primary" onClick={() => navigate(`/courses/levels/${levelId}`)}>
            Retour au niveau
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="single-exercise-page">
      {/* Header */}
      <header className="exercise-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(`/courses/levels/${levelId}`)}>
            <span className="icon">←</span>
            <span className="text">Retour au niveau</span>
          </button>
          
          <div className="breadcrumb">
            <span className="level-name">{level?.title || 'Niveau'}</span>
            <span className="separator"> / </span>
            <span className="exercise-name">{exercise.name}</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="exercise-meta">
            <span className="type-badge">{exercise.type}</span>
            <span className="points-badge">{exercise.points || 10} pts</span>
            {attempts > 0 && (
              <span className="attempts-badge">
                {attempts}/{exercise.attemptsAllowed || 3} tentatives
              </span>
            )}
          </div>
          
          <button 
            className="btn-secondary"
            onClick={() => navigate(`/courses/levels/${levelId}/exercises`)}
            style={{
              marginLeft: '12px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #6b7280, #4b5563)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(107, 114, 128, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(107, 114, 128, 0.3)';
            }}
          >
            📋 Tous les exercices
          </button>
        </div>
      </header>

      {/* Interface de réponse unifiée */}
      <main className="exercise-main">
        <UnifiedExerciseInterface
          exercise={exercise}
          onSubmissionResult={(result) => {
            setSubmissionResult(result);
            setAttempts(prev => prev + 1);
            markExerciseCompleted(exercise._id, result);
          }}
          onError={(error) => {
            setError(error.message);
          }}
        />
        
        {/* Affichage des erreurs */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        {/* Résultat de soumission */}
        {submissionResult && (
          <SubmissionResult result={submissionResult} />
        )}
      </main>
    </div>
  );
}

// =========================
// COMPOSANT RÉSULTAT DE SOUMISSION
// =========================

function SubmissionResult({ result }) {
  const scorePercentage = result.pointsMax > 0 ? Math.round((result.pointsEarned / result.pointsMax) * 100) : 0;
  
  return (
    <motion.div 
      className={`submission-result ${result.correct ? 'correct' : 'incorrect'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="result-header">
        <div className="status">
          {result.correct ? '✅ Correct !' : '❌ Incorrect'}
        </div>
        <div className="score-display">
          <span className="score">{result.pointsEarned}/{result.pointsMax}</span>
          <span className="percentage">({scorePercentage}%)</span>
        </div>
      </div>
      
      {result.xpEarned > 0 && (
        <div className="xp-earned">
          🌟 +{result.xpEarned} XP gagné !
        </div>
      )}
      
      {result.explanation && (
        <div className="explanation">
          <h4>Explication :</h4>
          <p>{result.explanation}</p>
        </div>
      )}
      
      {result.details && result.details.type === 'QCM' && (
        <div className="qcm-details">
          <h4>Détails QCM :</h4>
          <div className="comparison">
            <div>Vos réponses : {result.details.user?.join(', ') || 'Aucune'}</div>
            <div>Bonnes réponses : {result.details.correct?.join(', ') || 'N/A'}</div>
          </div>
        </div>
      )}
      
      {result.details && result.details.tests && (
        <div className="tests-results">
          <h4>Résultats des tests :</h4>
          {result.details.tests.map((test, i) => (
            <div key={i} className={`test-result ${test.passed ? 'passed' : 'failed'}`}>
              <strong>{test.name || `Test ${i+1}`}</strong>
              <span className="test-status">
                {test.passed ? '✅ Réussi' : '❌ Échec'}
                {test.points && ` (+${test.points} pts)`}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}