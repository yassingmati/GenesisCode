import React, { useState } from 'react';

const VisualProgrammingExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [visualElements, setVisualElements] = useState(userAnswer?.elements || []);
  const [currentElement, setCurrentElement] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getElements = () => {
    return exercise.visualElements || [];
  };

  const getExpectedElements = () => {
    return exercise.expectedElements || [];
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const getWorkspace = () => {
    return exercise.visualWorkspace || {};
  };

  const handleElementAdd = (element) => {
    const newElement = {
      ...element,
      id: Date.now(),
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      properties: element.defaultProperties || {}
    };
    
    const newElements = [...visualElements, newElement];
    setVisualElements(newElements);
    onAnswerChange({ elements: newElements });
  };

  const handleElementRemove = (elementId) => {
    const newElements = visualElements.filter(el => el.id !== elementId);
    setVisualElements(newElements);
    onAnswerChange({ elements: newElements });
  };

  const handleElementUpdate = (elementId, updates) => {
    const newElements = visualElements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    setVisualElements(newElements);
    onAnswerChange({ elements: newElements });
  };

  const handleElementSelect = (element) => {
    setCurrentElement(element);
  };

  const handleReset = () => {
    setVisualElements([]);
    setCurrentElement(null);
    setValidationResult(null);
    onAnswerChange({ elements: [] });
  };

  const handleAutoComplete = () => {
    const expectedElements = getExpectedElements();
    setVisualElements(expectedElements);
    onAnswerChange({ elements: expectedElements });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedElements = getExpectedElements();
      const userElementIds = visualElements.map(el => el.id);
      const expectedElementIds = expectedElements.map(el => el.id);
      
      const isCorrect = JSON.stringify(userElementIds.sort()) === JSON.stringify(expectedElementIds.sort());
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Programme visuel correct !' : 'Le programme contient des erreurs.',
        details: {
          userElements: visualElements,
          expectedElements,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getElementStats = () => {
    const totalElements = getElements().length;
    const selectedCount = visualElements.length;
    const completionRate = totalElements > 0 ? (selectedCount / totalElements) * 100 : 0;
    
    return {
      totalElements,
      selectedCount,
      completionRate: Math.round(completionRate)
    };
  };

  const getElementType = (element) => {
    return element.type || 'unknown';
  };

  const getElementIcon = (type) => {
    const icons = {
      'variable': '📊',
      'function': '⚙️',
      'loop': '🔄',
      'condition': '❓',
      'input': '📥',
      'output': '📤',
      'process': '⚡',
      'decision': '🔀',
      'unknown': '❓'
    };
    return icons[type] || icons.unknown;
  };

  const getElementColor = (type) => {
    const colors = {
      'variable': '#4CAF50',
      'function': '#2196F3',
      'loop': '#FF9800',
      'condition': '#9C27B0',
      'input': '#00BCD4',
      'output': '#E91E63',
      'process': '#795548',
      'decision': '#607D8B',
      'unknown': '#9E9E9E'
    };
    return colors[type] || colors.unknown;
  };

  const getElementDescription = (element) => {
    return element.description || element.name || 'Description non disponible';
  };

  const getElementProperties = (element) => {
    return element.properties || {};
  };

  const getProgramQuality = () => {
    const stats = getElementStats();
    const elements = getElements();
    const selectedElements = visualElements;
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la complétude
    if (stats.completionRate >= 80) {
      qualityScore += 30;
      feedback.push('✅ Programme complet');
    } else {
      feedback.push('⚠️ Programme incomplet');
    }
    
    // Vérification de la diversité
    const types = [...new Set(selectedElements.map(el => el.type))];
    if (types.length >= 3) {
      qualityScore += 25;
      feedback.push('✅ Diversité des éléments');
    } else {
      feedback.push('⚠️ Peu de diversité');
    }
    
    // Vérification de la logique
    if (selectedElements.length > 0) {
      qualityScore += 25;
      feedback.push('✅ Logique présente');
    } else {
      feedback.push('❌ Aucune logique');
    }
    
    // Vérification de la cohérence
    if (selectedElements.length >= 3) {
      qualityScore += 20;
      feedback.push('✅ Programme cohérent');
    } else {
      feedback.push('⚠️ Programme trop court');
    }
    
    return {
      score: qualityScore,
      feedback,
      level: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'bon' : qualityScore >= 40 ? 'moyen' : 'faible'
    };
  };

  const getProgramExecution = () => {
    const elements = visualElements;
    const execution = 'Simulation d\'exécution du programme visuel...';
    
    return {
      elements,
      execution,
      result: 'Programme exécuté avec succès'
    };
  };

  const elements = getElements();
  const expectedElements = getExpectedElements();
  const testCases = getTestCases();
  const workspace = getWorkspace();
  const stats = getElementStats();
  const programQuality = getProgramQuality();
  const programExecution = getProgramExecution();

  return (
    <div className="visual-programming-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>🎨 Programmation visuelle</h4>
          <div className="elements-stats">
            <span className="elements-count">
              {stats.selectedCount}/{stats.totalElements} éléments
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

      <div className="visual-programming-layout">
        {/* Éléments disponibles */}
        <div className="available-elements-section">
          <div className="section-header">
            <h5>📦 Éléments disponibles</h5>
            <div className="elements-info">
              <span className="elements-count">
                {elements.length} élément{elements.length > 1 ? 's' : ''} disponible{elements.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="elements-content">
            {elements.length === 0 ? (
              <div className="empty-elements">
                <p>Aucun élément disponible</p>
              </div>
            ) : (
              <div className="elements-grid">
                {elements.map((element, index) => {
                  const isUsed = visualElements.some(el => el.id === element.id);
                  
                  return (
                    <div
                      key={element.id}
                      className={`visual-element ${getElementType(element)} ${isUsed ? 'used' : 'available'}`}
                      onClick={() => !isUsed && handleElementAdd(element)}
                      style={{ borderColor: getElementColor(getElementType(element)) }}
                    >
                      <div className="element-header">
                        <span className="element-icon">{getElementIcon(getElementType(element))}</span>
                        <span className="element-type">{getElementType(element)}</span>
                      </div>
                      
                      <div className="element-content">
                        <div className="element-name">{element.name}</div>
                        <div className="element-description">
                          {getElementDescription(element)}
                        </div>
                      </div>
                      
                      <div className="element-status">
                        {isUsed ? (
                          <span className="used-badge">✅ Utilisé</span>
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

        {/* Zone de travail */}
        <div className="workspace-section">
          <div className="section-header">
            <h5>🎯 Zone de travail</h5>
            <div className="workspace-info">
              <span className="workspace-elements">
                {visualElements.length} élément{visualElements.length > 1 ? 's' : ''} placé{visualElements.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="workspace-content">
            {visualElements.length === 0 ? (
              <div className="empty-workspace">
                <p>Aucun élément placé</p>
                <p>Cliquez sur des éléments pour commencer</p>
              </div>
            ) : (
              <div className="workspace-canvas">
                {visualElements.map((element, index) => (
                  <div
                    key={element.id}
                    className={`workspace-element ${getElementType(element)} ${currentElement?.id === element.id ? 'selected' : ''}`}
                    style={{
                      left: element.position.x,
                      top: element.position.y,
                      borderColor: getElementColor(getElementType(element))
                    }}
                    onClick={() => handleElementSelect(element)}
                  >
                    <div className="element-header">
                      <span className="element-icon">{getElementIcon(getElementType(element))}</span>
                      <span className="element-name">{element.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleElementRemove(element.id);
                        }}
                        className="remove-element-btn"
                        title="Retirer cet élément"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="element-content">
                      <div className="element-description">
                        {getElementDescription(element)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Propriétés de l'élément sélectionné */}
        {currentElement && (
          <div className="element-properties-section">
            <div className="section-header">
              <h5>⚙️ Propriétés de l'élément</h5>
              <div className="properties-info">
                <span className="element-type">{getElementType(currentElement)}</span>
              </div>
            </div>
            
            <div className="properties-content">
              <div className="element-info">
                <h6>{currentElement.name}</h6>
                <p>{getElementDescription(currentElement)}</p>
              </div>
              
              <div className="properties-form">
                {Object.entries(getElementProperties(currentElement)).map(([key, value]) => (
                  <div key={key} className="property-item">
                    <label className="property-label">{key}:</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleElementUpdate(currentElement.id, {
                        properties: {
                          ...getElementProperties(currentElement),
                          [key]: e.target.value
                        }
                      })}
                      className="property-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Qualité du programme */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Qualité du programme</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {programQuality.score}%
              </span>
            </div>
          </div>
          
          <div className="quality-content">
            <div className="quality-feedback">
              {programQuality.feedback.map((feedback, index) => (
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
              <pre className="execution-text">{programExecution.execution}</pre>
              <div className="execution-result">
                {programExecution.result}
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
              disabled={isValidating || visualElements.length === 0}
            >
              {isValidating ? '⏳ Validation...' : '✅ Valider le programme'}
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
                    <h6>Votre programme :</h6>
                    <div className="program-comparison">
                      {validationResult.details.userElements.map((element, index) => (
                        <div key={index} className="program-item">
                          <span className="element-position">{index + 1}.</span>
                          <span className="element-name">{element.name}</span>
                          <span className="element-type">({getElementType(element)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h6>Programme attendu :</h6>
                    <div className="program-comparison">
                      {validationResult.details.expectedElements.map((element, index) => (
                        <div key={index} className="program-item">
                          <span className="element-position">{index + 1}.</span>
                          <span className="element-name">{element.name}</span>
                          <span className="element-type">({getElementType(element)})</span>
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
      <div className="visual-programming-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Créez un programme visuel en assemblant des éléments de programmation.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Cliquez sur les éléments disponibles</li>
            <li>Placez-les dans la zone de travail</li>
            <li>Configurez leurs propriétés</li>
            <li>Organisez la logique du programme</li>
          </ul>
          <p>
            <strong>Types d'éléments :</strong>
          </p>
          <ul>
            <li>📊 <strong>Variables :</strong> Stockage de données</li>
            <li>⚙️ <strong>Fonctions :</strong> Opérations et calculs</li>
            <li>🔄 <strong>Boucles :</strong> Répétition d'actions</li>
            <li>❓ <strong>Conditions :</strong> Prise de décisions</li>
            <li>📥 <strong>Entrées :</strong> Données d'entrée</li>
            <li>📤 <strong>Sorties :</strong> Résultats du programme</li>
          </ul>
          <p>
            <strong>Conseils de programmation :</strong>
          </p>
          <ul>
            <li>Commencez par les entrées</li>
            <li>Ajoutez la logique de traitement</li>
            <li>Terminez par les sorties</li>
            <li>Testez avec différents cas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VisualProgrammingExercise;