import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Button,
  Card,
  CardBody,
  Accordion,
  AccordionItem,
  ScrollShadow,
  Spinner,
  Chip
} from "@nextui-org/react";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconBulb,
  IconPlayerPlay,
  IconBrain,
  IconTrophy,
  IconChevronRight
} from '@tabler/icons-react';

import ExerciseAnswerInterface from '../../components/ExerciseAnswerInterface';
import { getApiUrl } from '../../utils/apiConfig';

const API_BASE = getApiUrl('/api/courses');

// Helper to get user ID
const getUserId = () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    console.warn('[ExerciseWorkspace] No userId found in localStorage. User must login.');
    return null;
  }
  return userId;
};

// Execute code tests for Code exercises
const executeCodeTests = (code, testCases) => {
  console.log('[executeCodeTests] Starting with:', { code, codeType: typeof code, testCases });
  const tests = [];
  let passedCount = 0;

  // Extract code string if userAnswer is an object
  const codeString = typeof code === 'string' ? code : (code?.code || '');
  console.log('[executeCodeTests] Extracted codeString:', codeString);

  if (!codeString.trim()) {
    // No code provided, all tests fail
    for (const testCase of testCases) {
      tests.push({
        input: testCase.input,
        expected: String(testCase.expected),
        actual: 'Error: No code provided',
        passed: false,
        points: testCase.points || 0,
        public: testCase.public !== false
      });
    }
    return {
      tests,
      passedCount: 0,
      totalCount: testCases.length,
      allPassed: false
    };
  }

  try {
    // Extract function name from the first test case to know which function to call
    const firstTestCase = testCases[0];
    console.log('[executeCodeTests] First test case:', firstTestCase);

    // Handle different input formats: string "sum(2, 3)" or array [2, 3]
    let expectedFuncName = null;
    let testInputFormat = 'string'; // 'string' or 'array'

    if (typeof firstTestCase.input === 'string') {
      const funcNameMatch = String(firstTestCase.input).match(/(\w+)\(/);
      expectedFuncName = funcNameMatch ? funcNameMatch[1] : null;
      testInputFormat = 'string';
    } else if (Array.isArray(firstTestCase.input)) {
      // If input is an array, try to extract function name from code
      const funcMatch = codeString.match(/function\s+(\w+)\s*\(/);
      expectedFuncName = funcMatch ? funcMatch[1] : null;
      testInputFormat = 'array';
    }

    console.log('[executeCodeTests] Expected function name:', expectedFuncName, 'Format:', testInputFormat);

    if (!expectedFuncName) {
      throw new Error('Invalid test case format. Expected: functionName(arg1, arg2, ...) or function definition in code');
    }

    // Execute the code and extract the function
    // For function declarations like "function sum(a, b) { return a + b; }"
    // we need to execute the code first, then access the function
    let func;
    try {
      // Method: Execute the code, then return the function by name
      // Function declarations are hoisted, so they're available after execution
      const getFunction = new Function(`
        ${codeString}
        return ${expectedFuncName};
      `);

      func = getFunction();
      console.log('[executeCodeTests] Extracted function:', func, typeof func);

    } catch (e) {
      console.error('[executeCodeTests] Error extracting function:', e);
      throw new Error(`Function "${expectedFuncName}" not found or could not be extracted from code. Error: ${e.message}`);
    }

    if (!func || typeof func !== 'function') {
      throw new Error(`Function "${expectedFuncName}" not found in code. Make sure you define it correctly (e.g., function ${expectedFuncName}(...) { ... }).`);
    }

    console.log('[executeCodeTests] Successfully extracted function:', func);

    // Run all tests
    for (const testCase of testCases) {
      try {
        console.log('[executeCodeTests] Processing test case:', testCase);
        let args = [];

        // Parse input based on format
        if (testInputFormat === 'string') {
          // Parse input (e.g., "sum(2, 3)" -> call sum with 2, 3)
          const match = String(testCase.input).match(/(\w+)\((.*)\)/);
          if (!match) {
            tests.push({
              input: testCase.input,
              expected: String(testCase.expected),
              actual: 'Error: Invalid test format. Expected format: functionName(arg1, arg2, ...)',
              passed: false,
              points: testCase.points || 0,
              public: testCase.public !== false
            });
            continue;
          }
          args = match[2].split(',').map(arg => {
            const trimmed = arg.trim();
            // Try to parse as number, otherwise keep as string
            const num = Number(trimmed);
            return isNaN(num) || trimmed !== String(num) ? trimmed.replace(/['"]/g, '') : num;
          });
        } else if (testInputFormat === 'array') {
          // Input is already an array
          args = Array.isArray(testCase.input) ? testCase.input : [testCase.input];
        } else {
          // Try to use input directly as arguments
          args = Array.isArray(testCase.input) ? testCase.input : [testCase.input];
        }

        console.log('[executeCodeTests] Calling function with args:', args);

        // Execute the function
        const result = func(...args);
        const actual = String(result);
        const expected = String(testCase.expected);
        const passed = actual === expected;

        console.log('[executeCodeTests] Test result:', {
          input: testCase.input,
          args,
          result,
          actual,
          expected,
          passed
        });

        if (passed) passedCount++;

        tests.push({
          input: testCase.input,
          expected,
          actual,
          passed,
          points: testCase.points || 0,
          public: testCase.public !== false
        });

      } catch (error) {
        tests.push({
          input: testCase.input,
          expected: String(testCase.expected),
          actual: `Error: ${error.message}`,
          passed: false,
          points: testCase.points || 0,
          public: testCase.public !== false
        });
      }
    }
  } catch (error) {
    // If code execution fails completely, mark all tests as failed
    for (const testCase of testCases) {
      tests.push({
        input: testCase.input,
        expected: String(testCase.expected),
        actual: `Error: ${error.message}`,
        passed: false,
        points: testCase.points || 0,
        public: testCase.public !== false
      });
    }
  }

  return {
    tests,
    passedCount,
    totalCount: testCases.length,
    allPassed: passedCount === testCases.length
  };
};

export default function ExerciseWorkspace() {
  const { levelId, exerciseId } = useParams();
  const navigate = useNavigate();

  // State
  const [level, setLevel] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userAnswer, setUserAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [attempts, setAttempts] = useState(0);

  // Layout state
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE}/levels/${levelId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!res.ok) throw new Error('Impossible de charger le niveau');
      const levelData = await res.json();
      setLevel(levelData);

      const ex = levelData.exercises?.find(e => e._id === exerciseId);
      if (!ex) throw new Error('Exercice introuvable');

      const normalizedEx = {
        ...ex,
        name: ex.name || ex.translations?.fr?.name || 'Exercice',
        question: ex.question || ex.translations?.fr?.question || '',
        explanation: ex.explanation || ex.translations?.fr?.explanation || ''
      };

      setExercise(normalizedEx);
      setUserAnswer(null);
      setSubmissionResult(null);
      setAttempts(0);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [levelId, exerciseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Resize
  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth > 20 && newWidth < 80) setLeftPanelWidth(newWidth);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Submit Handler
  const handleSubmit = async () => {
    if (!exercise) return;

    // Check if user has provided an answer
    if (!userAnswer || (typeof userAnswer === 'string' && !userAnswer.trim())) {
      alert('Veuillez écrire du code avant de soumettre.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      // Prepare submission payload
      let payload = {
        answer: userAnswer,
        userId: getUserId()
      };

      // For Code exercises, execute tests first
      if (exercise.type === 'Code' && exercise.testCases && exercise.testCases.length > 0) {
        console.log('[ExerciseWorkspace] Executing code tests:', {
          userAnswer,
          userAnswerType: typeof userAnswer,
          testCases: exercise.testCases
        });
        const testResults = executeCodeTests(userAnswer, exercise.testCases);
        console.log('[ExerciseWorkspace] Test results:', testResults);
        payload.passed = testResults.allPassed;
        payload.passedCount = testResults.passedCount;
        payload.totalCount = testResults.totalCount;
        payload.tests = testResults.tests;
      }

      const res = await fetch(`${API_BASE}/exercises/${exercise._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      setSubmissionResult(result);
      setAttempts(prev => prev + 1);

      if (result.correct) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        const completed = JSON.parse(localStorage.getItem('completedExercises') || '{}');
        completed[exercise._id] = { completed: true, pointsEarned: result.pointsEarned };
        localStorage.setItem('completedExercises', JSON.stringify(completed));
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Next Exercise Logic
  const handleNextExercise = () => {
    if (!level || !exercise) return;
    const currentIndex = level.exercises.findIndex(e => e._id === exercise._id);
    if (currentIndex < level.exercises.length - 1) {
      const nextEx = level.exercises[currentIndex + 1];
      navigate(`/courses/levels/${levelId}/exercises/${nextEx._id}`);
    } else {
      navigate(`/courses/levels/${levelId}/exercises`);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Spinner size="lg" label="Chargement de l'espace de travail..." color="primary" />
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
      <IconX size={48} className="text-danger" />
      <h2 className="text-xl font-bold">Une erreur est survenue</h2>
      <p className="text-default-500">{error}</p>
      <Button color="primary" onPress={() => navigate(`/courses/levels/${levelId}`)}>
        Retour au niveau
      </Button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-divider flex items-center justify-between px-4 bg-content1/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={() => navigate(`/courses/levels/${levelId}/exercises`)}
          >
            <IconArrowLeft size={20} />
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-bold">{level?.title}</span>
            <span className="text-tiny text-default-500 flex items-center gap-1">
              <IconChevronRight size={12} /> {exercise?.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Chip
            variant="flat"
            color={exercise?.difficulty === 'easy' ? 'success' : exercise?.difficulty === 'hard' ? 'danger' : 'warning'}
            size="sm"
          >
            {exercise?.difficulty === 'easy' ? 'Facile' : exercise?.difficulty === 'hard' ? 'Difficile' : 'Moyen'}
          </Chip>
          <Chip variant="flat" color="primary" size="sm" startContent={<IconTrophy size={14} />}>
            {exercise?.points} pts
          </Chip>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative" ref={containerRef}>

        {/* Left Panel: Context & Question */}
        <div
          className="h-full overflow-hidden flex flex-col bg-content1"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <ScrollShadow className="flex-1 p-6">
            <div className="prose dark:prose-invert max-w-none">
              <h1 className="text-2xl font-bold mb-4">{exercise?.name}</h1>

              <Card className="mb-6 bg-primary-50/50 border-primary-100 border">
                <CardBody>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <IconBrain size={20} className="text-primary" />
                    Énoncé
                  </h3>
                  <div className="whitespace-pre-wrap text-default-700 leading-relaxed">
                    {exercise?.question}
                  </div>
                </CardBody>
              </Card>

              {exercise?.hint && (
                <Accordion variant="splitted" className="px-0">
                  <AccordionItem
                    key="1"
                    aria-label="Indice"
                    title={<span className="text-sm font-medium">Besoin d'un indice ?</span>}
                    startContent={<IconBulb size={18} className="text-warning" />}
                  >
                    <p className="text-default-500 text-sm">{exercise.hint}</p>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </ScrollShadow>
        </div>

        {/* Resizer Handle */}
        <div
          className={`w-1 h-full cursor-col-resize hover:bg-primary active:bg-primary transition-colors z-10 flex items-center justify-center group ${isDragging ? 'bg-primary' : 'bg-divider'}`}
          onMouseDown={handleMouseDown}
        >
          <div className="h-8 w-1 bg-default-400 rounded-full group-hover:bg-white transition-colors" />
        </div>

        {/* Right Panel: Interaction */}
        <div
          className="h-full overflow-hidden flex flex-col bg-background relative"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <div className="flex-1 overflow-hidden relative flex flex-col">
            {/* Exercise Interface */}
            <div className="flex-1 overflow-y-auto p-6">
              <ExerciseAnswerInterface
                exercise={exercise}
                answer={userAnswer}
                onAnswer={setUserAnswer}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submissionResult={submissionResult}
              />
            </div>

            {/* Submission Result Overlay */}
            <AnimatePresence>
              {submissionResult && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className={`absolute bottom-0 left-0 right-0 p-4 border-t border-divider backdrop-blur-xl z-20 ${submissionResult.correct ? 'bg-success-50/90 dark:bg-success-900/20' : 'bg-danger-50/90 dark:bg-danger-900/20'
                    }`}
                >
                  <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${submissionResult.correct ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                        {submissionResult.correct ? <IconCheck size={24} /> : <IconX size={24} />}
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg ${submissionResult.correct ? 'text-success' : 'text-danger'}`}>
                          {submissionResult.correct ? 'Excellent travail !' : 'Pas tout à fait...'}
                        </h4>
                        <p className="text-sm text-default-500">
                          {submissionResult.message || (submissionResult.correct ? "Vous avez réussi cet exercice." : "Essayez encore, vous pouvez y arriver !")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {!submissionResult.correct && (
                        <Button
                          variant="flat"
                          color="default"
                          onPress={() => setSubmissionResult(null)}
                        >
                          Réessayer
                        </Button>
                      )}
                      {submissionResult.correct && (
                        <Button
                          color="primary"
                          endContent={<IconArrowLeft className="rotate-180" />}
                          onPress={handleNextExercise}
                        >
                          Exercice suivant
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Action Bar */}
          {!submissionResult && (
            <div className="h-16 border-t border-divider bg-content1/50 flex items-center justify-between px-6">
              <div className="text-sm text-default-500">
                Tentatives: <span className="font-mono font-bold text-foreground">{attempts}</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="flat"
                  color="default"
                  onPress={() => setUserAnswer(null)}
                >
                  Réinitialiser
                </Button>
                <Button
                  color="primary"
                  startContent={<IconPlayerPlay size={18} />}
                  isLoading={isSubmitting}
                  onPress={handleSubmit}
                  className="shadow-lg shadow-primary/20"
                >
                  Soumettre
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
