import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Import exercise components
import QCMExercise from './exercises/QCMExercise';
import CodeExercise from './exercises/CodeExercise';
import FillInTheBlankExercise from './exercises/FillInTheBlankExercise';
import DragDropExercise from './exercises/DragDropExercise';
import MatchingExercise from './exercises/MatchingExercise';
import AlgorithmExercise from './exercises/AlgorithmExercise';
import DebugExercise from './exercises/DebugExercise';
import TraceExercise from './exercises/TraceExercise';
import OptimizationExercise from './exercises/OptimizationExercise';
import ComplexityExercise from './exercises/ComplexityExercise';
import DataStructureExercise from './exercises/DataStructureExercise';
import ConceptMappingExercise from './exercises/ConceptMappingExercise';
import FlowChartExercise from './exercises/FlowChartExercise';
import PseudoCodeExercise from './exercises/PseudoCodeExercise';
import VisualProgrammingExercise from './exercises/VisualProgrammingExercise';
import ScratchBlocksExercise from './exercises/ScratchBlocksExercise';
import ScratchExercise from './exercises/ScratchExercise';
import OrderBlocksExercise from './exercises/OrderBlocksExercise';
import SpotTheErrorExercise from './exercises/SpotTheErrorExercise';
import TextInputExercise from './exercises/TextInputExercise';
import CodeCompletionExercise from './exercises/CodeCompletionExercise';
import CodeOutputExercise from './exercises/CodeOutputExercise';
import AlgorithmStepsExercise from './exercises/AlgorithmStepsExercise';
import WebProjectExercise from './exercises/WebProjectExercise';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
`;

const ExerciseHeader = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
`;

const ExerciseTitle = styled.h2`
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
`;

const ExerciseDescription = styled.div`
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ExerciseMeta = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const MetaBadge = styled.span`
  background: ${props => {
    switch (props.type) {
      case 'difficulty': return props.level === 'easy' ? '#dcfce7' : props.level === 'medium' ? '#fef3c7' : '#fee2e2';
      case 'points': return '#e0e7ff';
      case 'type': return '#f0f9ff';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'difficulty': return props.level === 'easy' ? '#166534' : props.level === 'medium' ? '#92400e' : '#991b1b';
      case 'points': return '#3730a3';
      case 'type': return '#0c4a6e';
      default: return '#475569';
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const ExerciseContent = styled.div`
  margin-bottom: 2rem;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff40;
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default function UnifiedExerciseInterface({
  exercise,
  onSubmissionResult,
  onError
}) {
  const [userAnswer, setUserAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Map exercise types to components
  const exerciseComponents = {
    'QCM': QCMExercise,
    'code': CodeExercise,
    'fill-in-the-blank': FillInTheBlankExercise,
    'drag-drop': DragDropExercise,
    'matching': MatchingExercise,
    'algorithm': AlgorithmExercise,
    'debug': DebugExercise,
    'trace': TraceExercise,
    'optimization': OptimizationExercise,
    'complexity': ComplexityExercise,
    'data-structure': DataStructureExercise,
    'concept-mapping': ConceptMappingExercise,
    'flowchart': FlowChartExercise,
    'pseudocode': PseudoCodeExercise,
    'visual-programming': VisualProgrammingExercise,
    'scratch-blocks': ScratchBlocksExercise,
    'Scratch': ScratchExercise,
    'scratch': ScratchExercise,
    'order-blocks': OrderBlocksExercise,
    'spot-the-error': SpotTheErrorExercise,
    'text-input': TextInputExercise,
    'code-completion': CodeCompletionExercise,
    'code-output': CodeOutputExercise,
    'algorithm-steps': AlgorithmStepsExercise,
    'WebProject': WebProjectExercise
  };

  const handleAnswerChange = useCallback((answer) => {
    setUserAnswer(answer);
    setHasSubmitted(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!userAnswer) {
      onError(new Error('Veuillez répondre à l\'exercice avant de soumettre'));
      return;
    }

    try {
      setIsSubmitting(true);

      // Simulate API call
      const result = await new Promise((resolve) => {
        setTimeout(() => {
          // Simple validation logic
          const isCorrect = Math.random() > 0.3; // 70% success rate for demo
          resolve({
            correct: isCorrect,
            pointsEarned: isCorrect ? (exercise.points || 10) : 0,
            pointsMax: exercise.points || 10,
            xpEarned: isCorrect ? Math.floor((exercise.points || 10) / 2) : 0,
            explanation: isCorrect
              ? 'Excellent travail ! Votre réponse est correcte.'
              : 'Pas tout à fait. Réessayez en réfléchissant à la logique de l\'exercice.',
            details: {
              type: exercise.type,
              user: userAnswer,
              correct: isCorrect
            }
          });
        }, 1000);
      });

      setHasSubmitted(true);
      onSubmissionResult(result);
    } catch (error) {
      onError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [userAnswer, exercise, onSubmissionResult, onError]);

  const getDifficultyLevel = (difficulty) => {
    if (difficulty <= 3) return 'easy';
    if (difficulty <= 6) return 'medium';
    return 'hard';
  };

  const getDifficultyLabel = (difficulty) => {
    if (difficulty <= 3) return 'Facile';
    if (difficulty <= 6) return 'Moyen';
    return 'Difficile';
  };

  const ExerciseComponent = exerciseComponents[exercise.type] || CodeExercise;

  return (
    <Container>
      <ExerciseHeader>
        <ExerciseTitle>{exercise.name}</ExerciseTitle>
        <ExerciseDescription>
          {exercise.description || 'Complétez cet exercice pour progresser dans votre apprentissage.'}
        </ExerciseDescription>
        <ExerciseMeta>
          <MetaBadge type="type">{exercise.type}</MetaBadge>
          <MetaBadge type="difficulty" level={getDifficultyLevel(exercise.difficulty || 3)}>
            {getDifficultyLabel(exercise.difficulty || 3)}
          </MetaBadge>
          <MetaBadge type="points">{exercise.points || 10} points</MetaBadge>
        </ExerciseMeta>
      </ExerciseHeader>

      <ExerciseContent>
        <ExerciseComponent
          exercise={exercise}
          onAnswerChange={handleAnswerChange}
          disabled={hasSubmitted}
        />
      </ExerciseContent>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <SubmitButton
          onClick={handleSubmit}
          disabled={!userAnswer || isSubmitting || hasSubmitted}
        >
          {isSubmitting && <LoadingSpinner />}
          {hasSubmitted ? 'Exercice terminé' : 'Soumettre la réponse'}
        </SubmitButton>
      </div>
    </Container>
  );
}
