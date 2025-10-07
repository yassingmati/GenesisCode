import React, { useState } from 'react';

const AlgorithmExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [algorithm, setAlgorithm] = useState(userAnswer?.algorithm || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getAlgorithmTemplate = () => {
    return exercise.algorithmTemplate || '';
  };

  const getExpectedAlgorithm = () => {
    return exercise.expectedAlgorithm || '';
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const getComplexity = () => {
    return exercise.complexity || {};
  };

  const handleAlgorithmChange = (newAlgorithm) => {
    setAlgorithm(newAlgorithm);
    onAnswerChange({ algorithm: newAlgorithm });
  };

  const handleReset = () => {
    setAlgorithm('');
    setValidationResult(null);
    onAnswerChange({ algorithm: '' });
  };

  const handleAutoComplete = () => {
    const expectedAlgorithm = getExpectedAlgorithm();
    setAlgorithm(expectedAlgorithm);
    onAnswerChange({ algorithm: expectedAlgorithm });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedAlgorithm = getExpectedAlgorithm();
      const isCorrect = algorithm.trim().toLowerCase() === expectedAlgorithm.trim().toLowerCase();
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Algorithme correct !' : 'L\'algorithme contient des erreurs.',
        details: {
          userAlgorithm: algorithm,
          expectedAlgorithm,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getAlgorithmStats = () => {
    const lines = algorithm.split('\n').filter(line => line.trim().length > 0);
    const words = algorithm.split(/\s+/).filter(word => word.length > 0);
    const characters = algorithm.length;
    
    return {
      lines: lines.length,
      words: words.length,
      characters
    };
  };

  const getAlgorithmQuality = () => {
    const stats = getAlgorithmStats();
    const expectedAlgorithm = getExpectedAlgorithm();
    const expectedLines = expectedAlgorithm.split('\n').filter(line => line.trim().length > 0);
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la longueur
    if (stats.lines >= expectedLines.length * 0.8) {
      qualityScore += 30;
      feedback.push('✅ Longueur appropriée');
    } else {
      feedback.push('⚠️ Algorithme trop court');
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
    if (stats.characters > 50) {
      qualityScore += 20;
      feedback.push('✅ Algorithme détaillé');
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
    const algorithmText = algorithm;
    const execution = 'Simulation d\'exécution de l\'algorithme...';
    
    return {
      algorithm: algorithmText,
      execution,
      result: 'Algorithme exécuté avec succès'
    };
  };

  const getComplexityAnalysis = () => {
    const complexity = getComplexity();
    const analysis = 'Analyse de la complexité de l\'algorithme...';
    
    return {
      complexity,
      analysis,
      result: 'Complexité analysée'
    };
  };

  const algorithmTemplate = getAlgorithmTemplate();
  const expectedAlgorithm = getExpectedAlgorithm();
  const testCases = getTestCases();
  const complexity = getComplexity();
  const stats = getAlgorithmStats();
  const algorithmQuality = getAlgorithmQuality();
  const algorithmExecution = getAlgorithmExecution();
  const complexityAnalysis = getComplexityAnalysis();

  return (
    <div className="algorithm-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>🧮 Algorithme</h4>
          <div className="algorithm-stats">
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
          <button onClick={handleAutoComplete} className="auto-btn">
            ▶️ Complétion automatique
          </button>
        </div>
      </div>

      <div className="algorithm-layout">
        {/* Template d'algorithme */}
        {algorithmTemplate && (
          <div className="template-section">
            <div className="section-header">
              <h5>📝 Template d'algorithme</h5>
              <div className="template-info">
                <span className="template-lines">
                  {algorithmTemplate.split('\n').length} ligne{algorithmTemplate.split('\n').length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="template-content">
              <pre className="template-code">{algorithmTemplate}</pre>
            </div>
          </div>
        )}

        {/* Éditeur d'algorithme */}
        <div className="algorithm-editor-section">
          <div className="section-header">
            <h5>✏️ Votre algorithme</h5>
            <div className="editor-info">
              <span className="algorithm-quality">
                Qualité: {algorithmQuality.level} ({algorithmQuality.score}%)
              </span>
            </div>
          </div>
          
          <div className="editor-content">
            <div className="algorithm-input">
              <label className="input-label">
                Écrivez votre algorithme :
              </label>
              <textarea
                value={algorithm}
                onChange={(e) => handleAlgorithmChange(e.target.value)}
                placeholder="Écrivez votre algorithme ici..."
                className="algorithm-textarea"
                rows={15}
              />
            </div>
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

        {/* Analyse de complexité */}
        {Object.keys(complexity).length > 0 && (
          <div className="complexity-section">
            <div className="section-header">
              <h5>📊 Analyse de complexité</h5>
              <div className="complexity-info">
                <span className="complexity-status">En cours...</span>
              </div>
            </div>
            
            <div className="complexity-content">
              <div className="complexity-output">
                <pre className="complexity-text">{complexityAnalysis.analysis}</pre>
                <div className="complexity-result">
                  {complexityAnalysis.result}
                </div>
              </div>
            </div>
          </div>
        )}

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
              disabled={isValidating || !algorithm.trim()}
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
                    <pre className="user-algorithm">{validationResult.details.userAlgorithm}</pre>
                  </div>
                  
                  <div className="details-section">
                    <h6>Algorithme attendu :</h6>
                    <pre className="expected-algorithm">{validationResult.details.expectedAlgorithm}</pre>
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
      <div className="algorithm-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Écrivez un algorithme pour résoudre le problème donné.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Analysez le problème</li>
            <li>Identifiez les étapes nécessaires</li>
            <li>Écrivez l'algorithme étape par étape</li>
            <li>Vérifiez la logique</li>
          </ul>
          <p>
            <strong>Éléments d'un algorithme :</strong>
          </p>
          <ul>
            <li>📝 <strong>Structure :</strong> Organisation logique</li>
            <li>⚡ <strong>Opérations :</strong> Actions à effectuer</li>
            <li>❓ <strong>Conditions :</strong> Prise de décisions</li>
            <li>🔄 <strong>Boucles :</strong> Répétition d'actions</li>
            <li>📊 <strong>Complexité :</strong> Efficacité de l'algorithme</li>
          </ul>
          <p>
            <strong>Conseils d'écriture :</strong>
          </p>
          <ul>
            <li>Utilisez un langage clair et précis</li>
            <li>Structurez votre algorithme logiquement</li>
            <li>Incluez tous les cas possibles</li>
            <li>Testez avec différents exemples</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmExercise;