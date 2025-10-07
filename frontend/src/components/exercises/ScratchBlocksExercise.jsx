import React, { useState } from 'react';

const ScratchBlocksExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [selectedBlocks, setSelectedBlocks] = useState(userAnswer?.blocks || []);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getBlocks = () => {
    return exercise.scratchBlocks || [];
  };

  const getExpectedBlocks = () => {
    return exercise.expectedBlocks || [];
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const getWorkspace = () => {
    return exercise.scratchWorkspace || {};
  };

  const handleBlockSelect = (block) => {
    const newBlocks = [...selectedBlocks, { ...block, id: Date.now() }];
    setSelectedBlocks(newBlocks);
    onAnswerChange({ blocks: newBlocks });
  };

  const handleBlockRemove = (blockId) => {
    const newBlocks = selectedBlocks.filter(block => block.id !== blockId);
    setSelectedBlocks(newBlocks);
    onAnswerChange({ blocks: newBlocks });
  };

  const handleBlockMove = (fromIndex, toIndex) => {
    const newBlocks = [...selectedBlocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    setSelectedBlocks(newBlocks);
    onAnswerChange({ blocks: newBlocks });
  };

  const handleReset = () => {
    setSelectedBlocks([]);
    setValidationResult(null);
    onAnswerChange({ blocks: [] });
  };

  const handleAutoComplete = () => {
    const expectedBlocks = getExpectedBlocks();
    setSelectedBlocks(expectedBlocks);
    onAnswerChange({ blocks: expectedBlocks });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedBlocks = getExpectedBlocks();
      const userBlockIds = selectedBlocks.map(block => block.id);
      const expectedBlockIds = expectedBlocks.map(block => block.id);
      
      const isCorrect = JSON.stringify(userBlockIds.sort()) === JSON.stringify(expectedBlockIds.sort());
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Programme Scratch correct !' : 'Le programme contient des erreurs.',
        details: {
          userBlocks: selectedBlocks,
          expectedBlocks,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getBlockStats = () => {
    const totalBlocks = getBlocks().length;
    const selectedCount = selectedBlocks.length;
    const completionRate = totalBlocks > 0 ? (selectedCount / totalBlocks) * 100 : 0;
    
    return {
      totalBlocks,
      selectedCount,
      completionRate: Math.round(completionRate)
    };
  };

  const getBlockCategory = (block) => {
    return block.category || 'unknown';
  };

  const getBlockIcon = (block) => {
    return block.icon || '🧩';
  };

  const getBlockColor = (category) => {
    const colors = {
      'motion': '#4C97FF',
      'looks': '#9966FF',
      'sound': '#CF63CF',
      'events': '#FFBF00',
      'control': '#FFAB19',
      'sensing': '#5CB1D6',
      'operators': '#59C059',
      'variables': '#FF8C1A',
      'lists': '#FF661A',
      'unknown': '#CCCCCC'
    };
    return colors[category] || colors.unknown;
  };

  const getBlockDescription = (block) => {
    return block.description || block.text || 'Description non disponible';
  };

  const getBlockUsage = () => {
    const blocks = getBlocks();
    const usage = blocks.map(block => ({
      block,
      used: selectedBlocks.some(selected => selected.id === block.id),
      count: selectedBlocks.filter(selected => selected.id === block.id).length
    }));
    
    return usage;
  };

  const getProgramQuality = () => {
    const stats = getBlockStats();
    const blockUsage = getBlockUsage();
    const usedBlocks = blockUsage.filter(b => b.used);
    
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
    const categories = [...new Set(selectedBlocks.map(block => block.category))];
    if (categories.length >= 3) {
      qualityScore += 25;
      feedback.push('✅ Diversité des blocs');
    } else {
      feedback.push('⚠️ Peu de diversité');
    }
    
    // Vérification de la logique
    if (selectedBlocks.length > 0) {
      qualityScore += 25;
      feedback.push('✅ Logique présente');
    } else {
      feedback.push('❌ Aucune logique');
    }
    
    // Vérification de la cohérence
    if (selectedBlocks.length >= 3) {
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
    const blocks = selectedBlocks;
    const execution = 'Simulation d\'exécution du programme Scratch...';
    
    return {
      blocks,
      execution,
      result: 'Programme exécuté avec succès'
    };
  };

  const blocks = getBlocks();
  const expectedBlocks = getExpectedBlocks();
  const testCases = getTestCases();
  const workspace = getWorkspace();
  const stats = getBlockStats();
  const blockUsage = getBlockUsage();
  const programQuality = getProgramQuality();
  const programExecution = getProgramExecution();

  return (
    <div className="scratch-blocks-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>🧩 Blocs Scratch</h4>
          <div className="blocks-stats">
            <span className="blocks-count">
              {stats.selectedCount}/{stats.totalBlocks} blocs
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

      <div className="scratch-blocks-layout">
        {/* Blocs disponibles */}
        <div className="available-blocks-section">
          <div className="section-header">
            <h5>📦 Blocs disponibles</h5>
            <div className="blocks-info">
              <span className="blocks-count">
                {blocks.length} bloc{blocks.length > 1 ? 's' : ''} disponible{blocks.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="blocks-content">
            {blocks.length === 0 ? (
              <div className="empty-blocks">
                <p>Aucun bloc disponible</p>
              </div>
            ) : (
              <div className="blocks-grid">
                {blocks.map((block, index) => {
                  const isUsed = blockUsage[index]?.used;
                  const usageCount = blockUsage[index]?.count || 0;
                  
                  return (
                    <div
                      key={block.id}
                      className={`scratch-block ${getBlockCategory(block)} ${isUsed ? 'used' : 'available'}`}
                      onClick={() => !isUsed && handleBlockSelect(block)}
                      style={{ borderColor: getBlockColor(getBlockCategory(block)) }}
                    >
                      <div className="block-header">
                        <span className="block-icon">{getBlockIcon(block)}</span>
                        <span className="block-category">{getBlockCategory(block)}</span>
                        {usageCount > 0 && (
                          <span className="usage-count">{usageCount}</span>
                        )}
                      </div>
                      
                      <div className="block-content">
                        <div className="block-text">{block.text}</div>
                        <div className="block-description">
                          {getBlockDescription(block)}
                        </div>
                      </div>
                      
                      <div className="block-status">
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

        {/* Programme assemblé */}
        <div className="program-section">
          <div className="section-header">
            <h5>🎯 Programme assemblé</h5>
            <div className="program-info">
              <span className="program-blocks">
                {selectedBlocks.length} bloc{selectedBlocks.length > 1 ? 's' : ''} sélectionné{selectedBlocks.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="program-content">
            {selectedBlocks.length === 0 ? (
              <div className="empty-program">
                <p>Aucun bloc sélectionné</p>
                <p>Cliquez sur des blocs pour commencer</p>
              </div>
            ) : (
              <div className="program-blocks">
                {selectedBlocks.map((block, index) => (
                  <div
                    key={block.id}
                    className={`program-block ${getBlockCategory(block)}`}
                    style={{ borderColor: getBlockColor(getBlockCategory(block)) }}
                  >
                    <div className="block-header">
                      <span className="block-icon">{getBlockIcon(block)}</span>
                      <span className="block-position">{index + 1}</span>
                      <button
                        onClick={() => handleBlockRemove(block.id)}
                        className="remove-block-btn"
                        title="Retirer ce bloc"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="block-content">
                      <div className="block-text">{block.text}</div>
                      <div className="block-description">
                        {getBlockDescription(block)}
                      </div>
                    </div>
                    
                    <div className="block-controls">
                      <button
                        onClick={() => index > 0 && handleBlockMove(index, index - 1)}
                        className="move-btn up"
                        disabled={index === 0}
                        title="Déplacer vers le haut"
                      >
                        ↑
                      </button>
                      
                      <button
                        onClick={() => index < selectedBlocks.length - 1 && handleBlockMove(index, index + 1)}
                        className="move-btn down"
                        disabled={index === selectedBlocks.length - 1}
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
              disabled={isValidating || selectedBlocks.length === 0}
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
                      {validationResult.details.userBlocks.map((block, index) => (
                        <div key={index} className="program-item">
                          <span className="block-position">{index + 1}.</span>
                          <span className="block-text">{block.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h6>Programme attendu :</h6>
                    <div className="program-comparison">
                      {validationResult.details.expectedBlocks.map((block, index) => (
                        <div key={index} className="program-item">
                          <span className="block-position">{index + 1}.</span>
                          <span className="block-text">{block.text}</span>
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
      <div className="scratch-blocks-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Assemblez les blocs Scratch pour créer un programme fonctionnel.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Cliquez sur les blocs disponibles</li>
            <li>Organisez-les dans l'ordre logique</li>
            <li>Vérifiez la cohérence du programme</li>
            <li>Testez l'exécution</li>
          </ul>
          <p>
            <strong>Types de blocs :</strong>
          </p>
          <ul>
            <li>🎯 <strong>Mouvement :</strong> Déplacement et rotation</li>
            <li>👁️ <strong>Apparence :</strong> Changements visuels</li>
            <li>🔊 <strong>Son :</strong> Effets sonores</li>
            <li>⚡ <strong>Événements :</strong> Déclencheurs</li>
            <li>🔄 <strong>Contrôle :</strong> Boucles et conditions</li>
          </ul>
          <p>
            <strong>Conseils d'assemblage :</strong>
          </p>
          <ul>
            <li>Commencez par les événements</li>
            <li>Ajoutez les actions dans l'ordre</li>
            <li>Vérifiez la logique du programme</li>
            <li>Testez avec différents cas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScratchBlocksExercise;