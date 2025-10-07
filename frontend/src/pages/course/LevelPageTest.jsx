import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExerciseAnswerInterface from '../../components/ExerciseAnswerInterface';
import ExerciseHeader from '../../components/ui/ExerciseHeader';
import SubmissionPanel from '../../components/ui/SubmissionPanel';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import '../../components/ExerciseStyles.css';

// Données de test pour simuler un niveau avec exercices
const testLevel = {
  _id: 'test-level-1',
  title: 'Niveau de Test - Algorithmes',
  translations: {
    fr: { title: 'Niveau de Test - Algorithmes' },
    en: { title: 'Test Level - Algorithms' },
    ar: { title: 'مستوى الاختبار - الخوارزميات' }
  },
  exercises: [
    {
      _id: 'ex1',
      name: 'Tri par sélection',
      type: 'Algorithm',
      question: 'Implémentez l\'algorithme de tri par sélection',
      points: 15,
      difficulty: 'medium',
      timeLimit: 20,
      attemptsAllowed: 3,
      hint: 'Commencez par trouver le plus petit élément',
      algorithmSteps: [
        { id: '1', step: 'Trouver le plus petit élément' },
        { id: '2', step: 'Échanger avec le premier élément' },
        { id: '3', step: 'Répéter pour le reste du tableau' }
      ],
      solutions: [['1', '2', '3']]
    },
    {
      _id: 'ex2',
      name: 'Programme Hello World',
      type: 'Code',
      question: 'Écrivez un programme qui affiche "Hello World"',
      points: 10,
      difficulty: 'easy',
      timeLimit: 10,
      attemptsAllowed: 3,
      hint: 'Utilisez console.log()',
      language: 'javascript',
      codeSnippet: '// Votre code ici',
      testCases: [
        { input: [], expected: 'Hello World', public: true, points: 10 }
      ],
      solutions: ['console.log("Hello World");']
    },
    {
      _id: 'ex3',
      name: 'Question à choix multiple',
      type: 'QCM',
      question: 'Quelle est la complexité temporelle du tri par sélection ?',
      points: 5,
      difficulty: 'easy',
      timeLimit: 5,
      attemptsAllowed: 2,
      hint: 'Pensez au nombre de comparaisons',
      options: [
        { id: 'a', text: 'O(n)' },
        { id: 'b', text: 'O(n log n)' },
        { id: 'c', text: 'O(n²)' },
        { id: 'd', text: 'O(log n)' }
      ],
      solutions: ['c']
    },
    {
      _id: 'ex4',
      name: 'Ordre des blocs',
      type: 'OrderBlocks',
      question: 'Remettez les blocs dans le bon ordre pour créer un programme valide',
      points: 8,
      difficulty: 'medium',
      timeLimit: 15,
      attemptsAllowed: 3,
      hint: 'Pensez à l\'ordre d\'exécution',
      blocks: [
        { id: '1', code: 'let x = 5;' },
        { id: '2', code: 'console.log(x);' },
        { id: '3', code: 'x = x + 1;' }
      ],
      solutions: [['1', '3', '2']]
    }
  ]
};

const LevelPageTest = () => {
  const navigate = useNavigate();
  const { levelId } = useParams();
  
  // États pour les exercices
  const [exercises] = useState(testLevel.exercises);
  const [activeExercise, setActiveExercise] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exerciseError, setExerciseError] = useState(null);
  const [showExercises, setShowExercises] = useState(true);
  const [completedExercises, setCompletedExercises] = useState({});

  // Get user ID helper
  const getUserId = () => {
    const stored = localStorage.getItem('userId');
    if (stored) return stored;
    const newId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', newId);
    return newId;
  };

  // Submit exercise (simulation)
  const submitExercise = async (exerciseId, answer, extraData = {}) => {
    try {
      setIsSubmitting(true);
      setExerciseError(null);

      // Simulation d'une soumission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulation d'un résultat
      const isCorrect = Math.random() > 0.3; // 70% de chance de réussite
      const pointsEarned = isCorrect ? (activeExercise?.points || 10) : Math.floor((activeExercise?.points || 10) * 0.3);
      
      const result = {
        correct: isCorrect,
        pointsEarned,
        pointsMax: activeExercise?.points || 10,
        xpEarned: pointsEarned,
        explanation: isCorrect ? 'Excellente réponse !' : 'Presque ! Essayez encore.',
        details: {
          type: activeExercise?.type,
          user: answer,
          correct: activeExercise?.solutions?.[0]
        }
      };
      
      setSubmissionResult(result);
      
      // Mark as completed locally
      const updated = { ...completedExercises };
      updated[exerciseId] = {
        completed: result.correct,
        pointsEarned: result.pointsEarned,
        pointsMax: result.pointsMax,
        xpEarned: result.xpEarned,
        completedAt: new Date().toISOString()
      };
      setCompletedExercises(updated);

      return result;
    } catch (e) {
      console.error('Erreur de soumission:', e);
      setExerciseError(e.message);
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle exercise submission
  const handleSubmitExercise = async () => {
    if (!activeExercise || (!userAnswer && activeExercise.type !== 'Code')) return;
    
    try {
      let submissionData = userAnswer;
      let extraData = {};

      // Special handling for Code exercises
      if (activeExercise.type === 'Code' && activeExercise._meta?.manualPass) {
        extraData.passed = true;
      }

      await submitExercise(activeExercise._id, submissionData, extraData);
    } catch (e) {
      // Error is already handled in submitExercise
    }
  };

  // Handle test code
  const handleTestCode = async (code) => {
    // Simulation of code testing
    return {
      success: true,
      message: 'Code exécuté avec succès',
      details: {
        lines: code.split('\n').length,
        language: activeExercise?.language || 'javascript'
      }
    };
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)',
      fontFamily: 'Inter, system-ui'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgb(108, 79, 242)',
        backdropFilter: 'blur(8px)',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div 
            onClick={() => navigate('/dashboard')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              gap: '8px'
            }}
          >
            <div style={{ fontSize: '24px' }}>🚀</div>
            <span style={{ 
              color: 'white', 
              fontWeight: '700', 
              fontSize: '18px' 
            }}>
              GenesisCode - Test
            </span>
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.15rem',
            color: '#FFFFFFFF',
            fontWeight: 700
          }}>
            {testLevel.translations.fr.title}
          </h1>
        </div>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button 
            onClick={() => setShowExercises(!showExercises)}
            style={{
              background: showExercises ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #06b6d4)',
              color: 'white',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            📝 {showExercises ? 'Masquer' : 'Afficher'} Exercices
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: showExercises ? '1fr 1fr' : '1fr',
        height: 'calc(100vh - 64px)'
      }}>
        {/* Content Section */}
        <section style={{ 
          position: 'relative',
          background: '#fff',
          margin: 0,
          padding: 40,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', maxWidth: 600 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
            <h2 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>
              {testLevel.translations.fr.title}
            </h2>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>
              Cette page de test démontre l'intégration des composants d'exercices 
              avec la page LevelPage. Cliquez sur "Afficher Exercices" pour voir 
              les exercices en action.
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 12,
              display: 'inline-block',
              fontWeight: 600
            }}>
              {exercises.length} exercices disponibles
            </div>
          </div>
        </section>

        {/* Exercise Section */}
        {showExercises && (
          <section style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.95) 100%)',
            borderLeft: '1px solid rgba(15,23,42,0.06)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflow: 'auto'
          }}>
            {/* Exercise Header */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 16,
              border: '1px solid rgba(15,23,42,0.04)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#0f172a'
              }}>
                📝 Exercices du Niveau
              </h3>
              <div style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap'
              }}>
                {exercises.map((exercise, index) => {
                  const isCompleted = completedExercises[exercise._id]?.completed || false;
                  const progress = completedExercises[exercise._id];
                  
                  return (
                    <button
                      key={exercise._id}
                      onClick={() => {
                        setActiveExercise(exercise);
                        setUserAnswer(null);
                        setSubmissionResult(null);
                        setExerciseError(null);
                      }}
                      style={{
                        background: isCompleted 
                          ? 'linear-gradient(135deg, #10b981, #06b6d4)' 
                          : 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      {isCompleted ? '✅' : '📝'} {exercise.name}
                      {progress && (
                        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                          ({progress.pointsEarned}/{progress.pointsMax})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Exercise */}
            {activeExercise && (
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 20,
                border: '1px solid rgba(15,23,42,0.04)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}>
                {/* Exercise Header */}
                <ExerciseHeader
                  title={activeExercise.name}
                  difficulty={activeExercise.difficulty}
                  points={activeExercise.points}
                  type={activeExercise.type}
                  timeLimit={activeExercise.timeLimit}
                />

                {/* Exercise Content */}
                <div style={{ flex: 1 }}>
                  <ExerciseAnswerInterface
                    exercise={activeExercise}
                    answer={userAnswer}
                    onAnswer={setUserAnswer}
                    onSubmit={handleSubmitExercise}
                    onTest={handleTestCode}
                    attempts={0}
                    maxAttempts={activeExercise.attemptsAllowed || 3}
                    isSubmitting={isSubmitting}
                    submissionResult={submissionResult}
                    error={exerciseError}
                  />
                </div>

                {/* Submission Panel */}
                <SubmissionPanel
                  onSubmit={handleSubmitExercise}
                  result={submissionResult}
                  isSubmitting={isSubmitting}
                  attemptsAllowed={activeExercise.attemptsAllowed || 3}
                  currentAttempts={0}
                  userAnswer={userAnswer}
                />

                {/* Close Exercise Button */}
                <button
                  onClick={() => {
                    setActiveExercise(null);
                    setUserAnswer(null);
                    setSubmissionResult(null);
                    setExerciseError(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(15,23,42,0.1)',
                    color: '#6b7280',
                    padding: '8px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  ✕ Fermer l'exercice
                </button>
              </div>
            )}

            {/* No Exercise Selected */}
            {!activeExercise && (
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 40,
                border: '1px solid rgba(15,23,42,0.04)',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>
                  Sélectionnez un exercice
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Cliquez sur un exercice ci-dessus pour commencer
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default LevelPageTest;


