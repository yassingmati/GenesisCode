import React, { useState } from 'react';

const ConceptMappingExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [conceptMap, setConceptMap] = useState(userAnswer?.map || {});
  const [currentConcept, setCurrentConcept] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getConcepts = () => {
    return exercise.concepts || [];
  };

  const getDefinitions = () => {
    return exercise.definitions || [];
  };

  const getExpectedMap = () => {
    return exercise.expectedMap || {};
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const handleConceptMapping = (conceptId, definitionId) => {
    const newMap = {
      ...conceptMap,
      [conceptId]: definitionId
    };
    
    setConceptMap(newMap);
    onAnswerChange({ map: newMap });
  };

  const handleConceptUnmapping = (conceptId) => {
    const newMap = { ...conceptMap };
    delete newMap[conceptId];
    setConceptMap(newMap);
    onAnswerChange({ map: newMap });
  };

  const handleConceptSelect = (concept) => {
    setCurrentConcept(concept);
  };

  const handleReset = () => {
    setConceptMap({});
    setCurrentConcept(null);
    setValidationResult(null);
    onAnswerChange({ map: {} });
  };

  const handleAutoMap = () => {
    const expectedMap = getExpectedMap();
    setConceptMap(expectedMap);
    onAnswerChange({ map: expectedMap });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedMap = getExpectedMap();
      const isCorrect = Object.keys(expectedMap).every(
        conceptId => conceptMap[conceptId] === expectedMap[conceptId]
      );
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Cartographie conceptuelle correcte !' : 'La cartographie contient des erreurs.',
        details: {
          userMap: conceptMap,
          expectedMap,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getMappingStats = () => {
    const concepts = getConcepts();
    const mappedConcepts = Object.keys(conceptMap).length;
    const completionRate = concepts.length > 0 ? (mappedConcepts / concepts.length) * 100 : 0;
    
    return {
      totalConcepts: concepts.length,
      mappedConcepts,
      completionRate: Math.round(completionRate)
    };
  };

  const getConceptById = (conceptId) => {
    return getConcepts().find(c => c.id === conceptId);
  };

  const getDefinitionById = (definitionId) => {
    return getDefinitions().find(d => d.id === definitionId);
  };

  const getMappedDefinition = (conceptId) => {
    const definitionId = conceptMap[conceptId];
    return definitionId ? getDefinitionById(definitionId) : null;
  };

  const getConceptCategory = (concept) => {
    return concept.category || 'unknown';
  };

  const getConceptIcon = (category) => {
    const icons = {
      'algorithm': '🧮',
      'data': '📊',
      'structure': '🏗️',
      'function': '⚙️',
      'variable': '📝',
      'loop': '🔄',
      'condition': '❓',
      'unknown': '❓'
    };
    return icons[category] || icons.unknown;
  };

  const getConceptColor = (category) => {
    const colors = {
      'algorithm': '#4CAF50',
      'data': '#2196F3',
      'structure': '#FF9800',
      'function': '#9C27B0',
      'variable': '#00BCD4',
      'loop': '#E91E63',
      'condition': '#795548',
      'unknown': '#9E9E9E'
    };
    return colors[category] || colors.unknown;
  };

  const getMappingQuality = () => {
    const stats = getMappingStats();
    const concepts = getConcepts();
    const mappedConcepts = Object.keys(conceptMap);
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la complétude
    if (stats.completionRate >= 100) {
      qualityScore += 40;
      feedback.push('✅ Cartographie complète');
    } else {
      feedback.push('⚠️ Cartographie incomplète');
    }
    
    // Vérification de la cohérence
    const hasConsistentMapping = mappedConcepts.every(conceptId => {
      const definitionId = conceptMap[conceptId];
      return definitionId && getDefinitionById(definitionId);
    });
    
    if (hasConsistentMapping) {
      qualityScore += 30;
      feedback.push('✅ Cartographie cohérente');
    } else {
      feedback.push('⚠️ Cartographie incohérente');
    }
    
    // Vérification de la qualité
    const hasQualityMapping = mappedConcepts.every(conceptId => {
      const definitionId = conceptMap[conceptId];
      const definition = getDefinitionById(definitionId);
      return definition && definition.text && definition.text.length > 10;
    });
    
    if (hasQualityMapping) {
      qualityScore += 30;
      feedback.push('✅ Cartographie détaillée');
    } else {
      feedback.push('⚠️ Cartographie trop courte');
    }
    
    return {
      score: qualityScore,
      feedback,
      level: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'bon' : qualityScore >= 40 ? 'moyen' : 'faible'
    };
  };

  const getMappingVisualization = () => {
    const concepts = getConcepts();
    const definitions = getDefinitions();
    const mappedConcepts = Object.keys(conceptMap);
    
    return {
      concepts,
      definitions,
      mappings: mappedConcepts.map(conceptId => ({
        concept: getConceptById(conceptId),
        definition: getMappedDefinition(conceptId)
      })),
      visualization: 'Visualisation de la cartographie conceptuelle...'
    };
  };

  const concepts = getConcepts();
  const definitions = getDefinitions();
  const expectedMap = getExpectedMap();
  const testCases = getTestCases();
  const stats = getMappingStats();
  const mappingQuality = getMappingQuality();
  const mappingVisualization = getMappingVisualization();

  return (
    <div className="concept-mapping-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>🗺️ Cartographie conceptuelle</h4>
          <div className="mapping-stats">
            <span className="concepts-count">
              {stats.mappedConcepts}/{stats.totalConcepts} concepts
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
          <button onClick={handleAutoMap} className="auto-btn">
            ▶️ Cartographie automatique
          </button>
        </div>
      </div>

      <div className="concept-mapping-layout">
        {/* Concepts */}
        <div className="concepts-section">
          <div className="section-header">
            <h5>📝 Concepts</h5>
            <div className="concepts-info">
              <span className="concepts-count">
                {concepts.length} concept{concepts.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="concepts-content">
            {concepts.length === 0 ? (
              <div className="empty-concepts">
                <p>Aucun concept disponible</p>
              </div>
            ) : (
              <div className="concepts-list">
                {concepts.map((concept, index) => {
                  const mappedDefinition = getMappedDefinition(concept.id);
                  const isMapped = !!mappedDefinition;
                  
                  return (
                    <div
                      key={concept.id}
                      className={`concept-item ${getConceptCategory(concept)} ${isMapped ? 'mapped' : 'unmapped'} ${currentConcept?.id === concept.id ? 'selected' : ''}`}
                      onClick={() => handleConceptSelect(concept)}
                      style={{ borderColor: getConceptColor(getConceptCategory(concept)) }}
                    >
                      <div className="concept-header">
                        <span className="concept-icon">{getConceptIcon(getConceptCategory(concept))}</span>
                        <span className="concept-name">{concept.name}</span>
                        <span className="concept-category">{getConceptCategory(concept)}</span>
                      </div>
                      
                      <div className="concept-content">
                        <div className="concept-description">
                          {concept.description}
                        </div>
                        
                        {isMapped && (
                          <div className="concept-mapping">
                            <span className="mapping-label">Définition :</span>
                            <span className="mapping-definition">{mappedDefinition.text}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="concept-status">
                        {isMapped ? (
                          <span className="mapped-badge">✅ Mappé</span>
                        ) : (
                          <span className="unmapped-badge">⭕ Non mappé</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Définitions */}
        <div className="definitions-section">
          <div className="section-header">
            <h5>📚 Définitions</h5>
            <div className="definitions-info">
              <span className="definitions-count">
                {definitions.length} définition{definitions.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="definitions-content">
            {definitions.length === 0 ? (
              <div className="empty-definitions">
                <p>Aucune définition disponible</p>
              </div>
            ) : (
              <div className="definitions-list">
                {definitions.map((definition, index) => {
                  const isUsed = Object.values(conceptMap).includes(definition.id);
                  
                  return (
                    <div
                      key={definition.id}
                      className={`definition-item ${isUsed ? 'used' : 'available'}`}
                      onClick={() => currentConcept && !isUsed && handleConceptMapping(currentConcept.id, definition.id)}
                    >
                      <div className="definition-header">
                        <span className="definition-icon">📚</span>
                        <span className="definition-name">{definition.name}</span>
                      </div>
                      
                      <div className="definition-content">
                        <div className="definition-text">
                          {definition.text}
                        </div>
                      </div>
                      
                      <div className="definition-status">
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

        {/* Concept sélectionné */}
        {currentConcept && (
          <div className="selected-concept-section">
            <div className="section-header">
              <h5>🎯 Concept sélectionné</h5>
              <div className="concept-info">
                <span className="concept-type">{getConceptCategory(currentConcept)}</span>
              </div>
            </div>
            
            <div className="concept-content">
              <div className="concept-details">
                <h6>{currentConcept.name}</h6>
                <p>{currentConcept.description}</p>
              </div>
              
              <div className="concept-actions">
                <button
                  onClick={() => handleConceptUnmapping(currentConcept.id)}
                  className="unmap-btn"
                  disabled={!conceptMap[currentConcept.id]}
                >
                  🔗 Démapper
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Qualité de la cartographie */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Qualité de la cartographie</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {mappingQuality.score}%
              </span>
            </div>
          </div>
          
          <div className="quality-content">
            <div className="quality-feedback">
              {mappingQuality.feedback.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  {feedback}
                </div>
              ))}
            </div>
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
              <pre className="visualization-text">{mappingVisualization.visualization}</pre>
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
              disabled={isValidating || Object.keys(conceptMap).length === 0}
            >
              {isValidating ? '⏳ Validation...' : '✅ Valider la cartographie'}
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
                    <h6>Votre cartographie :</h6>
                    <div className="mapping-comparison">
                      {Object.entries(validationResult.details.userMap).map(([conceptId, definitionId]) => {
                        const concept = getConceptById(conceptId);
                        const definition = getDefinitionById(definitionId);
                        return (
                          <div key={conceptId} className="mapping-item">
                            <span className="concept-name">{concept?.name || 'Concept inconnu'}</span>
                            <span className="mapping-arrow">→</span>
                            <span className="definition-name">{definition?.name || 'Définition inconnue'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h6>Cartographie attendue :</h6>
                    <div className="mapping-comparison">
                      {Object.entries(validationResult.details.expectedMap).map(([conceptId, definitionId]) => {
                        const concept = getConceptById(conceptId);
                        const definition = getDefinitionById(definitionId);
                        return (
                          <div key={conceptId} className="mapping-item">
                            <span className="concept-name">{concept?.name || 'Concept inconnu'}</span>
                            <span className="mapping-arrow">→</span>
                            <span className="definition-name">{definition?.name || 'Définition inconnue'}</span>
                          </div>
                        );
                      })}
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
      <div className="concept-mapping-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Associez chaque concept avec sa définition appropriée pour créer une cartographie conceptuelle.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Sélectionnez un concept</li>
            <li>Choisissez sa définition correspondante</li>
            <li>Vérifiez la cohérence des associations</li>
            <li>Complétez toute la cartographie</li>
          </ul>
          <p>
            <strong>Types de concepts :</strong>
          </p>
          <ul>
            <li>🧮 <strong>Algorithmes :</strong> Procédures de résolution</li>
            <li>📊 <strong>Données :</strong> Informations et structures</li>
            <li>🏗️ <strong>Structures :</strong> Organisation des données</li>
            <li>⚙️ <strong>Fonctions :</strong> Opérations et calculs</li>
            <li>📝 <strong>Variables :</strong> Stockage de valeurs</li>
          </ul>
          <p>
            <strong>Conseils de cartographie :</strong>
          </p>
          <ul>
            <li>Analysez chaque concept</li>
            <li>Identifiez sa définition la plus appropriée</li>
            <li>Vérifiez la logique des associations</li>
            <li>Testez la cohérence globale</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConceptMappingExercise;