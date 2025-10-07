import React, { useState } from 'react';

const DebugExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [debugSteps, setDebugSteps] = useState(userAnswer?.steps || []);
  const [currentError, setCurrentError] = useState(0);
  const [isDebugging, setIsDebugging] = useState(false);

  const getCode = () => {
    return exercise.code || '';
  };

  const getErrors = () => {
    return exercise.errors || [];
  };

  const getExpectedSteps = () => {
    return exercise.expectedSteps || [];
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const handleErrorIdentification = (errorId, errorType, description) => {
    const newStep = {
      stepNumber: debugSteps.length + 1,
      errorId,
      errorType,
      description,
      timestamp: new Date().toISOString()
    };
    
    const newSteps = [...debugSteps, newStep];
    setDebugSteps(newSteps);
    onAnswerChange({ steps: newSteps });
  };

  const handleErrorFix = (errorId, fixDescription, fixedCode) => {
    const newStep = {
      stepNumber: debugSteps.length + 1,
      errorId,
      action: 'fix',
      description: fixDescription,
      fixedCode,
      timestamp: new Date().toISOString()
    };
    
    const newSteps = [...debugSteps, newStep];
    setDebugSteps(newSteps);
    onAnswerChange({ steps: newSteps });
  };

  const handleNextError = () => {
    const errors = getErrors();
    if (currentError < errors.length - 1) {
      setCurrentError(currentError + 1);
    }
  };

  const handlePreviousError = () => {
    if (currentError > 0) {
      setCurrentError(currentError - 1);
    }
  };

  const handleReset = () => {
    setDebugSteps([]);
    setCurrentError(0);
    onAnswerChange({ steps: [] });
  };

  const handleAutoDebug = () => {
    setIsDebugging(true);
    const errors = getErrors();
    let errorIndex = 0;
    
    const debugError = () => {
      if (errorIndex < errors.length) {
        const error = errors[errorIndex];
        const newStep = {
          stepNumber: debugSteps.length + 1,
          errorId: error.id,
          errorType: error.type,
          description: `Erreur identifiée: ${error.description}`,
          timestamp: new Date().toISOString()
        };
        
        const newSteps = [...debugSteps, newStep];
        setDebugSteps(newSteps);
        onAnswerChange({ steps: newSteps });
        
        errorIndex++;
        setCurrentError(errorIndex);
        
        setTimeout(debugError, 1500);
      } else {
        setIsDebugging(false);
      }
    };
    
    debugError();
  };

  const getDebugStats = () => {
    const errors = getErrors();
    const currentSteps = debugSteps.length;
    const completionRate = errors.length > 0 ? (currentSteps / errors.length) * 100 : 0;
    
    return {
      totalErrors: errors.length,
      currentSteps,
      completionRate: Math.round(completionRate)
    };
  };

  const getErrorById = (errorId) => {
    return getErrors().find(e => e.id === errorId);
  };

  const getStepsForError = (errorId) => {
    return debugSteps.filter(s => s.errorId === errorId);
  };

  const getErrorTypes = () => {
    const errors = getErrors();
    const types = [...new Set(errors.map(e => e.type))];
    return types;
  };

  const getErrorSeverity = (errorType) => {
    const severityMap = {
      'syntax': '🔴 Critique',
      'logic': '🟡 Logique',
      'runtime': '🟠 Exécution',
      'performance': '🔵 Performance',
      'style': '🟢 Style'
    };
    return severityMap[errorType] || '⚪ Inconnu';
  };

  const code = getCode();
  const errors = getErrors();
  const expectedSteps = getExpectedSteps();
  const testCases = getTestCases();
  const stats = getDebugStats();
  const currentErrorData = errors[currentError];

  return (
    <div className="debug-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>🐛 Débogage de code</h4>
          <div className="debug-stats">
            <span className="errors-count">
              {stats.currentSteps}/{stats.totalErrors} erreurs
            </span>
            <span className="completion-rate">
              {stats.completionRate}% complété
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          <button onClick={handleReset} className="reset-btn">
            🔄 Réinitialiser
          </button>
          <button onClick={handleAutoDebug} className="auto-btn" disabled={isDebugging}>
            {isDebugging ? '⏳ Débogage...' : '▶️ Débogage automatique'}
          </button>
        </div>
      </div>

      <div className="debug-layout">
        {/* Code source */}
        <div className="code-section">
          <div className="section-header">
            <h5>📝 Code source</h5>
            <div className="code-info">
              <span className="lines-count">
                {code.split('\n').length} ligne{code.split('\n').length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="code-content">
            <pre className="code-block">{code}</pre>
          </div>
        </div>

        {/* Erreurs identifiées */}
        <div className="errors-section">
          <div className="section-header">
            <h5>🚨 Erreurs identifiées</h5>
            <div className="errors-info">
              <span className="errors-count">
                {errors.length} erreur{errors.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="errors-content">
            {errors.length === 0 ? (
              <div className="empty-errors">
                <p>Aucune erreur identifiée</p>
              </div>
            ) : (
              <div className="errors-list">
                {errors.map((error, index) => (
                  <div 
                    key={error.id} 
                    className={`error-item ${index === currentError ? 'current' : ''}`}
                    onClick={() => setCurrentError(index)}
                  >
                    <div className="error-header">
                      <span className="error-number">Erreur {index + 1}</span>
                      <span className="error-type">{error.type}</span>
                      <span className="error-severity">
                        {getErrorSeverity(error.type)}
                      </span>
                    </div>
                    
                    <div className="error-content">
                      <div className="error-description">
                        {error.description}
                      </div>
                      
                      {error.lineNumber && (
                        <div className="error-location">
                          Ligne {error.lineNumber}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contrôles de débogage */}
        <div className="debug-controls">
          <div className="controls-header">
            <h5>🎮 Contrôles de débogage</h5>
            <div className="controls-info">
              <span className="current-error">
                Erreur {currentError + 1}/{errors.length}
              </span>
            </div>
          </div>
          
          <div className="controls-content">
            <div className="error-navigation">
              <button 
                onClick={handlePreviousError} 
                className="nav-btn previous"
                disabled={currentError === 0}
              >
                ⏮️ Erreur précédente
              </button>
              
              <button 
                onClick={handleNextError} 
                className="nav-btn next"
                disabled={currentError >= errors.length - 1}
              >
                ⏭️ Erreur suivante
              </button>
            </div>
            
            <div className="debug-actions">
              <button 
                onClick={() => handleErrorIdentification(
                  currentErrorData?.id, 
                  currentErrorData?.type, 
                  `Erreur identifiée: ${currentErrorData?.description}`
                )}
                className="identify-btn"
                disabled={!currentErrorData}
              >
                🔍 Identifier l'erreur
              </button>
              
              <button 
                onClick={() => handleErrorFix(
                  currentErrorData?.id, 
                  `Correction de l'erreur: ${currentErrorData?.description}`,
                  'Code corrigé'
                )}
                className="fix-btn"
                disabled={!currentErrorData}
              >
                🔧 Corriger l'erreur
              </button>
            </div>
          </div>
        </div>

        {/* Historique des étapes */}
        <div className="steps-history">
          <div className="history-header">
            <h5>📋 Historique des étapes</h5>
            <div className="history-info">
              <span className="steps-count">
                {debugSteps.length} étape{debugSteps.length > 1 ? 's' : ''} de débogage
              </span>
            </div>
          </div>
          
          <div className="history-content">
            {debugSteps.length === 0 ? (
              <div className="empty-history">
                <p>Aucune étape de débogage</p>
                <p>Commencez le débogage pour voir l'historique</p>
              </div>
            ) : (
              <div className="steps-list">
                {debugSteps.map((step, index) => (
                  <div key={step.stepNumber} className="step-item">
                    <div className="step-header">
                      <span className="step-number">Étape {step.stepNumber}</span>
                      <span className="step-action">{step.action || 'identification'}</span>
                      <span className="step-time">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="step-content">
                      <div className="step-description">
                        {step.description}
                      </div>
                      
                      {step.fixedCode && (
                        <div className="step-fix">
                          <span className="fix-label">Code corrigé :</span>
                          <pre className="fix-code">{step.fixedCode}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cas de test */}
        {testCases.length > 0 && (
          <div className="test-cases-section">
            <div className="test-cases-header">
              <h5>🧪 Cas de test</h5>
              <div className="test-cases-info">
                <span className="test-cases-count">
                  {testCases.length} cas de test
                </span>
              </div>
            </div>
            
            <div className="test-cases-content">
              <div className="test-cases-list">
                {testCases.map((testCase, index) => (
                  <div key={index} className="test-case-item">
                    <div className="test-case-header">
                      <span className="test-case-number">Test {index + 1}</span>
                      <span className="test-case-points">
                        {testCase.points || 0} point{(testCase.points || 0) > 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="test-case-content">
                      <div className="test-input">
                        <span className="input-label">Entrée :</span>
                        <span className="input-value">{JSON.stringify(testCase.input)}</span>
                      </div>
                      
                      <div className="test-expected">
                        <span className="expected-label">Sortie attendue :</span>
                        <span className="expected-value">{JSON.stringify(testCase.expected)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="debug-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Identifiez et corrigez les erreurs dans le code pour le rendre fonctionnel.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Analysez le code source</li>
            <li>Identifiez les erreurs</li>
            <li>Proposez des corrections</li>
            <li>Testez les solutions</li>
          </ul>
          <p>
            <strong>Types d'erreurs :</strong>
          </p>
          <ul>
            <li>🔴 <strong>Syntaxe :</strong> Erreurs de syntaxe du langage</li>
            <li>🟡 <strong>Logique :</strong> Erreurs dans la logique du programme</li>
            <li>🟠 <strong>Exécution :</strong> Erreurs lors de l'exécution</li>
            <li>🔵 <strong>Performance :</strong> Problèmes de performance</li>
            <li>🟢 <strong>Style :</strong> Problèmes de style de code</li>
          </ul>
          <p>
            <strong>Conseils de débogage :</strong>
          </p>
          <ul>
            <li>Lisez attentivement les messages d'erreur</li>
            <li>Vérifiez la syntaxe du code</li>
            <li>Testez avec différents cas d'usage</li>
            <li>Documentez vos corrections</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugExercise;