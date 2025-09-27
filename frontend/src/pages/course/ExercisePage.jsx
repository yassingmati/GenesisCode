import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import './CourseStyles.css';

const API_BASE = 'http://localhost:5000/api/courses';

// =========================
// COMPOSANT PRINCIPAL - PAGE D'EXERCICES
// =========================

export default function ExercisePage() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { language, currentLanguage } = useLanguage();
  const { t } = useTranslation();

  // État du niveau actuel et de la progression
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());

  // État pour l'exercice en cours
  const [activeExercise, setActiveExercise] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupération des données du niveau
  const fetchLevelData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Chargement du niveau:', levelId);
      
      const response = await fetch(`${API_BASE}/levels/${levelId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load level data.');
      }
      const data = await response.json();
      
      console.log('📊 Données reçues:', data);
      console.log('📝 Exercices bruts:', data.exercises);
      
      // Normaliser les exercices avec priorité à la langue sélectionnée
      const normalizedExercises = (data.exercises || []).map((ex, index) => {
        const normalized = {
          ...ex,
          name: ex.translations?.[language]?.name || 
                ex.translations?.fr?.name || 
                ex.translations?.en?.name || 
                ex.name || 
                `Exercice ${index + 1}`,
          question: ex.translations?.[language]?.question || 
                    ex.translations?.fr?.question || 
                    ex.translations?.en?.question || 
                    ex.question || 
                    'Question non disponible'
        };
        console.log(`📋 Exercice ${index + 1}:`, normalized);
        return normalized;
      });
      
      data.exercises = normalizedExercises;
      console.log('✅ Exercices normalisés:', normalizedExercises);
      
      setLevel(data);
    } catch (e) {
      console.error('❌ Erreur lors du chargement:', e);
      setError(e.message || 'Erreur inconnue lors du chargement du niveau.');
    } finally {
      setLoading(false);
    }
  }, [levelId, language]);

  useEffect(() => {
    fetchLevelData();
  }, [fetchLevelData]);

  // Récupération de l'ID utilisateur
  const getUserId = () => {
    return localStorage.getItem('userId') || 'user-' + Date.now();
  };

  // Soumission d'un exercice
  const submitExercise = useCallback(async (exerciseId, answer) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`${API_BASE}/exercises/${exerciseId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer,
          userId: getUserId()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la soumission');
      }

      const result = await response.json();
      setSubmissionResult(result);
      
      if (result.correct) {
        setCompletedExercises(prev => new Set([...prev, exerciseId]));
      }

      return result;
    } catch (e) {
      console.error('Erreur de soumission:', e);
      setError(e.message || 'Erreur lors de la soumission de l\'exercice');
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Gestion de l'ouverture d'un exercice
  const handleExerciseClick = useCallback((exercise) => {
    setActiveExercise(exercise);
    setUserAnswer(null);
    setSubmissionResult(null);
    setError(null);
  }, []);

  // Gestion de la fermeture de l'exercice
  const handleCloseExercise = useCallback(() => {
    setActiveExercise(null);
    setUserAnswer(null);
    setSubmissionResult(null);
    setError(null);
  }, []);

  // Gestion de la soumission
  const handleSubmit = useCallback(async () => {
    if (!activeExercise || !userAnswer) return;
    
    try {
      await submitExercise(activeExercise._id, userAnswer);
    } catch (e) {
      // L'erreur est déjà gérée dans submitExercise
    }
  }, [activeExercise, userAnswer, submitExercise]);

  // Statistiques du niveau
  const levelStats = useMemo(() => {
    if (!level?.exercises) return { total: 0, completed: 0, progress: 0 };
    
    const total = level.exercises.length;
    const completed = completedExercises.size;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, progress };
  }, [level, completedExercises]);

  // Rendu des états de chargement et d'erreur
  if (loading) {
    return (
      <div className="exercise-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('loading')} {t('exercises').toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  if (error && !level) {
    return (
      <div className="exercise-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>{t('error')} {t('loading').toLowerCase()}</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchLevelData}>
            {t('retry')}
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
          <h2>{t('levelNotFound')}</h2>
          <p>{t('levelNotFoundDesc')}</p>
          <button className="btn-primary" onClick={() => navigate('/cours')}>
            {t('back')} {t('courses').toLowerCase()}
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
           <button 
             className="btn-back" 
             onClick={() => navigate('/cours')}
           >
             <span className="icon">←</span>
             <span className="text">{t('back')}</span>
           </button>
           
           {/* Logo GenesisCode */}
           <div className="logo-container" onClick={() => navigate('/dashboard')}>
             <div className="logo-icon">🚀</div>
             <span className="logo-text">GenesisCode</span>
           </div>
           
          <div className="level-info">
            <h1 className="level-title">{level.name || 'Niveau sans nom'}</h1>
            <div className="level-meta">
              <span className="level-order">Niveau {level.order || '?'}</span>
              <span className="exercise-count">
                {levelStats.completed}/{levelStats.total} exercices
              </span>
            </div>
          </div>
        </div>
         <div className="header-right">
           <div className="progress-container">
             <span className="progress-text">{t('progress')}: {levelStats.progress}%</span>
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
           <h2 className="exercises-title">{t('exercises')}</h2>
           
           {/* Message si pas d'exercices */}
           {!level.exercises || level.exercises.length === 0 ? (
             <div className="no-exercises">
               <div className="no-exercises-icon">📝</div>
               <h3>Aucun exercice disponible</h3>
               <p>Ce niveau ne contient pas encore d'exercices.</p>
               <button 
                 className="btn-primary" 
                 onClick={() => navigate('/cours')}
               >
                 {t('back')} {t('courses').toLowerCase()}
               </button>
             </div>
           ) : (
             <div className="exercises-grid">
               {level.exercises.map((exercise, index) => (
                 <motion.div
                   key={exercise._id || `exercise-${index}`}
                   className={`exercise-card ${completedExercises.has(exercise._id) ? 'completed' : ''}`}
                   onClick={() => handleExerciseClick(exercise)}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.1 }}
                 >
                   <div className="card-header">
                     <div className="exercise-number">{index + 1}</div>
                     <div className="exercise-type-badge">{exercise.type || 'Exercice'}</div>
                   </div>
                   <div className="card-content">
                     <h3 className="exercise-title">
                       {exercise.name || `Exercice ${index + 1}`}
                     </h3>
                     <p className="exercise-question">
                       {exercise.question && exercise.question.length > 100 
                         ? `${exercise.question.substring(0, 100)}...` 
                         : exercise.question || 'Description non disponible'
                       }
                     </p>
                     {completedExercises.has(exercise._id) && (
                       <div className="exercise-progress">
                         <span className="xp-earned">+50 XP</span>
                         <span className="completion-badge">Terminé</span>
                       </div>
                     )}
                   </div>
                    <div className="card-actions">
                      <button className="btn-start">
                        {completedExercises.has(exercise._id) ? t('retry') : t('start')}
                      </button>
                    </div>
                 </motion.div>
               ))}
             </div>
           )}
        </div>
      </main>

      {/* Modal d'exercice */}
      <AnimatePresence>
        {activeExercise && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseExercise}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 className="modal-title">{activeExercise.name}</h3>
                <button className="btn-close" onClick={handleCloseExercise}>
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="exercise-question-full">
                  <p>{activeExercise.question}</p>
                </div>
                
                {/* Rendu spécifique selon le type d'exercice */}
                <ExerciseRenderer 
                  exercise={activeExercise}
                  userAnswer={userAnswer}
                  setUserAnswer={setUserAnswer}
                  submissionResult={submissionResult}
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
                  <div className={`submission-result ${submissionResult.correct ? 'correct' : 'incorrect'}`}>
                    <div className="result-icon">
                      {submissionResult.correct ? '✅' : '❌'}
                    </div>
                     <div className="result-content">
                       <h4>{submissionResult.correct ? t('correct') : t('incorrect')}</h4>
                      {submissionResult.explanation && (
                        <p>{submissionResult.explanation}</p>
                      )}
                      {submissionResult.xpEarned > 0 && (
                        <span className="xp-earned">+{submissionResult.xpEarned} XP</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                 <button 
                   className="btn-secondary" 
                   onClick={handleCloseExercise}
                 >
                   {t('close')}
                 </button>
                 <button 
                   className="btn-primary" 
                   onClick={handleSubmit}
                   disabled={!userAnswer || isSubmitting}
                 >
                   {isSubmitting ? t('loading') + '...' : t('submit')}
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================
// COMPOSANT RENDEUR D'EXERCICES
// =========================

function ExerciseRenderer({ exercise, userAnswer, setUserAnswer, submissionResult }) {
  const handleAnswerChange = (value) => {
    setUserAnswer(value);
  };

  switch (exercise.type) {
    case 'QCM':
      return (
        <QCMExercise 
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={handleAnswerChange}
          submissionResult={submissionResult}
        />
      );
    
    case 'TextInput':
      return (
        <TextInputExercise 
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={handleAnswerChange}
          submissionResult={submissionResult}
        />
      );
    
    case 'Code':
      return (
        <CodeExercise 
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={handleAnswerChange}
          submissionResult={submissionResult}
        />
      );
    
    case 'DragDrop':
      return (
        <DragDropExercise 
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={handleAnswerChange}
          submissionResult={submissionResult}
        />
      );
    
    case 'OrderBlocks':
      return (
        <OrderBlocksExercise 
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={handleAnswerChange}
          submissionResult={submissionResult}
        />
      );
    
    case 'FillInTheBlank':
      return (
        <FillInTheBlankExercise 
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={handleAnswerChange}
          submissionResult={submissionResult}
        />
      );
    
    case 'SpotTheError':
      return (
        <SpotTheErrorExercise 
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={handleAnswerChange}
          submissionResult={submissionResult}
        />
      );
    
    case 'Matching':
      return (
        <MatchingExercise 
          exercise={exercise}
          userAnswer={userAnswer}
          onAnswerChange={handleAnswerChange}
          submissionResult={submissionResult}
        />
      );
    
    default:
      return (
        <div className="exercise-error">
          <p>Type d'exercice non supporté: {exercise.type}</p>
        </div>
      );
  }
}

// =========================
// COMPOSANTS D'EXERCICES SPÉCIFIQUES
// =========================

function QCMExercise({ exercise, userAnswer, onAnswerChange, submissionResult }) {
  const options = exercise.options || [];
  
  return (
    <div className="exercise-qcm">
      <div className="options-container">
        {options.map((option, index) => (
          <label key={index} className="option-item">
            <input
              type="checkbox"
              checked={userAnswer?.includes(index) || false}
              onChange={(e) => {
                const currentAnswers = userAnswer || [];
                if (e.target.checked) {
                  onAnswerChange([...currentAnswers, index]);
                } else {
                  onAnswerChange(currentAnswers.filter(i => i !== index));
                }
              }}
            />
            <span className="option-text">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function TextInputExercise({ exercise, userAnswer, onAnswerChange, submissionResult }) {
  return (
    <div className="exercise-text-input">
      <textarea
        className="text-input"
        value={userAnswer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Tapez votre réponse ici..."
        rows={4}
      />
    </div>
  );
}

function CodeExercise({ exercise, userAnswer, onAnswerChange, submissionResult }) {
  return (
    <div className="exercise-code">
      <div className="code-editor">
        <textarea
          className="code-textarea"
          value={userAnswer || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Tapez votre code ici..."
          rows={10}
        />
      </div>
      {exercise.testCases && exercise.testCases.length > 0 && (
        <div className="test-cases">
          <h4>Cas de test :</h4>
          {exercise.testCases.map((testCase, index) => (
            <div key={index} className="test-case">
              <strong>Input:</strong> {testCase.input} → <strong>Expected:</strong> {testCase.expected}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DragDropExercise({ exercise, userAnswer, onAnswerChange, submissionResult }) {
  return (
    <div className="exercise-dragdrop">
      <p>Pour cet exercice, utilisez le format : [&#123;"element": "élément", "target": "cible"&#125;]</p>
      <textarea
        className="json-input"
        value={userAnswer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder='[{"element": "élément", "target": "cible"}]'
        rows={3}
      />
    </div>
  );
}

function OrderBlocksExercise({ exercise, userAnswer, onAnswerChange, submissionResult }) {
  const blocks = exercise.blocks || [];
  
  return (
    <div className="exercise-order-blocks">
      <div className="blocks-container">
        {blocks.map((block, index) => (
          <div key={block.id} className="code-block">
            <div className="block-number">{index + 1}</div>
            <pre className="block-code">{block.code}</pre>
          </div>
        ))}
      </div>
      <p>Indiquez l'ordre correct (ex: [0, 1, 2, 3])</p>
      <input
        type="text"
        className="order-input"
        value={userAnswer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="[0, 1, 2, 3]"
      />
    </div>
  );
}

function FillInTheBlankExercise({ exercise, userAnswer, onAnswerChange, submissionResult }) {
  return (
    <div className="exercise-fill-blank">
      <div className="code-snippet">
        <pre>{exercise.codeSnippet}</pre>
      </div>
      <textarea
        className="blank-input"
        value={userAnswer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Tapez les mots manquants..."
        rows={3}
      />
    </div>
  );
}

function SpotTheErrorExercise({ exercise, userAnswer, onAnswerChange, submissionResult }) {
  return (
    <div className="exercise-spot-error">
      <div className="code-snippet">
        <pre>{exercise.codeSnippet}</pre>
      </div>
      <textarea
        className="error-input"
        value={userAnswer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Décrivez l'erreur que vous avez trouvée..."
        rows={3}
      />
    </div>
  );
}

function MatchingExercise({ exercise, userAnswer, onAnswerChange, submissionResult }) {
  return (
    <div className="exercise-matching">
      <p>Format : [&#123;"prompt": "prompt-id", "match": "match-id"&#125;]</p>
      <textarea
        className="json-input"
        value={userAnswer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder='[{"prompt": "prompt-id", "match": "match-id"}]'
        rows={4}
      />
    </div>
  );
}