import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import ExerciseAnswerInterface from '../../components/ExerciseAnswerInterface';
import './CourseStyles.css';
import './ExerciseEnhancements.css';

const API_BASE = 'http://localhost:5000/api/courses';

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

  // Charger les données
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger le niveau
      const levelResponse = await fetch(`${API_BASE}/levels/${levelId}`);
      if (!levelResponse.ok) {
        throw new Error('Impossible de charger le niveau');
      }
      const levelData = await levelResponse.json();
      setLevel(levelData);

      // Trouver l'exercice dans le niveau
      const exerciseData = levelData.exercises?.find(ex => ex._id === exerciseId);
      if (!exerciseData) {
        throw new Error('Exercice non trouvé');
      }
      setExercise(exerciseData);

    } catch (e) {
      console.error('Erreur de chargement:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [levelId, exerciseId]);

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

      const response = await fetch(`${API_BASE}/exercises/${exercise._id}/submit`, {
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
      setAttempts(prev => prev + 1);
      
      // Marquer comme complété localement
      markExerciseCompleted(exercise._id, result);

      return result;
    } catch (e) {
      console.error('Erreur de soumission:', e);
      setError(e.message);
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }, [exercise]);

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
        </div>
      </header>

      {/* Interface de réponse unifiée */}
      <main className="exercise-main">
        <ExerciseAnswerInterface
          exercise={exercise}
          onAnswer={submitExercise}
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