import React, { useState } from 'react';

const DragDropExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [dragItems, setDragItems] = useState(userAnswer?.items || []);
  const [dropZones, setDropZones] = useState(userAnswer?.zones || []);
  const [currentItem, setCurrentItem] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getElements = () => {
    // Normalize strings to objects
    return (exercise.elements || []).map(e =>
      typeof e === 'string' ? { id: e, text: e, content: e, type: 'unknown' } : e
    );
  };

  const getTargets = () => {
    // Normalize strings to objects
    return (exercise.targets || []).map(t =>
      typeof t === 'string' ? { id: t, title: t, type: 'zone' } : t
    );
  };

  // Helper to normalize answer format for backend { element: target }
  // Helper to normalize answer format checks
  const formatAnswer = (zones) => {
    const map = {};
    const elems = getElements();
    const targs = getTargets();

    zones.forEach(z => {
      const elem = elems.find(e => e.id === z.itemId);
      const targ = targs.find(t => t.id === z.id);
      if (elem && targ) {
        // Use text/content for the KEY (to match solution keys)
        const key = elem.text || elem.content || elem.id;
        // Use title/id for the VALUE (to match solution values)
        const val = targ.title || targ.id;
        map[key] = val;
      }
    });

    // Return combined payload: UI state + Validation Map
    return {
      items: dragItems,
      zones: zones,
      userMap: map
    };
  };

  const getExpectedDropZones = () => {
    return exercise.expectedDropZones || [];
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const handleDragStart = (e, itemId) => {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
    setCurrentItem(itemId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, zoneId) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');

    // Mettre à jour les zones de dépôt
    const newZones = [...dropZones];
    const zoneIndex = newZones.findIndex(z => z.id === zoneId);

    if (zoneIndex !== -1) {
      newZones[zoneIndex].itemId = itemId;
    } else {
      newZones.push({ id: zoneId, itemId });
    }

    setDropZones(newZones);
    setDropZones(newZones);
    onAnswerChange({ items: dragItems, zones: newZones });
  };

  const handleRemoveFromZone = (zoneId) => {
    const newZones = dropZones.filter(z => z.id !== zoneId);
    setDropZones(newZones);
    setDropZones(newZones);
    onAnswerChange({ items: dragItems, zones: newZones });
  };

  const handleItemSelect = (item) => {
    setCurrentItem(item);
  };

  const handleReset = () => {
    setDragItems([]);
    setDropZones([]);
    setCurrentItem(null);
    setValidationResult(null);
    onAnswerChange({ items: [], zones: [] });
  };

  const handleAutoDrop = () => {
    const expectedDropZones = getExpectedDropZones();
    setDropZones(expectedDropZones);
    onAnswerChange({ items: dragItems, zones: expectedDropZones });
  };

  const handleValidate = async () => {
    setIsValidating(true);

    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const expectedDropZones = getExpectedDropZones();
      const userZoneIds = dropZones.map(z => z.id);
      const expectedZoneIds = expectedDropZones.map(z => z.id);

      const isCorrect = JSON.stringify(userZoneIds.sort()) === JSON.stringify(expectedZoneIds.sort());

      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Glisser-déposer correct !' : 'Le glisser-déposer contient des erreurs.',
        details: {
          userZones: dropZones,
          expectedDropZones,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };

      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getDragDropStats = () => {
    const totalZones = getTargets().length;
    const filledZones = dropZones.length;
    const completionRate = totalZones > 0 ? (filledZones / totalZones) * 100 : 0;

    return {
      totalZones,
      filledZones,
      completionRate: Math.round(completionRate)
    };
  };

  const getElementById = (elementId) => {
    return getElements().find(e => e.id === elementId);
  };

  const getTargetById = (targetId) => {
    return getTargets().find(t => t.id === targetId);
  };

  const getItemInZone = (zoneId) => {
    const zone = dropZones.find(z => z.id === zoneId);
    return zone ? getElementById(zone.itemId) : null;
  };

  const getElementType = (element) => {
    return element.type || 'unknown';
  };

  const getElementIcon = (type) => {
    const icons = {
      'concept': '🧠',
      'definition': '📚',
      'example': '💡',
      'formula': '🧮',
      'code': '💻',
      'image': '🖼️',
      'video': '🎥',
      'audio': '🔊',
      'unknown': '❓'
    };
    return icons[type] || icons.unknown;
  };

  const getElementColor = (type) => {
    const colors = {
      'concept': '#4CAF50',
      'definition': '#2196F3',
      'example': '#FF9800',
      'formula': '#F44336',
      'code': '#795548',
      'image': '#9C27B0',
      'video': '#00BCD4',
      'audio': '#E91E63',
      'unknown': '#9E9E9E'
    };
    return colors[type] || colors.unknown;
  };

  const getElementDescription = (element) => {
    return element.description || element.content || 'Description non disponible';
  };

  const getDragDropQuality = () => {
    const stats = getDragDropStats();
    const elements = getElements();
    const targets = getTargets();
    const dropZones = this.dropZones;

    let qualityScore = 0;
    let feedback = [];

    // Vérification de la complétude
    if (stats.completionRate >= 100) {
      qualityScore += 40;
      feedback.push('✅ Toutes les zones remplies');
    } else {
      feedback.push('⚠️ Zones manquantes');
    }

    // Vérification de la cohérence
    const hasConsistentZones = dropZones.every(zone => {
      const element = getElementById(zone.itemId);
      const target = getTargetById(zone.id);
      return element && target;
    });

    if (hasConsistentZones) {
      qualityScore += 30;
      feedback.push('✅ Zones cohérentes');
    } else {
      feedback.push('⚠️ Zones incohérentes');
    }

    // Vérification de la logique
    if (dropZones.length > 0) {
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

  const getDragDropAnalysis = () => {
    const elements = getElements();
    const targets = getTargets();
    const dropZones = this.dropZones;
    const analysis = 'Analyse du glisser-déposer...';

    return {
      elements,
      targets,
      dropZones,
      analysis,
      result: 'Glisser-déposer analysé avec succès'
    };
  };

  const elements = getElements();
  const targets = getTargets();
  const expectedDropZones = getExpectedDropZones();
  const testCases = getTestCases();
  const stats = getDragDropStats();
  const dragDropQuality = getDragDropQuality();
  const dragDropAnalysis = getDragDropAnalysis();

  return (
    <div className="drag-drop-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>🖱️ Glisser-Déposer</h4>
          <div className="drag-drop-stats">
            <span className="zones-count">
              {stats.filledZones}/{stats.totalZones} zones
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
          <button onClick={handleAutoDrop} className="auto-btn">
            ▶️ Glisser-déposer automatique
          </button>
        </div>
      </div>

      <div className="drag-drop-layout">
        {/* Éléments à glisser */}
        <div className="elements-section">
          <div className="section-header">
            <h5>📦 Éléments à glisser</h5>
            <div className="elements-info">
              <span className="elements-count">
                {elements.length} élément{elements.length > 1 ? 's' : ''} disponible{elements.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="elements-content">
            {elements.length === 0 ? (
              <div className="empty-elements">
                <p>Aucun élément à glisser</p>
              </div>
            ) : (
              <div className="elements-grid">
                {elements.map((element, index) => {
                  const isUsed = dropZones.some(z => z.itemId === element.id);

                  return (
                    <div
                      key={element.id}
                      className={`drag-item ${getElementType(element)} ${isUsed ? 'used' : 'available'}`}
                      draggable={!isUsed}
                      onDragStart={(e) => handleDragStart(e, element.id)}
                      onClick={() => handleItemSelect(element)}
                      style={{ borderColor: getElementColor(getElementType(element)) }}
                    >
                      <div className="item-header">
                        <span className="item-icon">{getElementIcon(getElementType(element))}</span>
                        <span className="item-type">{getElementType(element)}</span>
                        <span className="item-number">{index + 1}</span>
                      </div>

                      <div className="item-content">
                        <div className="item-text">
                          {element.text || element.content}
                        </div>

                        <div className="item-description">
                          {getElementDescription(element)}
                        </div>
                      </div>

                      <div className="item-status">
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

        {/* Zones de dépôt */}
        <div className="targets-section">
          <div className="section-header">
            <h5>🎯 Zones de dépôt</h5>
            <div className="targets-info">
              <span className="targets-count">
                {targets.length} zone{targets.length > 1 ? 's' : ''} de dépôt
              </span>
            </div>
          </div>

          <div className="targets-content">
            {targets.length === 0 ? (
              <div className="empty-targets">
                <p>Aucune zone de dépôt</p>
              </div>
            ) : (
              <div className="targets-grid">
                {targets.map((target, index) => {
                  const itemInZone = getItemInZone(target.id);

                  return (
                    <div
                      key={target.id}
                      className={`drop-zone ${itemInZone ? 'filled' : 'empty'}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, target.id)}
                    >
                      <div className="zone-header">
                        <span className="zone-number">{index + 1}</span>
                        <span className="zone-title">{target.title}</span>
                        {itemInZone && (
                          <button
                            onClick={() => handleRemoveFromZone(target.id)}
                            className="remove-item-btn"
                            title="Retirer cet élément"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div className="zone-content">
                        {itemInZone ? (
                          <div className="dropped-item">
                            <div className="item-header">
                              <span className="item-icon">{getElementIcon(getElementType(itemInZone))}</span>
                              <span className="item-type">{getElementType(itemInZone)}</span>
                            </div>

                            <div className="item-text">
                              {itemInZone.text || itemInZone.content}
                            </div>
                          </div>
                        ) : (
                          <div className="empty-zone">
                            <span className="drop-hint">Glissez un élément ici</span>
                          </div>
                        )}
                      </div>

                      {target.description && (
                        <div className="zone-description">
                          {target.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Élément sélectionné */}
        {currentItem && (
          <div className="selected-item-section">
            <div className="section-header">
              <h5>🎯 Élément sélectionné</h5>
              <div className="item-info">
                <span className="item-type">{getElementType(currentItem)}</span>
              </div>
            </div>

            <div className="item-content">
              <div className="item-details">
                <h6>{currentItem.name || 'Élément sans nom'}</h6>
                <p>{getElementDescription(currentItem)}</p>
              </div>

              <div className="item-actions">
                <button
                  onClick={() => setCurrentItem(null)}
                  className="deselect-btn"
                >
                  🔗 Désélectionner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* État actuel */}
        <div className="current-state-section">
          <div className="section-header">
            <h5>📊 État actuel</h5>
            <div className="state-info">
              <span className="zones-filled">
                {stats.filledZones}/{stats.totalZones} zones remplies
              </span>
            </div>
          </div>

          <div className="state-content">
            <div className="state-stats">
              <div className="stat-item">
                <span className="stat-label">Zones remplies :</span>
                <span className="stat-value">{stats.filledZones}/{stats.totalZones}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Progression :</span>
                <span className="stat-value">{stats.completionRate}%</span>
              </div>
            </div>

            {dropZones.length > 0 && (
              <div className="current-matches">
                <h6>Correspondances actuelles :</h6>
                <div className="matches-list">
                  {dropZones.map((zone, index) => {
                    const target = getTargetById(zone.id);
                    const item = getElementById(zone.itemId);

                    return (
                      <div key={index} className="match-item">
                        <span className="match-zone">{target?.title || 'Zone inconnue'}</span>
                        <span className="match-arrow">→</span>
                        <span className="match-item">{item?.text || item?.content || 'Élément inconnu'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Qualité du glisser-déposer */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Qualité du glisser-déposer</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {dragDropQuality.score}%
              </span>
            </div>
          </div>

          <div className="quality-content">
            <div className="quality-feedback">
              {dragDropQuality.feedback.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  {feedback}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analyse du glisser-déposer */}
        <div className="analysis-section">
          <div className="section-header">
            <h5>📊 Analyse du glisser-déposer</h5>
            <div className="analysis-info">
              <span className="analysis-status">En cours...</span>
            </div>
          </div>

          <div className="analysis-content">
            <div className="analysis-output">
              <pre className="analysis-text">{dragDropAnalysis.analysis}</pre>
              <div className="analysis-result">
                {dragDropAnalysis.result}
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
              {isValidating ? '⏳ Validation...' : '✅ Valider le glisser-déposer'}
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
                    <h6>Vos zones :</h6>
                    <div className="zones-comparison">
                      {validationResult.details.userZones.map((zone, index) => {
                        const target = getTargetById(zone.id);
                        const item = getElementById(zone.itemId);
                        return (
                          <div key={index} className="zone-item">
                            <span className="zone-position">{index + 1}.</span>
                            <span className="zone-name">{target?.title || 'Zone inconnue'}</span>
                            <span className="zone-arrow">→</span>
                            <span className="zone-item">{item?.text || item?.content || 'Élément inconnu'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="details-section">
                    <h6>Zones attendues :</h6>
                    <div className="zones-comparison">
                      {validationResult.details.expectedDropZones.map((zone, index) => {
                        const target = getTargetById(zone.id);
                        const item = getElementById(zone.itemId);
                        return (
                          <div key={index} className="zone-item">
                            <span className="zone-position">{index + 1}.</span>
                            <span className="zone-name">{target?.title || 'Zone inconnue'}</span>
                            <span className="zone-arrow">→</span>
                            <span className="zone-item">{item?.text || item?.content || 'Élément inconnu'}</span>
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
      <div className="drag-drop-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Glissez les éléments vers les zones de dépôt appropriées.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Cliquez et maintenez sur un élément</li>
            <li>Glissez-le vers la zone de dépôt appropriée</li>
            <li>Relâchez pour déposer l'élément</li>
            <li>Vérifiez vos correspondances</li>
          </ul>
          <p>
            <strong>Types d'éléments :</strong>
          </p>
          <ul>
            <li>🧠 <strong>Concepts :</strong> Idées et notions</li>
            <li>📚 <strong>Définitions :</strong> Explications et descriptions</li>
            <li>💡 <strong>Exemples :</strong> Cas d'usage et illustrations</li>
            <li>🧮 <strong>Formules :</strong> Équations et calculs</li>
            <li>💻 <strong>Code :</strong> Programmes et algorithmes</li>
          </ul>
          <p>
            <strong>Conseils d'utilisation :</strong>
          </p>
          <ul>
            <li>Analysez les zones de dépôt</li>
            <li>Choisissez les éléments appropriés</li>
            <li>Vérifiez la logique des correspondances</li>
            <li>Testez vos associations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DragDropExercise;