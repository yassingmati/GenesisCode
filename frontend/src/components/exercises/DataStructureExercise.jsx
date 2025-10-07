import React, { useState } from 'react';

const DataStructureExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [dataStructure, setDataStructure] = useState(userAnswer?.structure || {});
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getStructureType = () => {
    return exercise.dataStructureType || '';
  };

  const getOperations = () => {
    return exercise.dataStructureOperations || [];
  };

  const getExpectedStructure = () => {
    return exercise.expectedStructure || {};
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const handleStructureChange = (operation, value) => {
    const newStructure = {
      ...dataStructure,
      [operation]: value
    };
    
    setDataStructure(newStructure);
    onAnswerChange({ structure: newStructure });
  };

  const handleReset = () => {
    setDataStructure({});
    setValidationResult(null);
    onAnswerChange({ structure: {} });
  };

  const handleAutoComplete = () => {
    const expectedStructure = getExpectedStructure();
    setDataStructure(expectedStructure);
    onAnswerChange({ structure: expectedStructure });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedStructure = getExpectedStructure();
      const isCorrect = Object.keys(expectedStructure).every(
        operation => dataStructure[operation] === expectedStructure[operation]
      );
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Structure de données correcte !' : 'La structure contient des erreurs.',
        details: {
          userStructure: dataStructure,
          expectedStructure,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getStructureStats = () => {
    const operations = getOperations();
    const completedOperations = operations.filter(op => dataStructure[op.id]);
    const completionRate = operations.length > 0 ? (completedOperations.length / operations.length) * 100 : 0;
    
    return {
      totalOperations: operations.length,
      completedOperations: completedOperations.length,
      completionRate: Math.round(completionRate)
    };
  };

  const getOperationType = (operation) => {
    return operation.type || 'unknown';
  };

  const getOperationDescription = (operation) => {
    return operation.description || operation.name || 'Description non disponible';
  };

  const getOperationComplexity = (operation) => {
    return operation.complexity || 'O(?)';
  };

  const getOperationIcon = (type) => {
    const icons = {
      'insert': '➕',
      'delete': '➖',
      'search': '🔍',
      'update': '✏️',
      'traverse': '🔄',
      'sort': '📊',
      'merge': '🔗',
      'split': '✂️',
      'unknown': '❓'
    };
    return icons[type] || icons.unknown;
  };

  const getOperationColor = (type) => {
    const colors = {
      'insert': '#4CAF50',
      'delete': '#F44336',
      'search': '#2196F3',
      'update': '#FF9800',
      'traverse': '#9C27B0',
      'sort': '#E91E63',
      'merge': '#00BCD4',
      'split': '#795548',
      'unknown': '#9E9E9E'
    };
    return colors[type] || colors.unknown;
  };

  const getStructureQuality = () => {
    const stats = getStructureStats();
    const operations = getOperations();
    const completedOperations = operations.filter(op => dataStructure[op.id]);
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la complétude
    if (stats.completionRate >= 100) {
      qualityScore += 40;
      feedback.push('✅ Structure complète');
    } else {
      feedback.push('⚠️ Structure incomplète');
    }
    
    // Vérification de la cohérence
    const hasConsistentStructure = operations.every(op => {
      const value = dataStructure[op.id];
      return value && value.length > 0;
    });
    
    if (hasConsistentStructure) {
      qualityScore += 30;
      feedback.push('✅ Structure cohérente');
    } else {
      feedback.push('⚠️ Structure incohérente');
    }
    
    // Vérification de la qualité
    const hasQualityStructure = operations.every(op => {
      const value = dataStructure[op.id];
      return value && value.length > 5;
    });
    
    if (hasQualityStructure) {
      qualityScore += 30;
      feedback.push('✅ Structure détaillée');
    } else {
      feedback.push('⚠️ Structure trop courte');
    }
    
    return {
      score: qualityScore,
      feedback,
      level: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'bon' : qualityScore >= 40 ? 'moyen' : 'faible'
    };
  };

  const getStructureVisualization = () => {
    const structureType = getStructureType();
    const operations = getOperations();
    const completedOperations = operations.filter(op => dataStructure[op.id]);
    
    return {
      type: structureType,
      operations: completedOperations,
      visualization: `Visualisation de la structure ${structureType}...`
    };
  };

  const structureType = getStructureType();
  const operations = getOperations();
  const expectedStructure = getExpectedStructure();
  const testCases = getTestCases();
  const stats = getStructureStats();
  const structureQuality = getStructureQuality();
  const structureVisualization = getStructureVisualization();

  return (
    <div className="data-structure-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>📊 Structure de données</h4>
          <div className="structure-stats">
            <span className="operations-count">
              {stats.completedOperations}/{stats.totalOperations} opérations
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

      <div className="data-structure-layout">
        {/* Type de structure */}
        <div className="structure-type-section">
          <div className="section-header">
            <h5>🏗️ Type de structure</h5>
            <div className="type-info">
              <span className="structure-type">{structureType}</span>
            </div>
          </div>
          
          <div className="type-content">
            <div className="type-description">
              <p>Structure de données de type <strong>{structureType}</strong></p>
              <p>Définissez les opérations et leurs implémentations</p>
            </div>
          </div>
        </div>

        {/* Opérations */}
        <div className="operations-section">
          <div className="section-header">
            <h5>⚙️ Opérations</h5>
            <div className="operations-info">
              <span className="operations-count">
                {operations.length} opération{operations.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="operations-content">
            {operations.length === 0 ? (
              <div className="empty-operations">
                <p>Aucune opération définie</p>
              </div>
            ) : (
              <div className="operations-list">
                {operations.map((operation, index) => (
                  <div key={operation.id} className="operation-item">
                    <div className="operation-header">
                      <span className="operation-icon">{getOperationIcon(getOperationType(operation))}</span>
                      <span className="operation-name">{operation.name}</span>
                      <span className="operation-type">{getOperationType(operation)}</span>
                      <span className="operation-complexity">{getOperationComplexity(operation)}</span>
                    </div>
                    
                    <div className="operation-content">
                      <div className="operation-description">
                        <p>{getOperationDescription(operation)}</p>
                      </div>
                      
                      <div className="operation-input">
                        <label className="input-label">
                          Implémentation :
                        </label>
                        <textarea
                          value={dataStructure[operation.id] || ''}
                          onChange={(e) => handleStructureChange(operation.id, e.target.value)}
                          placeholder={`Implémentez l'opération ${operation.name}...`}
                          className="operation-textarea"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visualisation */}
        <div className="visualization-section">
          <div className="section-header">
            <h5>👁️ Visualisation</h5>
            <div className="visualization-info">
              <span className="visualization-status">En cours...</span>
            </div>
          </div>
          
          <div className="visualization-content">
            <div className="visualization-output">
              <pre className="visualization-text">{structureVisualization.visualization}</pre>
            </div>
          </div>
        </div>

        {/* Qualité de la structure */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Qualité de la structure</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {structureQuality.score}%
              </span>
            </div>
          </div>
          
          <div className="quality-content">
            <div className="quality-feedback">
              {structureQuality.feedback.map((feedback, index) => (
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
              disabled={isValidating || Object.keys(dataStructure).length === 0}
            >
              {isValidating ? '⏳ Validation...' : '✅ Valider la structure'}
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
                    <h6>Votre structure :</h6>
                    <div className="structure-comparison">
                      {Object.entries(validationResult.details.userStructure).map(([operation, value]) => (
                        <div key={operation} className="structure-item">
                          <span className="operation-name">{operation}:</span>
                          <span className="operation-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h6>Structure attendue :</h6>
                    <div className="structure-comparison">
                      {Object.entries(validationResult.details.expectedStructure).map(([operation, value]) => (
                        <div key={operation} className="structure-item">
                          <span className="operation-name">{operation}:</span>
                          <span className="operation-value">{value}</span>
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
      <div className="data-structure-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Implémentez les opérations pour la structure de données spécifiée.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Analysez le type de structure</li>
            <li>Identifiez les opérations nécessaires</li>
            <li>Implémentez chaque opération</li>
            <li>Vérifiez la cohérence</li>
          </ul>
          <p>
            <strong>Types d'opérations :</strong>
          </p>
          <ul>
            <li>➕ <strong>Insertion :</strong> Ajout d'éléments</li>
            <li>➖ <strong>Suppression :</strong> Retrait d'éléments</li>
            <li>🔍 <strong>Recherche :</strong> Localisation d'éléments</li>
            <li>✏️ <strong>Modification :</strong> Mise à jour d'éléments</li>
            <li>🔄 <strong>Parcours :</strong> Traitement de tous les éléments</li>
          </ul>
          <p>
            <strong>Conseils d'implémentation :</strong>
          </p>
          <ul>
            <li>Considérez la complexité temporelle</li>
            <li>Optimisez l'utilisation mémoire</li>
            <li>Gérez les cas limites</li>
            <li>Testez avec différents scénarios</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataStructureExercise;