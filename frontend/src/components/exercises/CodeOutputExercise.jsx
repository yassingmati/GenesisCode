import React, { useState } from 'react';

const CodeOutputExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [outputPrediction, setOutputPrediction] = useState(userAnswer?.prediction || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getCode = () => {
    return exercise.code || '';
  };

  const getExpectedOutput = () => {
    return exercise.expectedOutput || '';
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const getInputData = () => {
    return exercise.inputData || {};
  };

  const handlePredictionChange = (newPrediction) => {
    setOutputPrediction(newPrediction);
    onAnswerChange({ prediction: newPrediction });
  };

  const handleReset = () => {
    setOutputPrediction('');
    setValidationResult(null);
    onAnswerChange({ prediction: '' });
  };

  const handleAutoPredict = () => {
    const expectedOutput = getExpectedOutput();
    setOutputPrediction(expectedOutput);
    onAnswerChange({ prediction: expectedOutput });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedOutput = getExpectedOutput();
      const isCorrect = outputPrediction.trim().toLowerCase() === expectedOutput.trim().toLowerCase();
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Prédiction correcte !' : 'La prédiction contient des erreurs.',
        details: {
          userPrediction: outputPrediction,
          expectedOutput,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getPredictionStats = () => {
    const lines = outputPrediction.split('\n').filter(line => line.trim().length > 0);
    const words = outputPrediction.split(/\s+/).filter(word => word.length > 0);
    const characters = outputPrediction.length;
    
    return {
      lines: lines.length,
      words: words.length,
      characters
    };
  };

  const getPredictionQuality = () => {
    const stats = getPredictionStats();
    const expectedOutput = getExpectedOutput();
    const expectedLines = expectedOutput.split('\n').filter(line => line.trim().length > 0);
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la longueur
    if (stats.lines >= expectedLines.length * 0.8) {
      qualityScore += 30;
      feedback.push('✅ Longueur appropriée');
    } else {
      feedback.push('⚠️ Prédiction trop courte');
    }
    
    // Vérification du contenu
    if (stats.words > 0) {
      qualityScore += 25;
      feedback.push('✅ Contenu présent');
    } else {
      feedback.push('❌ Aucun contenu');
    }
    
    // Vérification de la structure
    if (stats.lines > 0) {
      qualityScore += 25;
      feedback.push('✅ Structure présente');
    } else {
      feedback.push('❌ Aucune structure');
    }
    
    // Vérification de la complétude
    if (stats.characters > 10) {
      qualityScore += 20;
      feedback.push('✅ Prédiction détaillée');
    } else {
      feedback.push('⚠️ Prédiction trop courte');
    }
    
    return {
      score: qualityScore,
      feedback,
      level: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'bon' : qualityScore >= 40 ? 'moyen' : 'faible'
    };
  };

  const getCodeExecution = () => {
    const code = getCode();
    const inputData = getInputData();
    
    return {
      code,
      input: inputData,
      execution: 'Simulation d\'exécution du code...'
    };
  };

  const getOutputAnalysis = () => {
    const expectedOutput = getExpectedOutput();
    const userPrediction = outputPrediction;
    
    return {
      expected: expectedOutput,
      user: userPrediction,
      matches: userPrediction.trim().toLowerCase() === expectedOutput.trim().toLowerCase()
    };
  };

  const code = getCode();
  const expectedOutput = getExpectedOutput();
  const testCases = getTestCases();
  const inputData = getInputData();
  const stats = getPredictionStats();
  const predictionQuality = getPredictionQuality();
  const codeExecution = getCodeExecution();
  const outputAnalysis = getOutputAnalysis();

  return (
    <div className="code-output-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>📤 Sortie de code</h4>
          <div className="output-stats">
            <span className="lines-count">
              {stats.lines} ligne{stats.lines > 1 ? 's' : ''}
            </span>
            <span className="words-count">
              {stats.words} mot{stats.words > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          <button onClick={handleReset} className="reset-btn">
            🔄 Réinitialiser
          </button>
          <button onClick={handleAutoPredict} className="auto-btn">
            ▶️ Prédiction automatique
          </button>
        </div>
      </div>

      <div className="code-output-layout">
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

        {/* Données d'entrée */}
        {Object.keys(inputData).length > 0 && (
          <div className="input-data-section">
            <div className="section-header">
              <h5>📥 Données d'entrée</h5>
              <div className="input-info">
                <span className="input-count">
                  {Object.keys(inputData).length} variable{Object.keys(inputData).length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="input-content">
              <div className="input-variables">
                {Object.entries(inputData).map(([key, value]) => (
                  <div key={key} className="input-variable">
                    <span className="variable-name">{key}:</span>
                    <span className="variable-value">{JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
              <pre className="execution-text">{codeExecution.execution}</pre>
            </div>
          </div>
        </div>

        {/* Interface de prédiction */}
        <div className="prediction-interface">
          <div className="interface-header">
            <h5>🔮 Votre prédiction</h5>
            <div className="interface-info">
              <span className="prediction-quality">
                Qualité: {predictionQuality.level} ({predictionQuality.score}%)
              </span>
            </div>
          </div>
          
          <div className="interface-content">
            <div className="prediction-input">
              <label className="input-label">
                Prédisez la sortie du code :
              </label>
              <textarea
                value={outputPrediction}
                onChange={(e) => handlePredictionChange(e.target.value)}
                placeholder="Écrivez votre prédiction de sortie ici..."
                className="prediction-textarea"
                rows={8}
              />
            </div>
          </div>
        </div>

        {/* Qualité de la prédiction */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Qualité de la prédiction</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {predictionQuality.score}%
              </span>
            </div>
          </div>
          
          <div className="quality-content">
            <div className="quality-feedback">
              {predictionQuality.feedback.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  {feedback}
                </div>
              ))}
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
              disabled={isValidating || !outputPrediction.trim()}
            >
              {isValidating ? '⏳ Validation...' : '✅ Valider la prédiction'}
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
                    <h6>Votre prédiction :</h6>
                    <pre className="user-prediction">{validationResult.details.userPrediction}</pre>
                  </div>
                  
                  <div className="details-section">
                    <h6>Sortie attendue :</h6>
                    <pre className="expected-output">{validationResult.details.expectedOutput}</pre>
                  </div>
                  
                  {validationResult.details.differences && validationResult.details.differences.length > 0 && (
                    <div className="details-section">
                      <h6>Différences :</h6>
                      <ul className="differences-list">
                        {validationResult.details.differences.map((diff, index) => (
                          <li key={index} className="difference-item">{diff}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
      <div className="code-output-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Prédisez la sortie du code fourni en analysant son comportement.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Analysez le code source</li>
            <li>Identifiez les opérations principales</li>
            <li>Tracez l'exécution étape par étape</li>
            <li>Prédisez la sortie finale</li>
          </ul>
          <p>
            <strong>Éléments d'analyse :</strong>
          </p>
          <ul>
            <li>📝 <strong>Code :</strong> Instructions à exécuter</li>
            <li>📥 <strong>Entrée :</strong> Données d'entrée</li>
            <li>⚡ <strong>Exécution :</strong> Simulation du comportement</li>
            <li>📤 <strong>Sortie :</strong> Résultat attendu</li>
          </ul>
          <p>
            <strong>Conseils de prédiction :</strong>
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

export default CodeOutputExercise;