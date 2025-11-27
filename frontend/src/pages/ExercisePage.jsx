import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';
import ClientPageLayout from '../components/layout/ClientPageLayout';

// Composants d'exercice
import CodeExercise from '../components/exercises/CodeExercise';
import QCMExercise from '../components/exercises/QCMExercise';
import DebugExercise from '../components/exercises/DebugExercise';
import FlowChartExercise from '../components/exercises/FlowChartExercise';
import DragDropExercise from '../components/exercises/DragDropExercise';
import OrderBlocksExercise from '../components/exercises/OrderBlocksExercise';
import MatchingExercise from '../components/exercises/MatchingExercise';
import AlgorithmExercise from '../components/exercises/AlgorithmExercise';
import TraceExercise from '../components/exercises/TraceExercise';
import CodeCompletionExercise from '../components/exercises/CodeCompletionExercise';
import PseudoCodeExercise from '../components/exercises/PseudoCodeExercise';
import ComplexityExercise from '../components/exercises/ComplexityExercise';
import DataStructureExercise from '../components/exercises/DataStructureExercise';
import ScratchBlocksExercise from '../components/exercises/ScratchBlocksExercise';
import ConceptMappingExercise from '../components/exercises/ConceptMappingExercise';
import CodeOutputExercise from '../components/exercises/CodeOutputExercise';
import OptimizationExercise from '../components/exercises/OptimizationExercise';

// Composants UI
import ExerciseHeader from '../components/ui/ExerciseHeader';
import SubmissionPanel from '../components/ui/SubmissionPanel';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

import './ExercisePage.css';

const ExercisePage = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();

  // États
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('fr');

  // Configuration des types nécessitant un éditeur
  const CODE_BASED_TYPES = [
    'Code', 'Debug', 'CodeCompletion', 'SpotTheError',
    'PseudoCode', 'Complexity', 'Optimization', 'Trace'
  ];

  useEffect(() => {
    fetchExercise();
  }, [exerciseId]);

  const fetchExercise = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/courses/exercises/${exerciseId}`);
      setExercise(response.data);

      // Initialiser la réponse utilisateur selon le type
      initializeUserAnswer(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const initializeUserAnswer = (exerciseData) => {
    const { type, codeSnippet, options, blocks } = exerciseData;

    switch (type) {
      case 'Code':
      case 'Debug':
      case 'SpotTheError':
        setUserAnswer({ code: codeSnippet || '' });
        break;
      case 'CodeCompletion':
        setUserAnswer({ completions: {} });
        break;
      case 'QCM':
        setUserAnswer([]);
        break;
      case 'OrderBlocks':
        setUserAnswer(blocks ? blocks.map(block => block.id) : []);
        break;
      case 'ScratchBlocks':
        setUserAnswer([]);
        break;
      case 'Trace':
        setUserAnswer({ trace: [] });
        break;
      case 'Debug':
        setUserAnswer({ identifiedErrors: [], code: codeSnippet || '' });
        break;
      default:
        setUserAnswer(null);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer) return;

    try {
      setIsSubmitting(true);
      const apiUrl = getApiUrl(`/api/courses/exercises/${exerciseId}/submit`);
      const token = localStorage.getItem('token');
      const response = await axios.post(apiUrl, {
        userId: getCurrentUserId(),
        answer: prepareSubmissionAnswer()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSubmissionResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prepareSubmissionAnswer = () => {
    if (!exercise || !userAnswer) return null;

    switch (exercise.type) {
      case 'Code':
        return userAnswer.code;
      case 'Debug':
        return userAnswer.identifiedErrors || [];
      case 'CodeCompletion':
        return userAnswer.completions;
      case 'QCM':
        return userAnswer;
      case 'OrderBlocks':
        return userAnswer;
      case 'ScratchBlocks':
        return userAnswer;
      case 'Trace':
        return userAnswer.trace;
      default:
        return userAnswer;
    }
  };

  const needsCodeEditor = () => {
    return CODE_BASED_TYPES.includes(exercise?.type);
  };

  const handleCodeChange = (newCode) => {
    setUserAnswer(prev => ({ ...prev, code: newCode }));
  };

  const handleAnswerChange = (newAnswer) => {
    setUserAnswer(newAnswer);
  };

  const getCurrentUserId = () => {
    // Récupérer le vrai ID utilisateur MongoDB depuis le localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('[ExercisePage] No userId found in localStorage. User must login.');
      return null;
    }
    return userId;
  };

  return (
    <ClientPageLayout
      isLite={true}
      loading={loading}
      error={error}
      onRetry={fetchExercise}
      showBackButton={true}
      backLabel="Retour"
    >
      {exercise && (
        <div className="exercise-page">
          {/* En-tête avec métadonnées */}
          <ExerciseHeader
            title={exercise.translations?.[currentLanguage]?.name || exercise.name}
            difficulty={exercise.difficulty}
            points={exercise.points}
            type={exercise.type}
            timeLimit={exercise.timeLimit}
            attemptsAllowed={exercise.attemptsAllowed}
          />

          {/* Contenu principal */}
          <div className="exercise-layout">
            {/* Section question */}
            <section className="question-section">
              <h2>Question</h2>
              <div
                className="question-content"
                dangerouslySetInnerHTML={{
                  __html: exercise.translations?.[currentLanguage]?.question
                }}
              />

              {exercise.translations?.[currentLanguage]?.explanation && (
                <div className="explanation">
                  <h4>Explication</h4>
                  <p>{exercise.translations[currentLanguage].explanation}</p>
                </div>
              )}

              {/* Informations spécifiques selon le type */}
              {exercise.type === 'Code' && exercise.testCases && (
                <div className="test-cases-info">
                  <h4>Cas de test</h4>
                  <p>{exercise.testCases.length} cas de test disponibles</p>
                </div>
              )}

              {exercise.type === 'Debug' && exercise.debugErrors && (
                <div className="debug-info">
                  <h4>Instructions de débogage</h4>
                  <p>Identifiez et corrigez les erreurs dans le code ci-dessous.</p>
                </div>
              )}
            </section>

            {/* Section réponse */}
            <section className="answer-section">
              <ExerciseRenderer
                exercise={exercise}
                userAnswer={userAnswer}
                onAnswerChange={handleAnswerChange}
                onCodeChange={handleCodeChange}
              />
            </section>

            {/* Panel de soumission */}
            <SubmissionPanel
              onSubmit={handleSubmit}
              result={submissionResult}
              isSubmitting={isSubmitting}
              attemptsAllowed={exercise.attemptsAllowed}
              userAnswer={userAnswer}
              exerciseType={exercise.type}
            />
          </div>
        </div>
      )}
    </ClientPageLayout>
  );
};

// Composant ExerciseRenderer
const ExerciseRenderer = ({ exercise, userAnswer, onAnswerChange, onCodeChange }) => {
  const renderExerciseByType = () => {
    if (!exercise) return null;

    const commonProps = {
      exercise,
      userAnswer,
      onAnswerChange
    };

    switch (exercise.type) {
      case 'Code':
        return <CodeExercise {...commonProps} onCodeChange={onCodeChange} />;

      case 'QCM':
        return <QCMExercise {...commonProps} />;

      case 'Debug':
        return <DebugExercise {...commonProps} onCodeChange={onCodeChange} />;

      case 'DragDrop':
        return <DragDropExercise {...commonProps} />;

      case 'OrderBlocks':
        return <OrderBlocksExercise {...commonProps} />;

      case 'Matching':
        return <MatchingExercise {...commonProps} />;

      case 'Algorithm':
      case 'AlgorithmSteps':
        return <AlgorithmExercise {...commonProps} />;

      case 'FlowChart':
        return <FlowChartExercise {...commonProps} />;

      case 'Trace':
        return <TraceExercise {...commonProps} onCodeChange={onCodeChange} />;

      case 'CodeCompletion':
        return <CodeCompletionExercise {...commonProps} />;

      case 'PseudoCode':
        return <PseudoCodeExercise {...commonProps} onCodeChange={onCodeChange} />;

      case 'Complexity':
        return <ComplexityExercise {...commonProps} onCodeChange={onCodeChange} />;

      case 'DataStructure':
        return <DataStructureExercise {...commonProps} />;

      case 'ScratchBlocks':
        return <ScratchBlocksExercise {...commonProps} />;

      case 'ConceptMapping':
        return <ConceptMappingExercise {...commonProps} />;

      case 'CodeOutput':
        return <CodeOutputExercise {...commonProps} onCodeChange={onCodeChange} />;

      case 'Optimization':
        return <OptimizationExercise {...commonProps} onCodeChange={onCodeChange} />;

      case 'TextInput':
      case 'FillInTheBlank':
      case 'SpotTheError':
        return <CodeExercise {...commonProps} onCodeChange={onCodeChange} />;

      default:
        return <div className="unsupported-type">
          Type d'exercice non supporté: {exercise.type}
        </div>;
    }
  };

  return (
    <div className="exercise-renderer">
      <h3>Votre réponse</h3>
      {renderExerciseByType()}
    </div>
  );
};

export default ExercisePage;


