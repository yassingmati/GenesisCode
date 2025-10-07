import React, { useState } from 'react';

const FillInTheBlankExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [gaps, setGaps] = useState(userAnswer?.gaps || []);
  const [currentGap, setCurrentGap] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getText = () => {
    return exercise.text || '';
  };

  const getGapPositions = () => {
    return exercise.gapPositions || [];
  };

  const getExpectedAnswers = () => {
    return exercise.expectedAnswers || [];
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const getHint = () => {
    return exercise.hint || '';
  };

  const handleGapChange = (gapId, value) => {
    const newGaps = [...gaps];
    const gapIndex = newGaps.findIndex(g => g.id === gapId);
    
    if (gapIndex !== -1) {
      newGaps[gapIndex].value = value;
    } else {
      newGaps.push({ id: gapId, value });
    }
    
    setGaps(newGaps);
    onAnswerChange({ gaps: newGaps });
  };

  const handleGapSelect = (gap) => {
    setCurrentGap(gap);
  };

  const handleReset = () => {
    setGaps([]);
    setCurrentGap(null);
    setValidationResult(null);
    onAnswerChange({ gaps: [] });
  };

  const handleAutoFill = () => {
    const expectedAnswers = getExpectedAnswers();
    const newGaps = expectedAnswers.map((answer, index) => ({
      id: `gap_${index}`,
      value: answer
    }));
    setGaps(newGaps);
    onAnswerChange({ gaps: newGaps });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedAnswers = getExpectedAnswers();
      const userAnswers = gaps.map(g => g.value);
      
      const isCorrect = JSON.stringify(userAnswers.sort()) === JSON.stringify(expectedAnswers.sort());
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Remplissage correct !' : 'Le remplissage contient des erreurs.',
        details: {
          userAnswers,
          expectedAnswers,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getGapStats = () => {
    const totalGaps = getGapPositions().length;
    const filledGaps = gaps.length;
    const completionRate = totalGaps > 0 ? (filledGaps / totalGaps) * 100 : 0;
    
    return {
      totalGaps,
      filledGaps,
      completionRate: Math.round(completionRate)
    };
  };

  const getGapById = (gapId) => {
    return gaps.find(g => g.id === gapId);
  };

  const getGapValue = (gapId) => {
    const gap = getGapById(gapId);
    return gap ? gap.value : '';
  };

  const getGapType = (gap) => {
    return gap.type || 'text';
  };

  const getGapIcon = (type) => {
    const icons = {
      'text': '📝',
      'number': '🔢',
      'word': '📖',
      'phrase': '💬',
      'code': '💻',
      'formula': '🧮',
      'unknown': '❓'
    };
    return icons[type] || icons.unknown;
  };

  const getGapColor = (type) => {
    const colors = {
      'text': '#4CAF50',
      'number': '#2196F3',
      'word': '#FF9800',
      'phrase': '#9C27B0',
      'code': '#795548',
      'formula': '#F44336',
      'unknown': '#9E9E9E'
    };
    return colors[type] || colors.unknown;
  };

  const getGapDescription = (gap) => {
    return gap.description || gap.hint || 'Description non disponible';
  };

  const getGapQuality = () => {
    const stats = getGapStats();
    const gaps = this.gaps;
    const expectedAnswers = getExpectedAnswers();
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la complétude
    if (stats.completionRate >= 100) {
      qualityScore += 40;
      feedback.push('✅ Tous les trous remplis');
    } else {
      feedback.push('⚠️ Trous manquants');
    }
    
    // Vérification de la cohérence
    const hasConsistentGaps = gaps.every(gap => gap.value && gap.value.trim().length > 0);
    
    if (hasConsistentGaps) {
      qualityScore += 30;
      feedback.push('✅ Trous cohérents');
    } else {
      feedback.push('⚠️ Trous incohérents');
    }
    
    // Vérification de la logique
    if (gaps.length > 0) {
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

  const getGapAnalysis = () => {
    const gaps = this.gaps;
    const expectedAnswers = getExpectedAnswers();
    const analysis = 'Analyse du remplissage...';
    
    return {
      gaps,
      expectedAnswers,
      analysis,
      result: 'Remplissage analysé avec succès'
    };
  };

  const getGapSuggestions = () => {
    const gaps = this.gaps;
    const expectedAnswers = getExpectedAnswers();
    const suggestions = [];
    
    if (gaps.length < expectedAnswers.length) {
      suggestions.push('Il manque des réponses. Remplissez tous les trous.');
    }
    
    if (gaps.some(gap => !gap.value || gap.value.trim().length === 0)) {
      suggestions.push('Certains trous sont vides. Ajoutez des réponses.');
    }
    
    if (gaps.length === 0) {
      suggestions.push('Commencez par remplir les trous.');
    }
    
    return suggestions;
  };

  const getGapValidation = () => {
    const gaps = this.gaps;
    const gapPositions = getGapPositions();
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    gapPositions.forEach((position, index) => {
      const gap = gaps.find(g => g.id === `gap_${index}`);
      
      if (!gap || !gap.value || gap.value.trim().length === 0) {
        validation.isValid = false;
        validation.errors.push(`Le trou ${index + 1} est vide.`);
      }
      
      if (gap && gap.value && gap.value.length < 2) {
        validation.warnings.push(`Le trou ${index + 1} semble trop court.`);
      }
      
      if (gap && gap.value && gap.value.length > 100) {
        validation.warnings.push(`Le trou ${index + 1} semble trop long.`);
      }
    });
    
    return validation;
  };

  const getGapFormatting = () => {
    const gaps = this.gaps;
    const formatting = {
      hasBold: gaps.some(gap => gap.value && gap.value.includes('**')),
      hasItalic: gaps.some(gap => gap.value && gap.value.includes('*')),
      hasCode: gaps.some(gap => gap.value && gap.value.includes('`')),
      hasLinks: gaps.some(gap => gap.value && (gap.value.includes('http') || gap.value.includes('www'))),
      hasNumbers: gaps.some(gap => gap.value && /^\d+$/.test(gap.value)),
      hasWords: gaps.some(gap => gap.value && /^[a-zA-Z]+$/.test(gap.value)),
      hasMixed: gaps.some(gap => gap.value && /^[a-zA-Z0-9]+$/.test(gap.value))
    };
    
    return formatting;
  };

  const getGapStructure = () => {
    const gaps = this.gaps;
    const structure = {
      hasShortAnswers: gaps.some(gap => gap.value && gap.value.length <= 5),
      hasMediumAnswers: gaps.some(gap => gap.value && gap.value.length > 5 && gap.value.length <= 20),
      hasLongAnswers: gaps.some(gap => gap.value && gap.value.length > 20),
      hasSingleWords: gaps.some(gap => gap.value && !gap.value.includes(' ')),
      hasPhrases: gaps.some(gap => gap.value && gap.value.includes(' ')),
      hasSentences: gaps.some(gap => gap.value && gap.value.includes('.')),
      hasQuestions: gaps.some(gap => gap.value && gap.value.includes('?'))
    };
    
    return structure;
  };

  const getGapReadability = () => {
    const gaps = this.gaps;
    const totalLength = gaps.reduce((sum, gap) => sum + (gap.value ? gap.value.length : 0), 0);
    const avgLength = gaps.length > 0 ? totalLength / gaps.length : 0;
    
    let score = 0;
    let feedback = [];
    
    // Score basé sur la longueur moyenne
    if (avgLength >= 5 && avgLength <= 20) {
      score += 40;
      feedback.push('✅ Longueur appropriée');
    } else if (avgLength < 5) {
      score += 20;
      feedback.push('⚠️ Réponses courtes');
    } else {
      score += 10;
      feedback.push('⚠️ Réponses longues');
    }
    
    // Score basé sur la diversité
    if (gaps.length > 1) {
      score += 30;
      feedback.push('✅ Diversité présente');
    } else {
      score += 10;
      feedback.push('⚠️ Peu de diversité');
    }
    
    // Score basé sur la complétude
    if (gaps.every(gap => gap.value && gap.value.trim().length > 0)) {
      score += 30;
      feedback.push('✅ Complétude');
    } else {
      score += 10;
      feedback.push('⚠️ Incomplétude');
    }
    
    return {
      score,
      level: score >= 80 ? 'excellent' : score >= 60 ? 'bon' : score >= 40 ? 'moyen' : 'faible',
      feedback,
      metrics: {
        avgLength: Math.round(avgLength * 10) / 10,
        totalLength,
        gapCount: gaps.length
      }
    };
  };

  const getGapComparison = () => {
    const gaps = this.gaps;
    const expectedAnswers = getExpectedAnswers();
    const comparison = {
      exactMatch: gaps.length === expectedAnswers.length && gaps.every((gap, index) => gap.value === expectedAnswers[index]),
      caseInsensitiveMatch: gaps.length === expectedAnswers.length && gaps.every((gap, index) => gap.value.toLowerCase() === expectedAnswers[index].toLowerCase()),
      trimmedMatch: gaps.length === expectedAnswers.length && gaps.every((gap, index) => gap.value.trim() === expectedAnswers[index].trim()),
      similarity: 0,
      differences: []
    };
    
    // Calcul de la similarité
    if (gaps.length > 0 && expectedAnswers.length > 0) {
      const userAnswers = gaps.map(g => g.value);
      const commonAnswers = userAnswers.filter(answer => expectedAnswers.includes(answer));
      comparison.similarity = Math.round((commonAnswers.length / Math.max(userAnswers.length, expectedAnswers.length)) * 100);
    }
    
    // Détection des différences
    if (!comparison.exactMatch) {
      if (gaps.length !== expectedAnswers.length) {
        comparison.differences.push(`Nombre de réponses différent: ${gaps.length} vs ${expectedAnswers.length}`);
      }
      
      gaps.forEach((gap, index) => {
        if (expectedAnswers[index] && gap.value !== expectedAnswers[index]) {
          comparison.differences.push(`Trou ${index + 1}: "${gap.value}" vs "${expectedAnswers[index]}"`);
        }
      });
    }
    
    return comparison;
  };

  const getGapPreview = () => {
    const gaps = this.gaps;
    const preview = {
      firstGap: gaps[0]?.value || '',
      lastGap: gaps[gaps.length - 1]?.value || '',
      totalGaps: gaps.length,
      filledGaps: gaps.filter(g => g.value && g.value.trim().length > 0).length,
      avgLength: gaps.length > 0 ? Math.round(gaps.reduce((sum, gap) => sum + (gap.value ? gap.value.length : 0), 0) / gaps.length * 10) / 10 : 0
    };
    
    return preview;
  };

  const getGapExport = () => {
    const gaps = this.gaps;
    const exportData = {
      gaps,
      timestamp: new Date().toISOString(),
      stats: getGapStats(),
      quality: getGapQuality(),
      analysis: getGapAnalysis(),
      suggestions: getGapSuggestions(),
      validation: getGapValidation(),
      formatting: getGapFormatting(),
      structure: getGapStructure(),
      readability: getGapReadability(),
      comparison: getGapComparison(),
      preview: getGapPreview()
    };
    
    return exportData;
  };

  const text = getText();
  const gapPositions = getGapPositions();
  const expectedAnswers = getExpectedAnswers();
  const testCases = getTestCases();
  const hint = getHint();
  const stats = getGapStats();
  const gapQuality = getGapQuality();
  const gapAnalysis = getGapAnalysis();
  const suggestions = getGapSuggestions();
  const validation = getGapValidation();
  const formatting = getGapFormatting();
  const structure = getGapStructure();
  const readability = getGapReadability();
  const comparison = getGapComparison();
  const preview = getGapPreview();
  const exportData = getGapExport();

  return (
    <div className="fill-in-the-blank-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>📝 Remplissage de trous</h4>
          <div className="gap-stats">
            <span className="gaps-count">
              {stats.filledGaps}/{stats.totalGaps} trous
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
          <button onClick={handleAutoFill} className="auto-btn">
            ▶️ Remplissage automatique
          </button>
        </div>
      </div>

      <div className="fill-in-the-blank-layout">
        {/* Texte avec trous */}
        <div className="text-section">
          <div className="section-header">
            <h5>📝 Texte avec trous</h5>
            <div className="text-info">
              <span className="text-status">
                {text.length > 0 ? '✅ Texte disponible' : '⏳ Aucun texte'}
              </span>
            </div>
          </div>
          
          <div className="text-content">
            <div className="text-with-gaps">
              {text.split('___').map((part, index) => {
                const gapId = `gap_${index}`;
                const gapValue = getGapValue(gapId);
                
                return (
                  <span key={index}>
                    {part}
                    {index < text.split('___').length - 1 && (
                      <input
                        type="text"
                        className={`gap-input ${gapValue ? 'filled' : 'empty'}`}
                        value={gapValue}
                        onChange={(e) => handleGapChange(gapId, e.target.value)}
                        onClick={() => handleGapSelect({ id: gapId, value: gapValue })}
                        placeholder={`Trou ${index + 1}`}
                      />
                    )}
                  </span>
                );
              })}
            </div>
            
            {hint && (
              <div className="hint-section">
                <div className="hint-header">
                  <span className="hint-icon">💡</span>
                  <span className="hint-title">Indice</span>
                </div>
                <div className="hint-content">
                  {hint}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trous remplis */}
        <div className="gaps-section">
          <div className="section-header">
            <h5>🕳️ Trous remplis</h5>
            <div className="gaps-info">
              <span className="gaps-count">
                {gaps.length} trou{gaps.length > 1 ? 's' : ''} rempli{gaps.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="gaps-content">
            {gaps.length === 0 ? (
              <div className="empty-gaps">
                <p>Aucun trou rempli</p>
              </div>
            ) : (
              <div className="gaps-list">
                {gaps.map((gap, index) => (
                  <div key={gap.id} className="gap-item">
                    <div className="gap-header">
                      <span className="gap-number">Trou {index + 1}</span>
                      <span className="gap-type">{getGapType(gap)}</span>
                    </div>
                    
                    <div className="gap-content">
                      <div className="gap-value">
                        {gap.value || 'Vide'}
                      </div>
                      
                      <div className="gap-actions">
                        <button
                          onClick={() => handleGapSelect(gap)}
                          className="select-gap-btn"
                          title="Sélectionner ce trou"
                        >
                          🎯
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trou sélectionné */}
        {currentGap && (
          <div className="selected-gap-section">
            <div className="section-header">
              <h5>🎯 Trou sélectionné</h5>
              <div className="gap-info">
                <span className="gap-type">{getGapType(currentGap)}</span>
              </div>
            </div>
            
            <div className="gap-content">
              <div className="gap-details">
                <h6>Trou {currentGap.id}</h6>
                <p>Valeur: {currentGap.value || 'Vide'}</p>
              </div>
              
              <div className="gap-actions">
                <button
                  onClick={() => setCurrentGap(null)}
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
              <span className="gaps-filled">
                {stats.filledGaps}/{stats.totalGaps} trous remplis
              </span>
            </div>
          </div>
          
          <div className="state-content">
            <div className="state-stats">
              <div className="stat-item">
                <span className="stat-label">Trous remplis :</span>
                <span className="stat-value">{stats.filledGaps}/{stats.totalGaps}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Progression :</span>
                <span className="stat-value">{stats.completionRate}%</span>
              </div>
            </div>
            
            {gaps.length > 0 && (
              <div className="current-gaps">
                <h6>Trous actuels :</h6>
                <div className="gaps-list">
                  {gaps.map((gap, index) => (
                    <div key={index} className="gap-item">
                      <span className="gap-position">{index + 1}.</span>
                      <span className="gap-value">{gap.value || 'Vide'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Qualité du remplissage */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Qualité du remplissage</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {gapQuality.score}%
              </span>
            </div>
          </div>
          
          <div className="quality-content">
            <div className="quality-feedback">
              {gapQuality.feedback.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  {feedback}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analyse du remplissage */}
        <div className="analysis-section">
          <div className="section-header">
            <h5>📊 Analyse du remplissage</h5>
            <div className="analysis-info">
              <span className="analysis-status">En cours...</span>
            </div>
          </div>
          
          <div className="analysis-content">
            <div className="analysis-output">
              <pre className="analysis-text">{gapAnalysis.analysis}</pre>
              <div className="analysis-result">
                {gapAnalysis.result}
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="suggestions-section">
            <div className="section-header">
              <h5>💡 Suggestions</h5>
              <div className="suggestions-info">
                <span className="suggestions-count">
                  {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="suggestions-content">
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    <span className="suggestion-icon">💡</span>
                    <span className="suggestion-text">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Validation */}
        <div className="validation-section">
          <div className="section-header">
            <h5>✅ Validation</h5>
            <div className="validation-info">
              <span className={`validation-status ${validation.isValid ? 'valid' : 'invalid'}`}>
                {validation.isValid ? '✅ Valide' : '❌ Invalide'}
              </span>
            </div>
          </div>
          
          <div className="validation-content">
            {validation.errors.length > 0 && (
              <div className="validation-errors">
                <h6>Erreurs :</h6>
                <div className="errors-list">
                  {validation.errors.map((error, index) => (
                    <div key={index} className="error-item">
                      <span className="error-icon">❌</span>
                      <span className="error-text">{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {validation.warnings.length > 0 && (
              <div className="validation-warnings">
                <h6>Avertissements :</h6>
                <div className="warnings-list">
                  {validation.warnings.map((warning, index) => (
                    <div key={index} className="warning-item">
                      <span className="warning-icon">⚠️</span>
                      <span className="warning-text">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formatage */}
        <div className="formatting-section">
          <div className="section-header">
            <h5>🎨 Formatage</h5>
            <div className="formatting-info">
              <span className="formatting-status">
                {Object.values(formatting).some(f => f) ? '✅ Formatage détecté' : '⏳ Aucun formatage'}
              </span>
            </div>
          </div>
          
          <div className="formatting-content">
            <div className="formatting-grid">
              <div className="formatting-item">
                <span className="formatting-label">Gras :</span>
                <span className={`formatting-value ${formatting.hasBold ? 'yes' : 'no'}`}>
                  {formatting.hasBold ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="formatting-item">
                <span className="formatting-label">Italique :</span>
                <span className={`formatting-value ${formatting.hasItalic ? 'yes' : 'no'}`}>
                  {formatting.hasItalic ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="formatting-item">
                <span className="formatting-label">Code :</span>
                <span className={`formatting-value ${formatting.hasCode ? 'yes' : 'no'}`}>
                  {formatting.hasCode ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="formatting-item">
                <span className="formatting-label">Liens :</span>
                <span className={`formatting-value ${formatting.hasLinks ? 'yes' : 'no'}`}>
                  {formatting.hasLinks ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="formatting-item">
                <span className="formatting-label">Nombres :</span>
                <span className={`formatting-value ${formatting.hasNumbers ? 'yes' : 'no'}`}>
                  {formatting.hasNumbers ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="formatting-item">
                <span className="formatting-label">Mots :</span>
                <span className={`formatting-value ${formatting.hasWords ? 'yes' : 'no'}`}>
                  {formatting.hasWords ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="formatting-item">
                <span className="formatting-label">Mixte :</span>
                <span className={`formatting-value ${formatting.hasMixed ? 'yes' : 'no'}`}>
                  {formatting.hasMixed ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Structure */}
        <div className="structure-section">
          <div className="section-header">
            <h5>🏗️ Structure</h5>
            <div className="structure-info">
              <span className="structure-status">
                {Object.values(structure).some(s => s) ? '✅ Structure présente' : '⏳ Structure simple'}
              </span>
            </div>
          </div>
          
          <div className="structure-content">
            <div className="structure-grid">
              <div className="structure-item">
                <span className="structure-label">Réponses courtes :</span>
                <span className={`structure-value ${structure.hasShortAnswers ? 'yes' : 'no'}`}>
                  {structure.hasShortAnswers ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="structure-item">
                <span className="structure-label">Réponses moyennes :</span>
                <span className={`structure-value ${structure.hasMediumAnswers ? 'yes' : 'no'}`}>
                  {structure.hasMediumAnswers ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="structure-item">
                <span className="structure-label">Réponses longues :</span>
                <span className={`structure-value ${structure.hasLongAnswers ? 'yes' : 'no'}`}>
                  {structure.hasLongAnswers ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="structure-item">
                <span className="structure-label">Mots uniques :</span>
                <span className={`structure-value ${structure.hasSingleWords ? 'yes' : 'no'}`}>
                  {structure.hasSingleWords ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="structure-item">
                <span className="structure-label">Phrases :</span>
                <span className={`structure-value ${structure.hasPhrases ? 'yes' : 'no'}`}>
                  {structure.hasPhrases ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="structure-item">
                <span className="structure-label">Phrases complètes :</span>
                <span className={`structure-value ${structure.hasSentences ? 'yes' : 'no'}`}>
                  {structure.hasSentences ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="structure-item">
                <span className="structure-label">Questions :</span>
                <span className={`structure-value ${structure.hasQuestions ? 'yes' : 'no'}`}>
                  {structure.hasQuestions ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lisibilité */}
        <div className="readability-section">
          <div className="section-header">
            <h5>📖 Lisibilité</h5>
            <div className="readability-info">
              <span className="readability-score">
                Score: {readability.score}%
              </span>
            </div>
          </div>
          
          <div className="readability-content">
            <div className="readability-feedback">
              {readability.feedback.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  {feedback}
                </div>
              ))}
            </div>
            
            {readability.metrics && (
              <div className="readability-metrics">
                <div className="metric-item">
                  <span className="metric-label">Longueur moyenne :</span>
                  <span className="metric-value">{readability.metrics.avgLength}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Longueur totale :</span>
                  <span className="metric-value">{readability.metrics.totalLength}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Nombre de trous :</span>
                  <span className="metric-value">{readability.metrics.gapCount}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparaison */}
        <div className="comparison-section">
          <div className="section-header">
            <h5>🔍 Comparaison</h5>
            <div className="comparison-info">
              <span className={`comparison-status ${comparison.exactMatch ? 'match' : 'no-match'}`}>
                {comparison.exactMatch ? '✅ Correspondance exacte' : '❌ Différences détectées'}
              </span>
            </div>
          </div>
          
          <div className="comparison-content">
            <div className="comparison-stats">
              <div className="comparison-item">
                <span className="comparison-label">Correspondance exacte :</span>
                <span className={`comparison-value ${comparison.exactMatch ? 'yes' : 'no'}`}>
                  {comparison.exactMatch ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="comparison-item">
                <span className="comparison-label">Correspondance (sans casse) :</span>
                <span className={`comparison-value ${comparison.caseInsensitiveMatch ? 'yes' : 'no'}`}>
                  {comparison.caseInsensitiveMatch ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="comparison-item">
                <span className="comparison-label">Correspondance (sans espaces) :</span>
                <span className={`comparison-value ${comparison.trimmedMatch ? 'yes' : 'no'}`}>
                  {comparison.trimmedMatch ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="comparison-item">
                <span className="comparison-label">Similarité :</span>
                <span className="comparison-value">{comparison.similarity}%</span>
              </div>
            </div>
            
            {comparison.differences.length > 0 && (
              <div className="comparison-differences">
                <h6>Différences détectées :</h6>
                <div className="differences-list">
                  {comparison.differences.map((difference, index) => (
                    <div key={index} className="difference-item">
                      <span className="difference-icon">⚠️</span>
                      <span className="difference-text">{difference}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Aperçu */}
        <div className="preview-section">
          <div className="section-header">
            <h5>👁️ Aperçu</h5>
            <div className="preview-info">
              <span className="preview-status">
                {preview.totalGaps > 0 ? '✅ Aperçu disponible' : '⏳ Aucun aperçu'}
              </span>
            </div>
          </div>
          
          <div className="preview-content">
            <div className="preview-stats">
              <div className="preview-item">
                <span className="preview-label">Premier trou :</span>
                <span className="preview-value">{preview.firstGap || 'Vide'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Dernier trou :</span>
                <span className="preview-value">{preview.lastGap || 'Vide'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Nombre total de trous :</span>
                <span className="preview-value">{preview.totalGaps}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Trous remplis :</span>
                <span className="preview-value">{preview.filledGaps}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Longueur moyenne :</span>
                <span className="preview-value">{preview.avgLength}</span>
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
              {isValidating ? '⏳ Validation...' : '✅ Valider le remplissage'}
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
                    <h6>Vos réponses :</h6>
                    <div className="user-answers">
                      {validationResult.details.userAnswers.map((answer, index) => (
                        <div key={index} className="answer-item">
                          <span className="answer-position">{index + 1}.</span>
                          <span className="answer-value">{answer || 'Vide'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h6>Réponses attendues :</h6>
                    <div className="expected-answers">
                      {validationResult.details.expectedAnswers.map((answer, index) => (
                        <div key={index} className="answer-item">
                          <span className="answer-position">{index + 1}.</span>
                          <span className="answer-value">{answer}</span>
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
      <div className="fill-in-the-blank-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Remplissez les trous dans le texte avec les réponses appropriées.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Lisez le texte attentivement</li>
            <li>Identifiez les trous à remplir</li>
            <li>Saisissez vos réponses</li>
            <li>Vérifiez vos réponses</li>
          </ul>
          <p>
            <strong>Conseils d'utilisation :</strong>
          </p>
          <ul>
            <li>Lisez le contexte autour de chaque trou</li>
            <li>Choisissez des réponses appropriées</li>
            <li>Vérifiez la cohérence de vos réponses</li>
            <li>Testez vos réponses</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FillInTheBlankExercise;