import React, { useState } from 'react';

const CodeCompletionExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [completions, setCompletions] = useState(userAnswer?.completions || {});
  const [currentGap, setCurrentGap] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  const getCodeTemplate = () => {
    return exercise.codeTemplate || '';
  };

  const getGaps = () => {
    return exercise.gaps || [];
  };

  const getExpectedCompletions = () => {
    return exercise.expectedCompletions || {};
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const handleGapCompletion = (gapId, value) => {
    const newCompletions = {
      ...completions,
      [gapId]: value
    };
    
    setCompletions(newCompletions);
    onAnswerChange({ completions: newCompletions });
  };

  const handleNextGap = () => {
    const gaps = getGaps();
    if (currentGap < gaps.length - 1) {
      setCurrentGap(currentGap + 1);
    }
  };

  const handlePreviousGap = () => {
    if (currentGap > 0) {
      setCurrentGap(currentGap - 1);
    }
  };

  const handleReset = () => {
    setCompletions({});
    setCurrentGap(0);
    onAnswerChange({ completions: {} });
  };

  const handleAutoComplete = () => {
    const expectedCompletions = getExpectedCompletions();
    const newCompletions = { ...expectedCompletions };
    
    setCompletions(newCompletions);
    onAnswerChange({ completions: newCompletions });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedCompletions = getExpectedCompletions();
      const isCorrect = Object.keys(expectedCompletions).every(
        gapId => completions[gapId] === expectedCompletions[gapId]
      );
      
      const validationResult = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Toutes les complétions sont correctes !' : 'Certaines complétions sont incorrectes.',
        details: Object.keys(expectedCompletions).map(gapId => ({
          gapId,
          userAnswer: completions[gapId] || '',
          expectedAnswer: expectedCompletions[gapId],
          isCorrect: completions[gapId] === expectedCompletions[gapId]
        }))
      };
      
      return validationResult;
    } finally {
      setIsValidating(false);
    }
  };

  const getCompletionStats = () => {
    const gaps = getGaps();
    const completedGaps = Object.keys(completions).length;
    const completionRate = gaps.length > 0 ? (completedGaps / gaps.length) * 100 : 0;
    
    return {
      totalGaps: gaps.length,
      completedGaps,
      completionRate: Math.round(completionRate)
    };
  };

  const getGapById = (gapId) => {
    return getGaps().find(g => g.id === gapId);
  };

  const getCompletionForGap = (gapId) => {
    return completions[gapId] || '';
  };

  const getGapType = (gapId) => {
    const gap = getGapById(gapId);
    return gap?.type || 'text';
  };

  const getGapOptions = (gapId) => {
    const gap = getGapById(gapId);
    return gap?.options || [];
  };

  const getGapHint = (gapId) => {
    const gap = getGapById(gapId);
    return gap?.hint || '';
  };

  const codeTemplate = getCodeTemplate();
  const gaps = getGaps();
  const expectedCompletions = getExpectedCompletions();
  const testCases = getTestCases();
  const stats = getCompletionStats();
  const currentGapData = gaps[currentGap];

  return (
    <div className="code-completion-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>🔧 Complétion de code</h4>
          <div className="completion-stats">
            <span className="gaps-count">
              {stats.completedGaps}/{stats.totalGaps} trous complétés
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

      <div className="completion-layout">
        {/* Template de code */}
        <div className="code-template-section">
          <div className="section-header">
            <h5>📝 Template de code</h5>
            <div className="template-info">
              <span className="gaps-count">
                {gaps.length} trou{gaps.length > 1 ? 's' : ''} à compléter
              </span>
            </div>
          </div>
          
          <div className="template-content">
            <pre className="code-template">{codeTemplate}</pre>
          </div>
        </div>

        {/* Trous à compléter */}
        <div className="gaps-section">
          <div className="section-header">
            <h5>🔍 Trous à compléter</h5>
            <div className="gaps-info">
              <span className="current-gap">
                Trou {currentGap + 1}/{gaps.length}
              </span>
            </div>
          </div>
          
          <div className="gaps-content">
            {gaps.length === 0 ? (
              <div className="empty-gaps">
                <p>Aucun trou à compléter</p>
              </div>
            ) : (
              <div className="gaps-list">
                {gaps.map((gap, index) => (
                  <div 
                    key={gap.id} 
                    className={`gap-item ${index === currentGap ? 'current' : ''}`}
                    onClick={() => setCurrentGap(index)}
                  >
                    <div className="gap-header">
                      <span className="gap-number">Trou {index + 1}</span>
                      <span className="gap-type">{gap.type}</span>
                      <span className="gap-status">
                        {completions[gap.id] ? '✅ Complété' : '⭕ À compléter'}
                      </span>
                    </div>
                    
                    <div className="gap-content">
                      <div className="gap-description">
                        {gap.description}
                      </div>
                      
                      {gap.hint && (
                        <div className="gap-hint">
                          💡 {gap.hint}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interface de complétion */}
        {currentGapData && (
          <div className="completion-interface">
            <div className="interface-header">
              <h5>✏️ Complétion du trou {currentGap + 1}</h5>
              <div className="interface-info">
                <span className="gap-type">{currentGapData.type}</span>
              </div>
            </div>
            
            <div className="interface-content">
              <div className="gap-description">
                <h6>Description :</h6>
                <p>{currentGapData.description}</p>
              </div>
              
              {currentGapData.hint && (
                <div className="gap-hint">
                  <h6>💡 Indice :</h6>
                  <p>{currentGapData.hint}</p>
                </div>
              )}
              
              <div className="completion-input">
                <h6>Votre réponse :</h6>
                {currentGapData.type === 'select' ? (
                  <select
                    value={getCompletionForGap(currentGapData.id)}
                    onChange={(e) => handleGapCompletion(currentGapData.id, e.target.value)}
                    className="completion-select"
                  >
                    <option value="">Sélectionnez une option</option>
                    {getGapOptions(currentGapData.id).map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={getCompletionForGap(currentGapData.id)}
                    onChange={(e) => handleGapCompletion(currentGapData.id, e.target.value)}
                    placeholder={`Complétez le trou ${currentGap + 1}`}
                    className="completion-input-field"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contrôles de navigation */}
        <div className="navigation-controls">
          <div className="controls-header">
            <h5>🎮 Contrôles de navigation</h5>
            <div className="controls-info">
              <span className="current-position">
                Trou {currentGap + 1}/{gaps.length}
              </span>
            </div>
          </div>
          
          <div className="controls-content">
            <div className="navigation-buttons">
              <button 
                onClick={handlePreviousGap} 
                className="nav-btn previous"
                disabled={currentGap === 0}
              >
                ⏮️ Trou précédent
              </button>
              
              <button 
                onClick={handleNextGap} 
                className="nav-btn next"
                disabled={currentGap >= gaps.length - 1}
              >
                ⏭️ Trou suivant
              </button>
            </div>
            
            <div className="validation-actions">
              <button 
                onClick={handleValidate} 
                className="validate-btn"
                disabled={isValidating}
              >
                {isValidating ? '⏳ Validation...' : '✅ Valider les complétions'}
              </button>
            </div>
          </div>
        </div>

        {/* Historique des complétions */}
        <div className="completions-history">
          <div className="history-header">
            <h5>📋 Historique des complétions</h5>
            <div className="history-info">
              <span className="completions-count">
                {Object.keys(completions).length} complétion{Object.keys(completions).length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="history-content">
            {Object.keys(completions).length === 0 ? (
              <div className="empty-completions">
                <p>Aucune complétion effectuée</p>
                <p>Commencez à compléter les trous</p>
              </div>
            ) : (
              <div className="completions-list">
                {Object.entries(completions).map(([gapId, value]) => {
                  const gap = getGapById(gapId);
                  return (
                    <div key={gapId} className="completion-item">
                      <div className="completion-header">
                        <span className="gap-number">Trou {gap?.id || gapId}</span>
                        <span className="completion-value">{value}</span>
                      </div>
                      
                      <div className="completion-content">
                        <div className="gap-description">
                          {gap?.description || 'Description non disponible'}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
      <div className="completion-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Complétez les trous dans le code pour le rendre fonctionnel.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Analysez le template de code</li>
            <li>Identifiez les trous à compléter</li>
            <li>Remplissez chaque trou approprié</li>
            <li>Vérifiez vos complétions</li>
          </ul>
          <p>
            <strong>Types de complétion :</strong>
          </p>
          <ul>
            <li>📝 <strong>Texte :</strong> Saisie libre de texte</li>
            <li>🔽 <strong>Sélection :</strong> Choix parmi des options</li>
            <li>🔢 <strong>Numérique :</strong> Valeurs numériques</li>
            <li>🔤 <strong>Code :</strong> Fragments de code</li>
          </ul>
          <p>
            <strong>Conseils de complétion :</strong>
          </p>
          <ul>
            <li>Lisez attentivement les descriptions</li>
            <li>Utilisez les indices fournis</li>
            <li>Vérifiez la cohérence du code</li>
            <li>Testez vos complétions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodeCompletionExercise;