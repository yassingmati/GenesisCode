import React, { useState } from 'react';

const AlgorithmStepsExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [algorithmSteps, setAlgorithmSteps] = useState(userAnswer?.steps || []);
  const [currentStep, setCurrentStep] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getSteps = () => {
    return exercise.algorithmSteps || [];
  };

  const getExpectedSteps = () => {
    return exercise.expectedSteps || [];
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const getAlgorithm = () => {
    return exercise.algorithm || '';
  };

  const handleStepAdd = (step) => {
    const newStep = {
      ...step,
      id: Date.now(),
      position: algorithmSteps.length
    };
    
    const newSteps = [...algorithmSteps, newStep];
    setAlgorithmSteps(newSteps);
    onAnswerChange({ steps: newSteps });
  };

  const handleStepRemove = (stepId) => {
    const newSteps = algorithmSteps.filter(step => step.id !== stepId);
    setAlgorithmSteps(newSteps);
    onAnswerChange({ steps: newSteps });
  };

  const handleStepMove = (fromIndex, toIndex) => {
    const newSteps = [...algorithmSteps];
    const [moved] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, moved);
    setAlgorithmSteps(newSteps);
    onAnswerChange({ steps: newSteps });
  };

  const handleStepSelect = (step) => {
    setCurrentStep(algorithmSteps.findIndex(s => s.id === step.id));
  };

  const handleReset = () => {
    setAlgorithmSteps([]);
    setCurrentStep(0);
    setValidationResult(null);
    onAnswerChange({ steps: [] });
  };

  const handleAutoComplete = () => {
    const expectedSteps = getExpectedSteps();
    setAlgorithmSteps(expectedSteps);
    onAnswerChange({ steps: expectedSteps });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedSteps = getExpectedSteps();
      const userStepIds = algorithmSteps.map(step => step.id);
      const expectedStepIds = expectedSteps.map(step => step.id);
      
      const isCorrect = JSON.stringify(userStepIds.sort()) === JSON.stringify(expectedStepIds.sort());
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Étapes d\'algorithme correctes !' : 'Les étapes contiennent des erreurs.',
        details: {
          userSteps: algorithmSteps,
          expectedSteps,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getStepStats = () => {
    const totalSteps = getSteps().length;
    const selectedCount = algorithmSteps.length;
    const completionRate = totalSteps > 0 ? (selectedCount / totalSteps) * 100 : 0;
    
    return {
      totalSteps,
      selectedCount,
      completionRate: Math.round(completionRate)
    };
  };

  const getStepType = (step) => {
    return step.type || 'unknown';
  };

  const getStepIcon = (type) => {
    const icons = {
      'start': '🚀',
      'input': '📥',
      'process': '⚡',
      'decision': '❓',
      'loop': '🔄',
      'output': '📤',
      'end': '🏁',
      'unknown': '❓'
    };
    return icons[type] || icons.unknown;
  };

  const getStepColor = (type) => {
    const colors = {
      'start': '#4CAF50',
      'input': '#2196F3',
      'process': '#FF9800',
      'decision': '#9C27B0',
      'loop': '#00BCD4',
      'output': '#E91E63',
      'end': '#795548',
      'unknown': '#9E9E9E'
    };
    return colors[type] || colors.unknown;
  };

  const getStepDescription = (step) => {
    return step.description || step.content || 'Description non disponible';
  };

  const getStepComplexity = (step) => {
    return step.complexity || 'O(?)';
  };

  const getAlgorithmQuality = () => {
    const stats = getStepStats();
    const steps = getSteps();
    const selectedSteps = algorithmSteps;
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la complétude
    if (stats.completionRate >= 80) {
      qualityScore += 30;
      feedback.push('✅ Algorithme complet');
    } else {
      feedback.push('⚠️ Algorithme incomplet');
    }
    
    // Vérification de la diversité
    const types = [...new Set(selectedSteps.map(step => step.type))];
    if (types.length >= 3) {
      qualityScore += 25;
      feedback.push('✅ Diversité des étapes');
    } else {
      feedback.push('⚠️ Peu de diversité');
    }
    
    // Vérification de la logique
    if (selectedSteps.length > 0) {
      qualityScore += 25;
      feedback.push('✅ Logique présente');
    } else {
      feedback.push('❌ Aucune logique');
    }
    
    // Vérification de la cohérence
    if (selectedSteps.length >= 3) {
      qualityScore += 20;
      feedback.push('✅ Algorithme cohérent');
    } else {
      feedback.push('⚠️ Algorithme trop court');
    }
    
    return {
      score: qualityScore,
      feedback,
      level: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'bon' : qualityScore >= 40 ? 'moyen' : 'faible'
    };
  };

  const getAlgorithmExecution = () => {
    const steps = algorithmSteps;
    const execution = 'Simulation d\'exécution de l\'algorithme...';
    
    return {
      steps,
      execution,
      result: 'Algorithme exécuté avec succès'
    };
  };

  const steps = getSteps();
  const expectedSteps = getExpectedSteps();
  const testCases = getTestCases();
  const algorithm = getAlgorithm();
  const stats = getStepStats();
  const algorithmQuality = getAlgorithmQuality();
  const algorithmExecution = getAlgorithmExecution();

  return (
    <div className="algorithm-steps-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>🧮 Étapes d'algorithme</h4>
          <div className="steps-stats">
            <span className="steps-count">
              {stats.selectedCount}/{stats.totalSteps} étapes
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
          <button onClick={handleAutoComplete} className="auto-btn">
            ▶️ Complétion automatique
          </button>
        </div>
      </div>

      <div className="algorithm-steps-layout">
        {/* Algorithme de base */}
        {algorithm && (
          <div className="algorithm-section">
            <div className="section-header">
              <h5>📝 Algorithme de base</h5>
              <div className="algorithm-info">
                <span className="algorithm-lines">
                  {algorithm.split('\n').length} ligne{algorithm.split('\n').length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="algorithm-content">
              <pre className="algorithm-code">{algorithm}</pre>
            </div>
          </div>
        )}

        {/* Étapes disponibles */}
        <div className="available-steps-section">
          <div className="section-header">
            <h5>📦 Étapes disponibles</h5>
            <div className="steps-info">
              <span className="steps-count">
                {steps.length} étape{steps.length > 1 ? 's' : ''} disponible{steps.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="steps-content">
            {steps.length === 0 ? (
              <div className="empty-steps">
                <p>Aucune étape disponible</p>
              </div>
            ) : (
              <div className="steps-grid">
                {steps.map((step, index) => {
                  const isUsed = algorithmSteps.some(s => s.id === step.id);
                  
                  return (
                    <div
                      key={step.id}
                      className={`algorithm-step ${getStepType(step)} ${isUsed ? 'used' : 'available'}`}
                      onClick={() => !isUsed && handleStepAdd(step)}
                      style={{ borderColor: getStepColor(getStepType(step)) }}
                    >
                      <div className="step-header">
                        <span className="step-icon">{getStepIcon(getStepType(step))}</span>
                        <span className="step-type">{getStepType(step)}</span>
                        <span className="step-complexity">{getStepComplexity(step)}</span>
                      </div>
                      
                      <div className="step-content">
                        <div className="step-name">{step.name}</div>
                        <div className="step-description">
                          {getStepDescription(step)}
                        </div>
                      </div>
                      
                      <div className="step-status">
                        {isUsed ? (
                          <span className="used-badge">✅ Utilisée</span>
                        ) : (
                          <span className="available-badge">🔄 Disponible</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Algorithme assemblé */}
        <div className="assembled-algorithm-section">
          <div className="section-header">
            <h5>🎯 Algorithme assemblé</h5>
            <div className="algorithm-info">
              <span className="algorithm-steps">
                {algorithmSteps.length} étape{algorithmSteps.length > 1 ? 's' : ''} sélectionnée{algorithmSteps.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="algorithm-content">
            {algorithmSteps.length === 0 ? (
              <div className="empty-algorithm">
                <p>Aucune étape sélectionnée</p>
                <p>Cliquez sur des étapes pour commencer</p>
              </div>
            ) : (
              <div className="algorithm-steps">
                {algorithmSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`algorithm-step ${getStepType(step)} ${currentStep === index ? 'current' : ''}`}
                    onClick={() => handleStepSelect(step)}
                    style={{ borderColor: getStepColor(getStepType(step)) }}
                  >
                    <div className="step-header">
                      <span className="step-icon">{getStepIcon(getStepType(step))}</span>
                      <span className="step-position">{index + 1}</span>
                      <span className="step-type">{getStepType(step)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStepRemove(step.id);
                        }}
                        className="remove-step-btn"
                        title="Retirer cette étape"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="step-content">
                      <div className="step-name">{step.name}</div>
                      <div className="step-description">
                        {getStepDescription(step)}
                      </div>
                    </div>
                    
                    <div className="step-controls">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          index > 0 && handleStepMove(index, index - 1);
                        }}
                        className="move-btn up"
                        disabled={index === 0}
                        title="Déplacer vers le haut"
                      >
                        ↑
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          index < algorithmSteps.length - 1 && handleStepMove(index, index + 1);
                        }}
                        className="move-btn down"
                        disabled={index === algorithmSteps.length - 1}
                        title="Déplacer vers le bas"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Qualité de l'algorithme */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Qualité de l'algorithme</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {algorithmQuality.score}%
              </span>
            </div>
          </div>
          
          <div className="quality-content">
            <div className="quality-feedback">
              {algorithmQuality.feedback.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  {feedback}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simulation d'exécution */}
        <div className="execution-section">
          <div className="section-header">
            <h5>⚡ Simulation d'exécution</h5>
            <div className="execution-info">
              <span className="execution-status">En cours...</span>
            </div>
          </div>
          
          <div className="execution-content">
            <div className="execution-output">
              <pre className="execution-text">{algorithmExecution.execution}</pre>
              <div className="execution-result">
                {algorithmExecution.result}
              </div>
            </div>
          </div>
        </div>

        {/* Contrôles de validation */}
        <div className="validation-controls">
          <div className="controls-header">
            <h5>🎮 Contrôles de validation</h5>
            <div className="controls-info">
              <span className="validation-status">
                {validationResult ? '✅ Validé' : '⏳ En attente'}
              </span>
            </div>
          </div>
          
          <div className="controls-content">
            <button 
              onClick={handleValidate} 
              className="validate-btn"
              disabled={isValidating || algorithmSteps.length === 0}
            >
              {isValidating ? '⏳ Validation...' : '✅ Valider l\'algorithme'}
            </button>
          </div>
        </div>

        {/* Résultat de validation */}
        {validationResult && (
          <div className="validation-result">
            <div className="result-header">
              <h5>📋 Résultat de validation</h5>
              <div className="result-info">
                <span className={`result-status ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
                  {validationResult.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                </span>
              </div>
            </div>
            
            <div className="result-content">
              <div className="result-message">
                {validationResult.message}
              </div>
              
              {validationResult.details && (
                <div className="result-details">
                  <div className="details-section">
                    <h6>Votre algorithme :</h6>
                    <div className="algorithm-comparison">
                      {validationResult.details.userSteps.map((step, index) => (
                        <div key={index} className="algorithm-item">
                          <span className="step-position">{index + 1}.</span>
                          <span className="step-name">{step.name}</span>
                          <span className="step-type">({getStepType(step)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h6>Algorithme attendu :</h6>
                    <div className="algorithm-comparison">
                      {validationResult.details.expectedSteps.map((step, index) => (
                        <div key={index} className="algorithm-item">
                          <span className="step-position">{index + 1}.</span>
                          <span className="step-name">{step.name}</span>
                          <span className="step-type">({getStepType(step)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
      <div className="algorithm-steps-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Organisez les étapes d'un algorithme dans l'ordre logique approprié.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Analysez l'algorithme de base</li>
            <li>Sélectionnez les étapes nécessaires</li>
            <li>Organisez-les dans l'ordre logique</li>
            <li>Vérifiez la cohérence</li>
          </ul>
          <p>
            <strong>Types d'étapes :</strong>
          </p>
          <ul>
            <li>🚀 <strong>Début :</strong> Point de départ de l'algorithme</li>
            <li>📥 <strong>Entrée :</strong> Acquisition des données</li>
            <li>⚡ <strong>Traitement :</strong> Opérations et calculs</li>
            <li>❓ <strong>Décision :</strong> Prise de décisions conditionnelles</li>
            <li>🔄 <strong>Boucle :</strong> Répétition d'actions</li>
            <li>📤 <strong>Sortie :</strong> Affichage des résultats</li>
            <li>🏁 <strong>Fin :</strong> Terminaison de l'algorithme</li>
          </ul>
          <p>
            <strong>Conseils d'organisation :</strong>
          </p>
          <ul>
            <li>Commencez par le début et l'entrée</li>
            <li>Ajoutez la logique de traitement</li>
            <li>Incluez les décisions et boucles</li>
            <li>Terminez par la sortie et la fin</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmStepsExercise;