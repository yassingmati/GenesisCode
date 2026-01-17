import React from 'react';

// Import des composants d'exercices existants
import ExerciseAnswerInterface from './ExerciseAnswerInterface';

// Import des nouveaux composants d'exercices
import {
  AlgorithmExercise,
  FlowChartExercise,
  TraceExercise,
  DebugExercise,
  CodeCompletionExercise,
  PseudoCodeExercise,
  ComplexityExercise,
  DataStructureExercise,
  ScratchBlocksExercise,
  VisualProgrammingExercise,
  ConceptMappingExercise,
  CodeOutputExercise,
  CodeOutputExercise,
  OptimizationExercise
} from '../pages/course/NewExerciseComponents';

import WebProjectExercise from './exercises/WebProjectExercise';

// Import des composants d'exercices classiques
import QCMExercise from './exercises/QCMExercise';
import CodeExercise from './exercises/CodeExercise';
import DragDropExercise from './exercises/DragDropExercise';
import TextInputExercise from './exercises/TextInputExercise';
import FillInTheBlankExercise from './exercises/FillInTheBlankExercise';
import MatchingExercise from './exercises/MatchingExercise';
import OrderBlocksExercise from './exercises/OrderBlocksExercise';
import SpotTheErrorExercise from './exercises/SpotTheErrorExercise';
import ScratchExercise from './exercises/ScratchExercise';

/**
 * Composant ExerciseRenderer - Rendu conditionnel des exercices
 * Affiche le composant approprié selon le type d'exercice
 */
const ExerciseRenderer = ({
  exercise,
  userAnswer,
  onAnswerChange,
  onCodeChange,
  onTest,
  attempts = 0,
  maxAttempts = 3,
  isSubmitting = false,
  submissionResult = null,
  error = null
}) => {
  if (!exercise) {
    return (
      <div className="exercise-renderer">
        <div className="no-exercise">
          <p>Aucun exercice à afficher</p>
        </div>
      </div>
    );
  }

  // Props communes pour tous les composants d'exercice
  const commonProps = {
    exercise,
    userAnswer,
    onAnswerChange,
    attempts,
    maxAttempts,
    isSubmitting,
    submissionResult,
    error
  };

  // Props pour les exercices nécessitant un éditeur de code
  const codeProps = {
    ...commonProps,
    onCodeChange,
    onTest
  };

  // Rendu conditionnel selon le type d'exercice
  const renderExerciseByType = () => {
    switch (exercise.type) {
      // Exercices classiques
      case 'QCM':
        return <QCMExercise {...commonProps} />;

      case 'Code':
        return <CodeExercise {...codeProps} />;

      case 'DragDrop':
        return <DragDropExercise {...commonProps} />;

      case 'TextInput':
        return <TextInputExercise {...commonProps} />;

      case 'FillInTheBlank':
        return <FillInTheBlankExercise {...commonProps} />;

      case 'Matching':
        return <MatchingExercise {...commonProps} />;

      case 'OrderBlocks':
        return <OrderBlocksExercise {...commonProps} />;

      case 'SpotTheError':
        return <SpotTheErrorExercise {...codeProps} />;

      // Nouveaux exercices d'algorithmes et programmation
      case 'Algorithm':
      case 'AlgorithmSteps':
        return <AlgorithmExercise {...commonProps} />;

      case 'FlowChart':
        return <FlowChartExercise {...commonProps} />;

      case 'Trace':
        return <TraceExercise {...codeProps} />;

      case 'Debug':
        return <DebugExercise {...codeProps} />;

      case 'CodeCompletion':
        return <CodeCompletionExercise {...codeProps} />;

      case 'PseudoCode':
        return <PseudoCodeExercise {...codeProps} />;

      case 'Complexity':
        return <ComplexityExercise {...codeProps} />;

      case 'DataStructure':
        return <DataStructureExercise {...commonProps} />;

      case 'ScratchBlocks':
        return <ScratchBlocksExercise key={exercise._id} {...commonProps} />;

      case 'VisualProgramming':
        return <VisualProgrammingExercise {...commonProps} />;

      case 'ConceptMapping':
        return <ConceptMappingExercise {...commonProps} />;

      case 'CodeOutput':
        return <CodeOutputExercise {...codeProps} />;

      case 'Optimization':
        return <OptimizationExercise {...codeProps} />;

      case 'Scratch':
        return <ScratchExercise {...commonProps} />;

      case 'WebProject':
        return <WebProjectExercise {...commonProps} />;

      default:
        return (
          <div className="unsupported-exercise">
            <div className="unsupported-header">
              <span className="unsupported-icon">⚠️</span>
              <h3>Type d'exercice non supporté</h3>
            </div>
            <div className="unsupported-content">
              <p>Le type d'exercice <strong>{exercise.type}</strong> n'est pas encore supporté.</p>
              <p>Veuillez contacter l'administrateur pour plus d'informations.</p>
            </div>
            <div className="unsupported-details">
              <h4>Détails techniques :</h4>
              <ul>
                <li>Type d'exercice : {exercise.type}</li>
                <li>ID : {exercise._id}</li>
                <li>Points : {exercise.points || 'Non défini'}</li>
                <li>Difficulté : {exercise.difficulty || 'Non définie'}</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="exercise-renderer">
      <div className="exercise-content">
        {renderExerciseByType()}
      </div>
    </div>
  );
};

export default ExerciseRenderer;


