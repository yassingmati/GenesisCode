import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import ExerciseAnswerInterface from '../../components/ExerciseAnswerInterface';
import './CourseStyles.css';
import './ExerciseEnhancements.css';

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
      <div className="exercise-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des exercices...</p>
        </div>
      </div>
    );
  }

  if (error && !level) {
    return (
      <div className="exercise-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchLevelData}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="exercise-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Niveau non trouvé</h2>
          <button className="btn-primary" onClick={() => navigate('/courses')}>
            Retour aux cours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exercise-page">
      {/* Header du niveau */}
      <header className="exercise-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(`/courses/levels/${levelId}`)}>
            <span className="icon">←</span>
            <span className="text">Retour au niveau</span>
          </button>
          
          <div className="level-info">
            <h1 className="level-title">{level.title || 'Niveau sans nom'}</h1>
            <div className="level-meta">
              <span className="exercise-count">
                {levelStats.completed}/{levelStats.total} exercices
              </span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="progress-container">
            <span className="progress-text">Progression: {levelStats.progress}%</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${levelStats.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Liste des exercices */}
      <main className="exercise-main">
        <div className="exercises-container">
          <h2 className="exercises-title">Exercices</h2>
          
          {!level.exercises || level.exercises.length === 0 ? (
            <div className="no-exercises">
              <div className="no-exercises-icon">📝</div>
              <h3>Aucun exercice disponible</h3>
              <p>Ce niveau ne contient pas encore d'exercices.</p>
            </div>
          ) : (
            <div className="exercises-grid">
              {level.exercises.map((exercise, index) => {
                const isCompleted = completedExercises[exercise._id]?.completed || false;
                const exerciseProgress = completedExercises[exercise._id];
                
                return (
                  <ExerciseCard
                    key={exercise._id}
                    exercise={exercise}
                    index={index}
                    isCompleted={isCompleted}
                    progress={exerciseProgress}
                    onClick={() => handleExerciseClick(exercise)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal d'exercice */}
      <AnimatePresence>
        {activeExercise && (
          <ExerciseModal
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
      </AnimatePresence>
    </div>
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
      case 'easy': return { color: '#4CAF50', label: '😊 Facile' };
      case 'hard': return { color: '#f44336', label: '🔥 Difficile' };
      default: return { color: '#ff9800', label: '🎯 Moyen' };
    }
  };

  const difficultyInfo = getDifficultyInfo(exercise.difficulty);
  const points = exercise.points || 10;

  const handleCardClick = (e) => {
    // Empêcher la propagation si c'est le bouton "Commencer"
    if (e.target.closest('.btn-start')) {
      e.stopPropagation();
      navigate(`/courses/levels/${levelId}/exercises/${exercise._id}`);
    } else {
      // Garder l'ancien comportement pour le modal si on clique ailleurs sur la carte
      onClick();
    }
  };

  return (
    <motion.div
      className={`exercise-card ${isCompleted ? 'completed' : ''}`}
      onClick={handleCardClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="card-header">
        <div className="exercise-number">{index + 1}</div>
        <div className="exercise-type-badge">{exercise.type}</div>
        <div 
          className="points-badge" 
          style={{ backgroundColor: difficultyInfo.color }}
        >
          {points} pts
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="exercise-title">{exercise.name}</h3>
        <p className="exercise-question">
          {exercise.question.length > 100 
            ? `${exercise.question.substring(0, 100)}...` 
            : exercise.question
          }
        </p>
        
        <div className="meta-info">
          <span className="difficulty" style={{ backgroundColor: `${difficultyInfo.color}20`, color: difficultyInfo.color }}>
            {difficultyInfo.label}
          </span>
        </div>
      </div>
      
      <div className="card-footer">
        {isCompleted ? (
          <div className="completion-info">
            <span className="completion-badge">✅ Terminé</span>
            {progress && (
              <div className="score-info">
                <span className="score">{progress.pointsEarned}/{progress.pointsMax}</span>
                <span className="xp">+{progress.xpEarned} XP</span>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-start">
            📝 Commencer
          </button>
        )}
      </div>
    </motion.div>
  );
}

// =========================
// MODAL D'EXERCICE
// =========================

function ExerciseModal({ exercise, userAnswer, setUserAnswer, submissionResult, isSubmitting, error, onClose, onSubmit }) {
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
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="exercise-info">
            <h3 className="modal-title">{exercise.name}</h3>
            <div className="exercise-meta">
              <span className="type-badge">{exercise.type}</span>
              <span className="points-info">{exercise.points || 10} points</span>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <ExerciseAnswerInterface
            exercise={exercise}
            onAnswer={handleAnswer}
            onTest={handleTest}
            attempts={attempts}
            maxAttempts={exercise.attemptsAllowed || 3}
            isSubmitting={isSubmitting}
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
        </div>
      </motion.div>
    </motion.div>
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
    <div className={`submission-result ${result.correct ? 'correct' : 'incorrect'}`}>
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
    </div>
  );
}