import React, { useState } from 'react';
import ExerciseAnswerInterface from './ExerciseAnswerInterface';

/**
 * Composant de test pour vérifier l'interface d'exercices
 */
export default function TestExerciseInterface() {
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);

  // Exercice de test QCM
  const testExercise = {
    _id: 'test-qcm',
    name: 'Test QCM - Algorithmes de tri',
    type: 'QCM',
    question: 'Quels sont les algorithmes de tri les plus efficaces ?',
    points: 10,
    difficulty: 'medium',
    options: [
      'Tri à bulles',
      'Tri rapide (QuickSort)',
      'Tri par insertion',
      'Tri par sélection',
      'Tri par fusion (MergeSort)'
    ],
    solutions: [1, 4], // QuickSort et MergeSort
    allowPartial: true,
    attemptsAllowed: 3
  };

  // Exercice de test Code
  const testCodeExercise = {
    _id: 'test-code',
    name: 'Test Code - Fonction de tri',
    type: 'Code',
    question: 'Écrivez une fonction qui trie un tableau d\'entiers en ordre croissant.',
    points: 15,
    difficulty: 'hard',
    codeSnippet: 'function trierTableau(tableau) {\n  // Votre code ici\n}',
    language: 'javascript',
    testCases: [
      { input: [3, 1, 4, 1, 5], expected: [1, 1, 3, 4, 5], public: true },
      { input: [5, 2, 8, 1], expected: [1, 2, 5, 8], public: true }
    ],
    attemptsAllowed: 3
  };

  // Exercice de test Scratch
  const testScratchExercise = {
    _id: 'test-scratch',
    name: 'Test Scratch - Programme de dessin',
    type: 'ScratchBlocks',
    question: 'Créez un programme qui dessine un carré avec Scratch.',
    points: 12,
    difficulty: 'easy',
    scratchBlocks: [
      { category: 'motion', text: 'Aller à x:0 y:0', icon: '🏃' },
      { category: 'motion', text: 'S\'orienter à 90°', icon: '🔄' },
      { category: 'motion', text: 'Avancer de 100 pas', icon: '👟' },
      { category: 'motion', text: 'Tourner de 90°', icon: '🔄' },
      { category: 'motion', text: 'Avancer de 100 pas', icon: '👟' },
      { category: 'motion', text: 'Tourner de 90°', icon: '🔄' },
      { category: 'motion', text: 'Avancer de 100 pas', icon: '👟' },
      { category: 'motion', text: 'Tourner de 90°', icon: '🔄' },
      { category: 'motion', text: 'Avancer de 100 pas', icon: '👟' }
    ],
    solutions: [
      { category: 'motion', text: 'Aller à x:0 y:0', icon: '🏃' },
      { category: 'motion', text: 'S\'orienter à 90°', icon: '🔄' },
      { category: 'motion', text: 'Avancer de 100 pas', icon: '👟' },
      { category: 'motion', text: 'Tourner de 90°', icon: '🔄' },
      { category: 'motion', text: 'Avancer de 100 pas', icon: '👟' },
      { category: 'motion', text: 'Tourner de 90°', icon: '🔄' },
      { category: 'motion', text: 'Avancer de 100 pas', icon: '👟' },
      { category: 'motion', text: 'Tourner de 90°', icon: '🔄' },
      { category: 'motion', text: 'Avancer de 100 pas', icon: '👟' }
    ],
    attemptsAllowed: 3
  };

  const [currentExercise, setCurrentExercise] = useState(testExercise);

  const handleAnswer = (answer) => {
    console.log('Réponse soumise:', answer);
    setResult({
      correct: true,
      pointsEarned: currentExercise.points,
      pointsMax: currentExercise.points,
      xpEarned: currentExercise.points,
      explanation: 'Bonne réponse !'
    });
    setAttempts(prev => prev + 1);
  };

  const handleTest = async (userAnswer) => {
    console.log('Test de code:', userAnswer);
    return {
      success: true,
      message: 'Code exécuté avec succès',
      details: {
        lines: userAnswer.split('\n').length,
        language: currentExercise.language || 'javascript'
      }
    };
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Test de l'interface d'exercices</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Sélectionner un type d'exercice :</h3>
        <button 
          onClick={() => setCurrentExercise(testExercise)}
          style={{ margin: '5px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          QCM
        </button>
        <button 
          onClick={() => setCurrentExercise(testCodeExercise)}
          style={{ margin: '5px', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Code
        </button>
        <button 
          onClick={() => setCurrentExercise(testScratchExercise)}
          style={{ margin: '5px', padding: '10px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '5px' }}
        >
          Scratch
        </button>
      </div>

      <ExerciseAnswerInterface
        exercise={currentExercise}
        onAnswer={handleAnswer}
        onTest={handleTest}
        attempts={attempts}
        maxAttempts={currentExercise.attemptsAllowed || 3}
        isSubmitting={false}
      />

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: result.correct ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.correct ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px'
        }}>
          <h3>Résultat :</h3>
          <p>Correct: {result.correct ? 'Oui' : 'Non'}</p>
          <p>Points: {result.pointsEarned}/{result.pointsMax}</p>
          <p>XP: {result.xpEarned}</p>
          {result.explanation && <p>Explication: {result.explanation}</p>}
        </div>
      )}
    </div>
  );
}
