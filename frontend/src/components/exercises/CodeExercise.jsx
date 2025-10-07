import React, { useState, useEffect } from 'react';
import CodeEditor from '../ui/CodeEditor';

/**
 * Composant CodeExercise - Exercice de programmation
 */
const CodeExercise = ({ 
  exercise, 
  userAnswer, 
  onAnswerChange, 
  onCodeChange,
  onTest,
  attempts = 0, 
  maxAttempts = 3 
}) => {
  const [code, setCode] = useState(userAnswer?.code || exercise?.codeSnippet || '');
  const [activeTab, setActiveTab] = useState('editor');
  const [output, setOutput] = useState('');
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    onAnswerChange({ code });
  }, [code, onAnswerChange]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  const handleRunCode = async () => {
    try {
      // Simulation d'exécution de code
      const result = await simulateCodeExecution(code, exercise?.language || 'javascript');
      setOutput(result);
      setActiveTab('output');
    } catch (error) {
      setOutput(`Erreur d'exécution: ${error.message}`);
      setActiveTab('output');
    }
  };

  const simulateCodeExecution = async (code, language) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        switch (language.toLowerCase()) {
          case 'javascript':
            resolve(`Exécution JavaScript:\n${code}\n\nRésultat: Code exécuté avec succès`);
            break;
          case 'python':
            resolve(`Exécution Python:\n${code}\n\nRésultat: Script Python exécuté`);
            break;
          case 'java':
            resolve(`Exécution Java:\n${code}\n\nRésultat: Programme Java compilé et exécuté`);
            break;
          default:
            resolve(`Exécution ${language}:\n${code}\n\nRésultat: Code exécuté`);
        }
      }, 1000);
    });
  };

  const handleTest = async (userCode) => {
    if (onTest) {
      return await onTest(userCode);
    }
    return {
      success: true,
      message: 'Test simulé avec succès',
      details: {
        lines: userCode.split('\n').length,
        language: exercise?.language || 'javascript'
      }
    };
  };

  return (
    <div className="code-exercise">
      <div className="code-instruction">
        <p>Écrivez le code pour résoudre le problème suivant :</p>
        {attempts > 0 && (
          <div className="attempts-info">
            Tentatives: {attempts}/{maxAttempts}
          </div>
        )}
      </div>

      {/* Informations sur l'exercice */}
      <div className="exercise-info">
        <div className="info-item">
          <span className="info-label">Langage :</span>
          <span className="info-value">{exercise?.language || 'JavaScript'}</span>
        </div>
        {exercise?.testCases && (
          <div className="info-item">
            <span className="info-label">Tests :</span>
            <span className="info-value">{exercise.testCases.length} cas de test</span>
          </div>
        )}
        {exercise?.points && (
          <div className="info-item">
            <span className="info-label">Points :</span>
            <span className="info-value">{exercise.points}</span>
          </div>
        )}
      </div>

      {/* Onglets Éditeur/Sortie/Tests */}
      <div className="tabs-container">
        <div className="tabs-header">
          <button 
            className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            📝 Éditeur
          </button>
          <button 
            className={`tab ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => setActiveTab('output')}
          >
            📊 Sortie
          </button>
          {exercise?.testCases && (
            <button 
              className={`tab ${activeTab === 'tests' ? 'active' : ''}`}
              onClick={() => setActiveTab('tests')}
            >
              🧪 Tests
            </button>
          )}
        </div>

        <div className="tabs-content">
          {activeTab === 'editor' && (
            <div className="editor-tab">
              <CodeEditor
                exercise={exercise}
                userAnswer={code}
                setUserAnswer={handleCodeChange}
                onTest={handleTest}
                attempts={attempts}
                maxAttempts={maxAttempts}
                showSolution={showSolution}
                solution={exercise?.solution}
                language={exercise?.language || 'javascript'}
              />
            </div>
          )}

          {activeTab === 'output' && (
            <div className="output-tab">
              <div className="output-header">
                <h4>Résultat d'exécution</h4>
                <button 
                  onClick={handleRunCode}
                  className="run-button"
                  disabled={!code.trim()}
                >
                  ▶️ Exécuter le code
                </button>
              </div>
              <div className="output-content">
                <pre className="output-text">
                  {output || 'Exécutez votre code pour voir la sortie...'}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'tests' && exercise?.testCases && (
            <div className="tests-tab">
              <div className="tests-header">
                <h4>Cas de test</h4>
                <div className="tests-info">
                  {exercise.testCases.filter(tc => tc.public).length} tests publics
                </div>
              </div>
              <div className="tests-content">
                {exercise.testCases
                  .filter(tc => tc.public)
                  .map((testCase, index) => (
                    <div key={index} className="test-case">
                      <div className="test-case-header">
                        <span className="test-case-number">Test {index + 1}</span>
                        {testCase.points && (
                          <span className="test-case-points">
                            {testCase.points} points
                          </span>
                        )}
                      </div>
                      <div className="test-case-content">
                        <div className="test-input">
                          <strong>Entrée :</strong>
                          <pre>{JSON.stringify(testCase.input, null, 2)}</pre>
                        </div>
                        <div className="test-expected">
                          <strong>Sortie attendue :</strong>
                          <pre>{JSON.stringify(testCase.expected, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Solution après 3 tentatives */}
      {showSolution && exercise?.solution && (
        <div className="solution-section">
          <div className="solution-header">
            <span className="solution-icon">💡</span>
            <span className="solution-title">Solution</span>
          </div>
          <div className="solution-content">
            <pre className="solution-code">{exercise.solution}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeExercise;