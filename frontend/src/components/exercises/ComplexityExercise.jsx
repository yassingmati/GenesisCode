import React, { useState } from 'react';

const ComplexityExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [complexityAnalysis, setComplexityAnalysis] = useState(userAnswer?.analysis || {});
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getAlgorithm = () => {
    return exercise.algorithm || '';
  };

  const getExpectedAnalysis = () => {
    return exercise.expectedAnalysis || {};
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const getComplexityTypes = () => {
    return exercise.complexityTypes || ['time', 'space'];
  };

  const handleAnalysisChange = (type, value) => {
    const newAnalysis = {
      ...complexityAnalysis,
      [type]: value
    };
    
    setComplexityAnalysis(newAnalysis);
    onAnswerChange({ analysis: newAnalysis });
  };

  const handleReset = () => {
    setComplexityAnalysis({});
    setValidationResult(null);
    onAnswerChange({ analysis: {} });
  };

  const handleAutoAnalyze = () => {
    const expectedAnalysis = getExpectedAnalysis();
    setComplexityAnalysis(expectedAnalysis);
    onAnswerChange({ analysis: expectedAnalysis });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedAnalysis = getExpectedAnalysis();
      const isCorrect = Object.keys(expectedAnalysis).every(
        type => complexityAnalysis[type] === expectedAnalysis[type]
      );
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Analyse de complexité correcte !' : 'L\'analyse contient des erreurs.',
        details: {
          userAnalysis: complexityAnalysis,
          expectedAnalysis,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getAnalysisStats = () => {
    const types = getComplexityTypes();
    const completedTypes = types.filter(type => complexityAnalysis[type]);
    const completionRate = types.length > 0 ? (completedTypes.length / types.length) * 100 : 0;
    
    return {
      totalTypes: types.length,
      completedTypes: completedTypes.length,
      completionRate: Math.round(completionRate)
    };
  };

  const getComplexityNotation = (type) => {
    const notations = {
      'time': 'O(n)',
      'space': 'O(1)',
      'best': 'O(1)',
      'average': 'O(n)',
      'worst': 'O(n²)'
    };
    return notations[type] || 'O(?)';
  };

  const getComplexityDescription = (type) => {
    const descriptions = {
      'time': 'Complexité temporelle',
      'space': 'Complexité spatiale',
      'best': 'Meilleur cas',
      'average': 'Cas moyen',
      'worst': 'Pire cas'
    };
    return descriptions[type] || 'Complexité inconnue';
  };

  const getComplexityLevel = (notation) => {
    if (notation.includes('O(1)')) return { level: 'excellent', color: 'green' };
    if (notation.includes('O(log n)')) return { level: 'très bon', color: 'blue' };
    if (notation.includes('O(n)')) return { level: 'bon', color: 'orange' };
    if (notation.includes('O(n log n)')) return { level: 'moyen', color: 'yellow' };
    if (notation.includes('O(n²)')) return { level: 'faible', color: 'red' };
    return { level: 'inconnu', color: 'gray' };
  };

  const getAnalysisQuality = () => {
    const stats = getAnalysisStats();
    const types = getComplexityTypes();
    const completedTypes = types.filter(type => complexityAnalysis[type]);
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la complétude
    if (stats.completionRate >= 100) {
      qualityScore += 40;
      feedback.push('✅ Analyse complète');
    } else {
      feedback.push('⚠️ Analyse incomplète');
    }
    
    // Vérification de la notation
    const hasValidNotation = types.every(type => {
      const notation = complexityAnalysis[type];
      return notation && notation.includes('O(');
    });
    
    if (hasValidNotation) {
      qualityScore += 30;
      feedback.push('✅ Notation appropriée');
    } else {
      feedback.push('⚠️ Notation incorrecte');
    }
    
    // Vérification de la cohérence
    const hasConsistentAnalysis = types.every(type => {
      const notation = complexityAnalysis[type];
      return notation && notation.length > 0;
    });
    
    if (hasConsistentAnalysis) {
      qualityScore += 30;
      feedback.push('✅ Analyse cohérente');
    } else {
      feedback.push('⚠️ Analyse incohérente');
    }
    
    return {
      score: qualityScore,
      feedback,
      level: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'bon' : qualityScore >= 40 ? 'moyen' : 'faible'
    };
  };

  const algorithm = getAlgorithm();
  const expectedAnalysis = getExpectedAnalysis();
  const testCases = getTestCases();
  const complexityTypes = getComplexityTypes();
  const stats = getAnalysisStats();
  const analysisQuality = getAnalysisQuality();

  return (
    <div className="complexity-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>📊 Analyse de complexité</h4>
          <div className="analysis-stats">
            <span className="types-count">
              {stats.completedTypes}/{stats.totalTypes} types analysés
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
          <button onClick={handleAutoAnalyze} className="auto-btn">
            ▶️ Analyse automatique
          </button>
        </div>
      </div>

      <div className="complexity-layout">
        {/* Algorithme */}
        <div className="algorithm-section">
          <div className="section-header">
            <h5>📝 Algorithme</h5>
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

        {/* Types de complexité */}
        <div className="complexity-types-section">
          <div className="section-header">
            <h5>🔍 Types de complexité</h5>
            <div className="types-info">
              <span className="types-count">
                {complexityTypes.length} type{complexityTypes.length > 1 ? 's' : ''} à analyser
              </span>
            </div>
          </div>
          
          <div className="types-content">
            <div className="types-list">
              {complexityTypes.map((type, index) => (
                <div key={type} className="complexity-type-item">
                  <div className="type-header">
                    <span className="type-name">{getComplexityDescription(type)}</span>
                    <span className="type-notation">
                      {complexityAnalysis[type] || 'Non analysé'}
                    </span>
                  </div>
                  
                  <div className="type-content">
                    <div className="type-input">
                      <label className="input-label">
                        Notation de complexité :
                      </label>
                      <input
                        type="text"
                        value={complexityAnalysis[type] || ''}
                        onChange={(e) => handleAnalysisChange(type, e.target.value)}
                        placeholder={`Ex: ${getComplexityNotation(type)}`}
                        className="complexity-input"
                      />
                    </div>
                    
                    <div className="type-description">
                      <p>Décrivez la complexité de cet algorithme pour le type "{getComplexityDescription(type)}".</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analyse de qualité */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Qualité de l'analyse</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {analysisQuality.score}%
              </span>
            </div>
          </div>
          
          <div className="quality-content">
            <div className="quality-feedback">
              {analysisQuality.feedback.map((feedback, index) => (
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
              disabled={isValidating || Object.keys(complexityAnalysis).length === 0}
            >
              {isValidating ? '⏳ Validation...' : '✅ Valider l\'analyse'}
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
                    <h6>Votre analyse :</h6>
                    <div className="analysis-comparison">
                      {Object.entries(validationResult.details.userAnalysis).map(([type, value]) => (
                        <div key={type} className="analysis-item">
                          <span className="analysis-type">{getComplexityDescription(type)}:</span>
                          <span className="analysis-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h6>Analyse attendue :</h6>
                    <div className="analysis-comparison">
                      {Object.entries(validationResult.details.expectedAnalysis).map(([type, value]) => (
                        <div key={type} className="analysis-item">
                          <span className="analysis-type">{getComplexityDescription(type)}:</span>
                          <span className="analysis-value">{value}</span>
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
      <div className="complexity-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Analysez la complexité de l'algorithme fourni pour différents types de complexité.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Analysez l'algorithme fourni</li>
            <li>Identifiez les opérations principales</li>
            <li>Calculez la complexité pour chaque type</li>
            <li>Utilisez la notation Big O appropriée</li>
          </ul>
          <p>
            <strong>Types de complexité :</strong>
          </p>
          <ul>
            <li>⏱️ <strong>Temporelle :</strong> Temps d'exécution</li>
            <li>💾 <strong>Spatiale :</strong> Mémoire utilisée</li>
            <li>🏆 <strong>Meilleur cas :</strong> Complexité optimale</li>
            <li>📊 <strong>Cas moyen :</strong> Complexité moyenne</li>
            <li>⚠️ <strong>Pire cas :</strong> Complexité maximale</li>
          </ul>
          <p>
            <strong>Conseils d'analyse :</strong>
          </p>
          <ul>
            <li>Identifiez les boucles et récursions</li>
            <li>Comptez les opérations principales</li>
            <li>Utilisez la notation Big O standard</li>
            <li>Vérifiez la cohérence de votre analyse</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComplexityExercise;