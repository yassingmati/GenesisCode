import React, { useState } from 'react';

const OptimizationExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [optimizationPlan, setOptimizationPlan] = useState(userAnswer?.plan || {});
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getCode = () => {
    return exercise.code || '';
  };

  const getExpectedPlan = () => {
    return exercise.expectedPlan || {};
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const getOptimizationCriteria = () => {
    return exercise.optimizationCriteria || [];
  };

  const getPerformanceMetrics = () => {
    return exercise.performanceMetrics || {};
  };

  const handlePlanChange = (criterion, value) => {
    const newPlan = {
      ...optimizationPlan,
      [criterion]: value
    };
    
    setOptimizationPlan(newPlan);
    onAnswerChange({ plan: newPlan });
  };

  const handleReset = () => {
    setOptimizationPlan({});
    setValidationResult(null);
    onAnswerChange({ plan: {} });
  };

  const handleAutoOptimize = () => {
    const expectedPlan = getExpectedPlan();
    setOptimizationPlan(expectedPlan);
    onAnswerChange({ plan: expectedPlan });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedPlan = getExpectedPlan();
      const isCorrect = Object.keys(expectedPlan).every(
        criterion => optimizationPlan[criterion] === expectedPlan[criterion]
      );
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Plan d\'optimisation correct !' : 'Le plan contient des erreurs.',
        details: {
          userPlan: optimizationPlan,
          expectedPlan,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getOptimizationStats = () => {
    const criteria = getOptimizationCriteria();
    const completedCriteria = criteria.filter(criterion => optimizationPlan[criterion]);
    const completionRate = criteria.length > 0 ? (completedCriteria.length / criteria.length) * 100 : 0;
    
    return {
      totalCriteria: criteria.length,
      completedCriteria: completedCriteria.length,
      completionRate: Math.round(completionRate)
    };
  };

  const getOptimizationType = (criterion) => {
    const types = {
      'time': '⏱️ Temps d\'exécution',
      'space': '💾 Utilisation mémoire',
      'efficiency': '⚡ Efficacité',
      'readability': '📖 Lisibilité',
      'maintainability': '🔧 Maintenabilité'
    };
    return types[criterion] || 'Optimisation inconnue';
  };

  const getOptimizationDescription = (criterion) => {
    const descriptions = {
      'time': 'Réduire le temps d\'exécution',
      'space': 'Minimiser l\'utilisation mémoire',
      'efficiency': 'Améliorer l\'efficacité globale',
      'readability': 'Améliorer la lisibilité du code',
      'maintainability': 'Faciliter la maintenance'
    };
    return descriptions[criterion] || 'Description non disponible';
  };

  const getOptimizationLevel = (value) => {
    if (value.includes('critique') || value.includes('urgent')) return { level: 'critique', color: 'red' };
    if (value.includes('important') || value.includes('priorité')) return { level: 'important', color: 'orange' };
    if (value.includes('moyen') || value.includes('normal')) return { level: 'moyen', color: 'yellow' };
    if (value.includes('faible') || value.includes('optionnel')) return { level: 'faible', color: 'green' };
    return { level: 'inconnu', color: 'gray' };
  };

  const getPlanQuality = () => {
    const stats = getOptimizationStats();
    const criteria = getOptimizationCriteria();
    const completedCriteria = criteria.filter(criterion => optimizationPlan[criterion]);
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la complétude
    if (stats.completionRate >= 100) {
      qualityScore += 40;
      feedback.push('✅ Plan complet');
    } else {
      feedback.push('⚠️ Plan incomplet');
    }
    
    // Vérification de la cohérence
    const hasConsistentPlan = criteria.every(criterion => {
      const value = optimizationPlan[criterion];
      return value && value.length > 0;
    });
    
    if (hasConsistentPlan) {
      qualityScore += 30;
      feedback.push('✅ Plan cohérent');
    } else {
      feedback.push('⚠️ Plan incohérent');
    }
    
    // Vérification de la qualité
    const hasQualityPlan = criteria.every(criterion => {
      const value = optimizationPlan[criterion];
      return value && value.length > 10;
    });
    
    if (hasQualityPlan) {
      qualityScore += 30;
      feedback.push('✅ Plan détaillé');
    } else {
      feedback.push('⚠️ Plan trop court');
    }
    
    return {
      score: qualityScore,
      feedback,
      level: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'bon' : qualityScore >= 40 ? 'moyen' : 'faible'
    };
  };

  const getPerformanceAnalysis = () => {
    const metrics = getPerformanceMetrics();
    const currentPlan = optimizationPlan;
    
    return {
      metrics,
      plan: currentPlan,
      analysis: 'Analyse des performances en cours...'
    };
  };

  const code = getCode();
  const expectedPlan = getExpectedPlan();
  const testCases = getTestCases();
  const optimizationCriteria = getOptimizationCriteria();
  const performanceMetrics = getPerformanceMetrics();
  const stats = getOptimizationStats();
  const planQuality = getPlanQuality();
  const performanceAnalysis = getPerformanceAnalysis();

  return (
    <div className="optimization-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>⚡ Optimisation de code</h4>
          <div className="optimization-stats">
            <span className="criteria-count">
              {stats.completedCriteria}/{stats.totalCriteria} critères
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
          <button onClick={handleAutoOptimize} className="auto-btn">
            ▶️ Optimisation automatique
          </button>
        </div>
      </div>

      <div className="optimization-layout">
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

        {/* Métriques de performance */}
        {Object.keys(performanceMetrics).length > 0 && (
          <div className="performance-section">
            <div className="section-header">
              <h5>📊 Métriques de performance</h5>
              <div className="performance-info">
                <span className="metrics-count">
                  {Object.keys(performanceMetrics).length} métrique{Object.keys(performanceMetrics).length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="performance-content">
              <div className="metrics-list">
                {Object.entries(performanceMetrics).map(([metric, value]) => (
                  <div key={metric} className="metric-item">
                    <div className="metric-name">{metric}</div>
                    <div className="metric-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Critères d'optimisation */}
        <div className="criteria-section">
          <div className="section-header">
            <h5>🎯 Critères d'optimisation</h5>
            <div className="criteria-info">
              <span className="criteria-count">
                {optimizationCriteria.length} critère{optimizationCriteria.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="criteria-content">
            <div className="criteria-list">
              {optimizationCriteria.map((criterion, index) => (
                <div key={criterion} className="criterion-item">
                  <div className="criterion-header">
                    <span className="criterion-name">{getOptimizationType(criterion)}</span>
                    <span className="criterion-status">
                      {optimizationPlan[criterion] ? '✅ Planifié' : '⭕ Non planifié'}
                    </span>
                  </div>
                  
                  <div className="criterion-content">
                    <div className="criterion-description">
                      <p>{getOptimizationDescription(criterion)}</p>
                    </div>
                    
                    <div className="criterion-input">
                      <label className="input-label">
                        Plan d'optimisation :
                      </label>
                      <textarea
                        value={optimizationPlan[criterion] || ''}
                        onChange={(e) => handlePlanChange(criterion, e.target.value)}
                        placeholder={`Décrivez votre plan d'optimisation pour ${getOptimizationType(criterion)}...`}
                        className="optimization-textarea"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Qualité du plan */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Qualité du plan</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {planQuality.score}%
              </span>
            </div>
          </div>
          
          <div className="quality-content">
            <div className="quality-feedback">
              {planQuality.feedback.map((feedback, index) => (
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
              disabled={isValidating || Object.keys(optimizationPlan).length === 0}
            >
              {isValidating ? '⏳ Validation...' : '✅ Valider le plan'}
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
                    <h6>Votre plan :</h6>
                    <div className="plan-comparison">
                      {Object.entries(validationResult.details.userPlan).map(([criterion, value]) => (
                        <div key={criterion} className="plan-item">
                          <span className="plan-criterion">{getOptimizationType(criterion)}:</span>
                          <span className="plan-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h6>Plan attendu :</h6>
                    <div className="plan-comparison">
                      {Object.entries(validationResult.details.expectedPlan).map(([criterion, value]) => (
                        <div key={criterion} className="plan-item">
                          <span className="plan-criterion">{getOptimizationType(criterion)}:</span>
                          <span className="plan-value">{value}</span>
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
      <div className="optimization-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Créez un plan d'optimisation pour améliorer les performances du code fourni.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Analysez le code source</li>
            <li>Identifiez les goulots d'étranglement</li>
            <li>Proposez des optimisations</li>
            <li>Priorisez les améliorations</li>
          </ul>
          <p>
            <strong>Types d'optimisation :</strong>
          </p>
          <ul>
            <li>⏱️ <strong>Temps :</strong> Réduction du temps d'exécution</li>
            <li>💾 <strong>Espace :</strong> Minimisation de l'utilisation mémoire</li>
            <li>⚡ <strong>Efficacité :</strong> Amélioration de l'efficacité globale</li>
            <li>📖 <strong>Lisibilité :</strong> Amélioration de la lisibilité</li>
            <li>🔧 <strong>Maintenance :</strong> Facilitation de la maintenance</li>
          </ul>
          <p>
            <strong>Conseils d'optimisation :</strong>
          </p>
          <ul>
            <li>Identifiez les opérations coûteuses</li>
            <li>Proposez des alternatives plus efficaces</li>
            <li>Considérez les compromis</li>
            <li>Testez vos optimisations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OptimizationExercise;