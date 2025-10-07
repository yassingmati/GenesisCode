import React, { useState } from 'react';

const TraceExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [traceSteps, setTraceSteps] = useState(userAnswer?.steps || []);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  const getCode = () => {
    return exercise.code || '';
  };

  const getVariables = () => {
    return exercise.variables || [];
  };

  const getExpectedSteps = () => {
    return exercise.expectedSteps || [];
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const handleStepExecution = () => {
    if (currentStep < getExpectedSteps().length) {
      const expectedStep = getExpectedSteps()[currentStep];
      const newStep = {
        stepNumber: currentStep + 1,
        lineNumber: expectedStep.lineNumber,
        variable: expectedStep.variable,
        value: expectedStep.value,
        operation: expectedStep.operation,
        timestamp: new Date().toISOString()
      };
      
      const newSteps = [...traceSteps, newStep];
      setTraceSteps(newSteps);
      onAnswerChange({ steps: newSteps });
      
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const newSteps = traceSteps.slice(0, -1);
      setTraceSteps(newSteps);
      onAnswerChange({ steps: newSteps });
    }
  };

  const handleReset = () => {
    setTraceSteps([]);
    setCurrentStep(0);
    onAnswerChange({ steps: [] });
  };

  const handleAutoTrace = () => {
    setIsExecuting(true);
    const expectedSteps = getExpectedSteps();
    let stepIndex = 0;
    
    const executeStep = () => {
      if (stepIndex < expectedSteps.length) {
        const expectedStep = expectedSteps[stepIndex];
        const newStep = {
          stepNumber: stepIndex + 1,
          lineNumber: expectedStep.lineNumber,
          variable: expectedStep.variable,
          value: expectedStep.value,
          operation: expectedStep.operation,
          timestamp: new Date().toISOString()
        };
        
        const newSteps = [...traceSteps, newStep];
        setTraceSteps(newSteps);
        onAnswerChange({ steps: newSteps });
        
        stepIndex++;
        setCurrentStep(stepIndex);
        
        setTimeout(executeStep, 1000);
      } else {
        setIsExecuting(false);
      }
    };
    
    executeStep();
  };

  const getTraceStats = () => {
    const expectedSteps = getExpectedSteps();
    const currentSteps = traceSteps.length;
    const completionRate = expectedSteps.length > 0 ? (currentSteps / expectedSteps.length) * 100 : 0;
    
    return {
      totalSteps: expectedSteps.length,
      currentSteps,
      completionRate: Math.round(completionRate)
    };
  };

  const getVariableValue = (variableName) => {
    const step = traceSteps.find(s => s.variable === variableName);
    return step ? step.value : 'Non défini';
  };

  const getStepByNumber = (stepNumber) => {
    return traceSteps.find(s => s.stepNumber === stepNumber);
  };

  const code = getCode();
  const variables = getVariables();
  const expectedSteps = getExpectedSteps();
  const testCases = getTestCases();
  const stats = getTraceStats();

  return (
    <div className="trace-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>🔍 Traçage d'exécution</h4>
          <div className="trace-stats">
            <span className="steps-count">
              {stats.currentSteps}/{stats.totalSteps} étapes
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
          <button onClick={handleAutoTrace} className="auto-btn" disabled={isExecuting}>
            {isExecuting ? '⏳ Exécution...' : '▶️ Exécution automatique'}
          </button>
        </div>
      </div>

      <div className="trace-layout">
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

        {/* Variables */}
        <div className="variables-section">
          <div className="section-header">
            <h5>📊 Variables</h5>
            <div className="variables-info">
              <span className="variables-count">
                {variables.length} variable{variables.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="variables-content">
            {variables.length === 0 ? (
              <div className="empty-variables">
                <p>Aucune variable à tracer</p>
              </div>
            ) : (
              <div className="variables-grid">
                {variables.map((variable, index) => (
                  <div key={variable.name} className="variable-item">
                    <div className="variable-name">{variable.name}</div>
                    <div className="variable-type">{variable.type}</div>
                    <div className="variable-value">
                      {getVariableValue(variable.name)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contrôles d'exécution */}
        <div className="execution-controls">
          <div className="controls-header">
            <h5>🎮 Contrôles d'exécution</h5>
            <div className="controls-info">
              <span className="current-step">
                Étape {currentStep + 1}/{expectedSteps.length}
              </span>
            </div>
          </div>
          
          <div className="controls-content">
            <div className="step-controls">
              <button 
                onClick={handleStepBack} 
                className="step-btn back"
                disabled={currentStep === 0}
              >
                ⏮️ Étape précédente
              </button>
              
              <button 
                onClick={handleStepExecution} 
                className="step-btn next"
                disabled={currentStep >= expectedSteps.length}
              >
                ⏭️ Étape suivante
              </button>
            </div>
            
            <div className="execution-info">
              <div className="execution-status">
                {isExecuting ? (
                  <span className="executing">⏳ Exécution en cours...</span>
                ) : (
                  <span className="ready">✅ Prêt pour l'exécution</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Historique des étapes */}
        <div className="steps-history">
          <div className="history-header">
            <h5>📋 Historique des étapes</h5>
            <div className="history-info">
              <span className="steps-count">
                {traceSteps.length} étape{traceSteps.length > 1 ? 's' : ''} exécutée{traceSteps.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="history-content">
            {traceSteps.length === 0 ? (
              <div className="empty-history">
                <p>Aucune étape exécutée</p>
                <p>Commencez l'exécution pour voir l'historique</p>
              </div>
            ) : (
              <div className="steps-list">
                {traceSteps.map((step, index) => (
                  <div key={step.stepNumber} className="step-item">
                    <div className="step-header">
                      <span className="step-number">Étape {step.stepNumber}</span>
                      <span className="step-line">Ligne {step.lineNumber}</span>
                      <span className="step-time">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="step-content">
                      <div className="step-variable">
                        <span className="variable-label">Variable :</span>
                        <span className="variable-name">{step.variable}</span>
                      </div>
                      
                      <div className="step-operation">
                        <span className="operation-label">Opération :</span>
                        <span className="operation-text">{step.operation}</span>
                      </div>
                      
                      <div className="step-value">
                        <span className="value-label">Valeur :</span>
                        <span className="value-text">{step.value}</span>
                      </div>
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
      <div className="trace-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Tracez l'exécution du code étape par étape pour comprendre le comportement des variables.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Analysez le code source</li>
            <li>Identifiez les variables à tracer</li>
            <li>Exécutez le code étape par étape</li>
            <li>Observez l'évolution des variables</li>
          </ul>
          <p>
            <strong>Types de traçage :</strong>
          </p>
          <ul>
            <li>📝 <strong>Code :</strong> Instructions à exécuter</li>
            <li>📊 <strong>Variables :</strong> État des variables</li>
            <li>🔍 <strong>Étapes :</strong> Progression de l'exécution</li>
            <li>🧪 <strong>Tests :</strong> Validation des résultats</li>
          </ul>
          <p>
            <strong>Conseils d'utilisation :</strong>
          </p>
          <ul>
            <li>Suivez l'ordre d'exécution</li>
            <li>Notez les changements de variables</li>
            <li>Vérifiez la logique du code</li>
            <li>Testez avec différents cas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TraceExercise;