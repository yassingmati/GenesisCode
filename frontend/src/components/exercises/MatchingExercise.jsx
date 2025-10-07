import React, { useState } from 'react';

const MatchingExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [matches, setMatches] = useState(userAnswer?.matches || []);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getConcepts = () => {
    return exercise.concepts || [];
  };

  const getDefinitions = () => {
    return exercise.definitions || [];
  };

  const getExpectedMatches = () => {
    return exercise.expectedMatches || [];
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const handleMatch = (conceptId, definitionId) => {
    const newMatches = [...matches];
    const existingMatch = newMatches.find(m => m.conceptId === conceptId || m.definitionId === definitionId);
    
    if (existingMatch) {
      // Remplacer la correspondance existante
      existingMatch.conceptId = conceptId;
      existingMatch.definitionId = definitionId;
    } else {
      // Ajouter une nouvelle correspondance
      newMatches.push({ conceptId, definitionId });
    }
    
    setMatches(newMatches);
    onAnswerChange({ matches: newMatches });
  };

  const handleRemoveMatch = (conceptId, definitionId) => {
    const newMatches = matches.filter(m => 
      !(m.conceptId === conceptId && m.definitionId === definitionId)
    );
    setMatches(newMatches);
    onAnswerChange({ matches: newMatches });
  };

  const handleConceptSelect = (concept) => {
    setCurrentMatch({ ...currentMatch, concept });
  };

  const handleDefinitionSelect = (definition) => {
    setCurrentMatch({ ...currentMatch, definition });
  };

  const handleReset = () => {
    setMatches([]);
    setCurrentMatch(null);
    setValidationResult(null);
    onAnswerChange({ matches: [] });
  };

  const handleAutoMatch = () => {
    const expectedMatches = getExpectedMatches();
    setMatches(expectedMatches);
    onAnswerChange({ matches: expectedMatches });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedMatches = getExpectedMatches();
      const userMatchIds = matches.map(m => `${m.conceptId}-${m.definitionId}`);
      const expectedMatchIds = expectedMatches.map(m => `${m.conceptId}-${m.definitionId}`);
      
      const isCorrect = JSON.stringify(userMatchIds.sort()) === JSON.stringify(expectedMatchIds.sort());
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Correspondances correctes !' : 'Les correspondances contiennent des erreurs.',
        details: {
          userMatches: matches,
          expectedMatches,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getMatchingStats = () => {
    const concepts = getConcepts();
    const definitions = getDefinitions();
    const totalPossible = Math.min(concepts.length, definitions.length);
    const currentMatches = matches.length;
    const completionRate = totalPossible > 0 ? (currentMatches / totalPossible) * 100 : 0;
    
    return {
      totalPossible,
      currentMatches,
      completionRate: Math.round(completionRate)
    };
  };

  const getConceptById = (conceptId) => {
    return getConcepts().find(c => c.id === conceptId);
  };

  const getDefinitionById = (definitionId) => {
    return getDefinitions().find(d => d.id === definitionId);
  };

  const getConceptType = (concept) => {
    return concept.type || 'unknown';
  };

  const getConceptIcon = (type) => {
    const icons = {
      'algorithm': '🧮',
      'data-structure': '📊',
      'programming': '💻',
      'concept': '🧠',
      'formula': '📐',
      'example': '💡',
      'definition': '📚',
      'unknown': '❓'
    };
    return icons[type] || icons.unknown;
  };

  const getConceptColor = (type) => {
    const colors = {
      'algorithm': '#4CAF50',
      'data-structure': '#2196F3',
      'programming': '#FF9800',
      'concept': '#9C27B0',
      'formula': '#F44336',
      'example': '#00BCD4',
      'definition': '#795548',
      'unknown': '#9E9E9E'
    };
    return colors[type] || colors.unknown;
  };

  const getConceptDescription = (concept) => {
    return concept.description || concept.content || 'Description non disponible';
  };

  const getMatchingQuality = () => {
    const stats = getMatchingStats();
    const concepts = getConcepts();
    const definitions = getDefinitions();
    const matches = this.matches;
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la complétude
    if (stats.completionRate >= 100) {
      qualityScore += 40;
      feedback.push('✅ Toutes les correspondances établies');
    } else {
      feedback.push('⚠️ Correspondances manquantes');
    }
    
    // Vérification de la cohérence
    const hasConsistentMatches = matches.every(match => {
      const concept = getConceptById(match.conceptId);
      const definition = getDefinitionById(match.definitionId);
      return concept && definition;
    });
    
    if (hasConsistentMatches) {
      qualityScore += 30;
      feedback.push('✅ Correspondances cohérentes');
    } else {
      feedback.push('⚠️ Correspondances incohérentes');
    }
    
    // Vérification de la logique
    if (matches.length > 0) {
      qualityScore += 30;
      feedback.push('✅ Logique présente');
    } else {
      feedback.push('❌ Aucune logique');
    }
    
    return {
      score: qualityScore,
      feedback,
      level: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'bon' : qualityScore >= 40 ? 'moyen' : 'faible'
    };
  };

  const getMatchingAnalysis = () => {
    const concepts = getConcepts();
    const definitions = getDefinitions();
    const matches = this.matches;
    const analysis = 'Analyse des correspondances...';
    
    return {
      concepts,
      definitions,
      matches,
      analysis,
      result: 'Correspondances analysées avec succès'
    };
  };

  const concepts = getConcepts();
  const definitions = getDefinitions();
  const expectedMatches = getExpectedMatches();
  const testCases = getTestCases();
  const stats = getMatchingStats();
  const matchingQuality = getMatchingQuality();
  const matchingAnalysis = getMatchingAnalysis();

  return (
    <div className="matching-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>🔗 Correspondance</h4>
          <div className="matching-stats">
            <span className="matches-count">
              {stats.currentMatches}/{stats.totalPossible} correspondances
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
          <button onClick={handleAutoMatch} className="auto-btn">
            ▶️ Correspondances automatiques
          </button>
        </div>
      </div>

      <div className="matching-layout">
        {/* Concepts */}
        <div className="concepts-section">
          <div className="section-header">
            <h5>🧠 Concepts</h5>
            <div className="concepts-info">
              <span className="concepts-count">
                {concepts.length} concept{concepts.length > 1 ? 's' : ''} disponible{concepts.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="concepts-content">
            {concepts.length === 0 ? (
              <div className="empty-concepts">
                <p>Aucun concept disponible</p>
              </div>
            ) : (
              <div className="concepts-grid">
                {concepts.map((concept, index) => {
                  const isMatched = matches.some(m => m.conceptId === concept.id);
                  
                  return (
                    <div
                      key={concept.id}
                      className={`concept-item ${getConceptType(concept)} ${isMatched ? 'matched' : 'available'}`}
                      onClick={() => handleConceptSelect(concept)}
                      style={{ borderColor: getConceptColor(getConceptType(concept)) }}
                    >
                      <div className="concept-header">
                        <span className="concept-icon">{getConceptIcon(getConceptType(concept))}</span>
                        <span className="concept-type">{getConceptType(concept)}</span>
                        <span className="concept-number">{index + 1}</span>
                      </div>
                      
                      <div className="concept-content">
                        <div className="concept-text">
                          {concept.text || concept.content}
                        </div>
                        
                        <div className="concept-description">
                          {getConceptDescription(concept)}
                        </div>
                      </div>
                      
                      <div className="concept-status">
                        {isMatched ? (
                          <span className="matched-badge">✅ Correspondance</span>
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

        {/* Définitions */}
        <div className="definitions-section">
          <div className="section-header">
            <h5>📚 Définitions</h5>
            <div className="definitions-info">
              <span className="definitions-count">
                {definitions.length} définition{definitions.length > 1 ? 's' : ''} disponible{definitions.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="definitions-content">
            {definitions.length === 0 ? (
              <div className="empty-definitions">
                <p>Aucune définition disponible</p>
              </div>
            ) : (
              <div className="definitions-grid">
                {definitions.map((definition, index) => {
                  const isMatched = matches.some(m => m.definitionId === definition.id);
                  
                  return (
                    <div
                      key={definition.id}
                      className={`definition-item ${isMatched ? 'matched' : 'available'}`}
                      onClick={() => handleDefinitionSelect(definition)}
                    >
                      <div className="definition-header">
                        <span className="definition-icon">📚</span>
                        <span className="definition-number">{index + 1}</span>
                      </div>
                      
                      <div className="definition-content">
                        <div className="definition-text">
                          {definition.text || definition.content}
                        </div>
                        
                        <div className="definition-description">
                          {definition.description || 'Description non disponible'}
                        </div>
                      </div>
                      
                      <div className="definition-status">
                        {isMatched ? (
                          <span className="matched-badge">✅ Correspondance</span>
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

        {/* Correspondances actuelles */}
        <div className="matches-section">
          <div className="section-header">
            <h5>🔗 Correspondances actuelles</h5>
            <div className="matches-info">
              <span className="matches-count">
                {matches.length} correspondance{matches.length > 1 ? 's' : ''} établie{matches.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="matches-content">
            {matches.length === 0 ? (
              <div className="empty-matches">
                <p>Aucune correspondance établie</p>
              </div>
            ) : (
              <div className="matches-list">
                {matches.map((match, index) => {
                  const concept = getConceptById(match.conceptId);
                  const definition = getDefinitionById(match.definitionId);
                  
                  return (
                    <div key={index} className="match-item">
                      <div className="match-header">
                        <span className="match-number">{index + 1}</span>
                        <button
                          onClick={() => handleRemoveMatch(match.conceptId, match.definitionId)}
                          className="remove-match-btn"
                          title="Supprimer cette correspondance"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="match-content">
                        <div className="match-concept">
                          <div className="concept-header">
                            <span className="concept-icon">{getConceptIcon(getConceptType(concept))}</span>
                            <span className="concept-type">{getConceptType(concept)}</span>
                          </div>
                          <div className="concept-text">
                            {concept?.text || concept?.content || 'Concept inconnu'}
                          </div>
                        </div>
                        
                        <div className="match-arrow">
                          <span className="arrow-icon">→</span>
                        </div>
                        
                        <div className="match-definition">
                          <div className="definition-header">
                            <span className="definition-icon">📚</span>
                            <span className="definition-type">Définition</span>
                          </div>
                          <div className="definition-text">
                            {definition?.text || definition?.content || 'Définition inconnue'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* État actuel */}
        <div className="current-state-section">
          <div className="section-header">
            <h5>📊 État actuel</h5>
            <div className="state-info">
              <span className="matches-established">
                {stats.currentMatches}/{stats.totalPossible} correspondances établies
              </span>
            </div>
          </div>
          
          <div className="state-content">
            <div className="state-stats">
              <div className="stat-item">
                <span className="stat-label">Correspondances établies :</span>
                <span className="stat-value">{stats.currentMatches}/{stats.totalPossible}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Progression :</span>
                <span className="stat-value">{stats.completionRate}%</span>
              </div>
            </div>
            
            {matches.length > 0 && (
              <div className="current-matches">
                <h6>Correspondances actuelles :</h6>
                <div className="matches-list">
                  {matches.map((match, index) => {
                    const concept = getConceptById(match.conceptId);
                    const definition = getDefinitionById(match.definitionId);
                    
                    return (
                      <div key={index} className="match-item">
                        <span className="match-concept">{concept?.text || concept?.content || 'Concept inconnu'}</span>
                        <span className="match-arrow">→</span>
                        <span className="match-definition">{definition?.text || definition?.content || 'Définition inconnue'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Qualité des correspondances */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Qualité des correspondances</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {matchingQuality.score}%
              </span>
            </div>
          </div>
          
          <div className="quality-content">
            <div className="quality-feedback">
              {matchingQuality.feedback.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  {feedback}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analyse des correspondances */}
        <div className="analysis-section">
          <div className="section-header">
            <h5>📊 Analyse des correspondances</h5>
            <div className="analysis-info">
              <span className="analysis-status">En cours...</span>
            </div>
          </div>
          
          <div className="analysis-content">
            <div className="analysis-output">
              <pre className="analysis-text">{matchingAnalysis.analysis}</pre>
              <div className="analysis-result">
                {matchingAnalysis.result}
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
              disabled={isValidating}
            >
              {isValidating ? '⏳ Validation...' : '✅ Valider les correspondances'}
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
                    <h6>Vos correspondances :</h6>
                    <div className="matches-comparison">
                      {validationResult.details.userMatches.map((match, index) => {
                        const concept = getConceptById(match.conceptId);
                        const definition = getDefinitionById(match.definitionId);
                        return (
                          <div key={index} className="match-item">
                            <span className="match-position">{index + 1}.</span>
                            <span className="match-concept">{concept?.text || concept?.content || 'Concept inconnu'}</span>
                            <span className="match-arrow">→</span>
                            <span className="match-definition">{definition?.text || definition?.content || 'Définition inconnue'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h6>Correspondances attendues :</h6>
                    <div className="matches-comparison">
                      {validationResult.details.expectedMatches.map((match, index) => {
                        const concept = getConceptById(match.conceptId);
                        const definition = getDefinitionById(match.definitionId);
                        return (
                          <div key={index} className="match-item">
                            <span className="match-position">{index + 1}.</span>
                            <span className="match-concept">{concept?.text || concept?.content || 'Concept inconnu'}</span>
                            <span className="match-arrow">→</span>
                            <span className="match-definition">{definition?.text || definition?.content || 'Définition inconnue'}</span>
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
      <div className="matching-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Établir des correspondances entre les concepts et leurs définitions.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Cliquez sur un concept</li>
            <li>Cliquez sur sa définition correspondante</li>
            <li>Vérifiez vos correspondances</li>
            <li>Testez vos associations</li>
          </ul>
          <p>
            <strong>Types de concepts :</strong>
          </p>
          <ul>
            <li>🧮 <strong>Algorithmes :</strong> Procédures et méthodes</li>
            <li>📊 <strong>Structures de données :</strong> Organisations et formats</li>
            <li>💻 <strong>Programmation :</strong> Langages et techniques</li>
            <li>🧠 <strong>Concepts :</strong> Idées et notions</li>
            <li>📐 <strong>Formules :</strong> Équations et calculs</li>
            <li>💡 <strong>Exemples :</strong> Cas d'usage et illustrations</li>
          </ul>
          <p>
            <strong>Conseils d'utilisation :</strong>
          </p>
          <ul>
            <li>Analysez les concepts disponibles</li>
            <li>Lisez attentivement les définitions</li>
            <li>Établissez des correspondances logiques</li>
            <li>Vérifiez la cohérence de vos associations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MatchingExercise;