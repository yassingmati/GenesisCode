import React, { useState } from 'react';

const TextInputExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [text, setText] = useState(userAnswer || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getExpectedAnswer = () => {
    return exercise.expectedAnswer || '';
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const getValidationRules = () => {
    return exercise.validationRules || [];
  };

  const getHint = () => {
    return exercise.hint || '';
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    onAnswerChange(newText);
  };

  const handleReset = () => {
    setText('');
    setValidationResult(null);
    onAnswerChange('');
  };

  const handleAutoFill = () => {
    const expectedAnswer = getExpectedAnswer();
    setText(expectedAnswer);
    onAnswerChange(expectedAnswer);
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedAnswer = getExpectedAnswer();
      const isCorrect = text.trim().toLowerCase() === expectedAnswer.trim().toLowerCase();
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Réponse correcte !' : 'La réponse contient des erreurs.',
        details: {
          userAnswer: text,
          expectedAnswer,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getTextStats = () => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const lines = text.split('\n').length;
    
    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      lines,
      wordCount: words.length,
      characterCount: characters,
      lineCount: lines
    };
  };

  const getTextQuality = () => {
    const stats = getTextStats();
    const text = this.text;
    const expectedAnswer = getExpectedAnswer();
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la longueur
    if (text.length > 0) {
      qualityScore += 20;
      feedback.push('✅ Texte saisi');
    } else {
      feedback.push('❌ Aucun texte saisi');
    }
    
    // Vérification de la cohérence
    if (text.trim().length > 0) {
      qualityScore += 30;
      feedback.push('✅ Texte cohérent');
    } else {
      feedback.push('⚠️ Texte vide ou incomplet');
    }
    
    // Vérification de la logique
    if (text.includes(' ') || text.includes('\n')) {
      qualityScore += 25;
      feedback.push('✅ Structure présente');
    } else {
      feedback.push('⚠️ Structure simple');
    }
    
    // Vérification de la complétude
    if (text.length >= expectedAnswer.length * 0.5) {
      qualityScore += 25;
      feedback.push('✅ Longueur appropriée');
    } else {
      feedback.push('⚠️ Texte trop court');
    }
    
    return {
      score: qualityScore,
      feedback,
      level: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'bon' : qualityScore >= 40 ? 'moyen' : 'faible'
    };
  };

  const getTextAnalysis = () => {
    const text = this.text;
    const expectedAnswer = getExpectedAnswer();
    const analysis = 'Analyse du texte saisi...';
    
    return {
      text,
      expectedAnswer,
      analysis,
      result: 'Texte analysé avec succès'
    };
  };

  const getTextSuggestions = () => {
    const text = this.text;
    const expectedAnswer = getExpectedAnswer();
    const suggestions = [];
    
    if (text.length < expectedAnswer.length * 0.5) {
      suggestions.push('Le texte semble trop court. Essayez d\'ajouter plus de détails.');
    }
    
    if (text.length > expectedAnswer.length * 1.5) {
      suggestions.push('Le texte semble trop long. Essayez de le raccourcir.');
    }
    
    if (!text.includes(' ')) {
      suggestions.push('Le texte semble être un seul mot. Essayez d\'ajouter des espaces.');
    }
    
    if (text.length === 0) {
      suggestions.push('Commencez par saisir votre réponse.');
    }
    
    return suggestions;
  };

  const getTextValidation = () => {
    const text = this.text;
    const validationRules = getValidationRules();
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    validationRules.forEach(rule => {
      switch (rule.type) {
        case 'minLength':
          if (text.length < rule.value) {
            validation.isValid = false;
            validation.errors.push(`Le texte doit contenir au moins ${rule.value} caractères.`);
          }
          break;
        case 'maxLength':
          if (text.length > rule.value) {
            validation.isValid = false;
            validation.errors.push(`Le texte ne doit pas dépasser ${rule.value} caractères.`);
          }
          break;
        case 'required':
          if (text.trim().length === 0) {
            validation.isValid = false;
            validation.errors.push('Le texte est requis.');
          }
          break;
        case 'pattern':
          if (!new RegExp(rule.value).test(text)) {
            validation.isValid = false;
            validation.errors.push(`Le texte ne respecte pas le format requis: ${rule.message || 'Format invalide'}`);
          }
          break;
        case 'contains':
          if (!text.includes(rule.value)) {
            validation.warnings.push(`Le texte devrait contenir: ${rule.value}`);
          }
          break;
        case 'notContains':
          if (text.includes(rule.value)) {
            validation.isValid = false;
            validation.errors.push(`Le texte ne devrait pas contenir: ${rule.value}`);
          }
          break;
      }
    });
    
    return validation;
  };

  const getTextFormatting = () => {
    const text = this.text;
    const formatting = {
      bold: text.includes('**') || text.includes('__'),
      italic: text.includes('*') || text.includes('_'),
      code: text.includes('`'),
      link: text.includes('http') || text.includes('www'),
      list: text.includes('-') || text.includes('*') || text.includes('1.'),
      quote: text.includes('>'),
      header: text.includes('#')
    };
    
    return formatting;
  };

  const getTextStructure = () => {
    const text = this.text;
    const structure = {
      hasParagraphs: text.includes('\n\n'),
      hasSentences: text.includes('.'),
      hasQuestions: text.includes('?'),
      hasExclamations: text.includes('!'),
      hasCommas: text.includes(','),
      hasSemicolons: text.includes(';'),
      hasColons: text.includes(':')
    };
    
    return structure;
  };

  const getTextReadability = () => {
    const text = this.text;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const characters = text.length;
    
    if (words.length === 0 || sentences.length === 0) {
      return {
        score: 0,
        level: 'Non calculable',
        feedback: 'Texte trop court pour l\'analyse'
      };
    }
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharactersPerWord = characters / words.length;
    
    let score = 0;
    let feedback = [];
    
    // Score basé sur la longueur des phrases
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) {
      score += 40;
      feedback.push('✅ Longueur de phrase appropriée');
    } else if (avgWordsPerSentence < 10) {
      score += 20;
      feedback.push('⚠️ Phrases courtes');
    } else {
      score += 10;
      feedback.push('⚠️ Phrases longues');
    }
    
    // Score basé sur la longueur des mots
    if (avgCharactersPerWord >= 4 && avgCharactersPerWord <= 6) {
      score += 30;
      feedback.push('✅ Longueur de mot appropriée');
    } else if (avgCharactersPerWord < 4) {
      score += 15;
      feedback.push('⚠️ Mots courts');
    } else {
      score += 10;
      feedback.push('⚠️ Mots longs');
    }
    
    // Score basé sur la structure
    if (text.includes('.') && text.includes(',')) {
      score += 30;
      feedback.push('✅ Structure variée');
    } else if (text.includes('.') || text.includes(',')) {
      score += 20;
      feedback.push('⚠️ Structure simple');
    } else {
      score += 10;
      feedback.push('⚠️ Structure basique');
    }
    
    return {
      score,
      level: score >= 80 ? 'excellent' : score >= 60 ? 'bon' : score >= 40 ? 'moyen' : 'faible',
      feedback,
      metrics: {
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        avgCharactersPerWord: Math.round(avgCharactersPerWord * 10) / 10
      }
    };
  };

  const getTextComparison = () => {
    const text = this.text;
    const expectedAnswer = getExpectedAnswer();
    const comparison = {
      exactMatch: text === expectedAnswer,
      caseInsensitiveMatch: text.toLowerCase() === expectedAnswer.toLowerCase(),
      trimmedMatch: text.trim() === expectedAnswer.trim(),
      similarity: 0,
      differences: []
    };
    
    // Calcul de la similarité (algorithme simple)
    const textWords = text.toLowerCase().split(/\s+/);
    const expectedWords = expectedAnswer.toLowerCase().split(/\s+/);
    const commonWords = textWords.filter(word => expectedWords.includes(word));
    comparison.similarity = Math.round((commonWords.length / Math.max(textWords.length, expectedWords.length)) * 100);
    
    // Détection des différences
    if (!comparison.exactMatch) {
      if (text.length !== expectedAnswer.length) {
        comparison.differences.push(`Longueur différente: ${text.length} vs ${expectedAnswer.length}`);
      }
      
      if (text.toLowerCase() !== expectedAnswer.toLowerCase()) {
        comparison.differences.push('Différences de casse');
      }
      
      if (text.trim() !== expectedAnswer.trim()) {
        comparison.differences.push('Différences d\'espaces');
      }
    }
    
    return comparison;
  };

  const getTextPreview = () => {
    const text = this.text;
    const preview = {
      firstLine: text.split('\n')[0] || '',
      lastLine: text.split('\n').pop() || '',
      wordCount: text.trim().split(/\s+/).filter(word => word.length > 0).length,
      characterCount: text.length,
      lineCount: text.split('\n').length
    };
    
    return preview;
  };

  const getTextExport = () => {
    const text = this.text;
    const exportData = {
      text,
      timestamp: new Date().toISOString(),
      stats: getTextStats(),
      quality: getTextQuality(),
      analysis: getTextAnalysis(),
      suggestions: getTextSuggestions(),
      validation: getTextValidation(),
      formatting: getTextFormatting(),
      structure: getTextStructure(),
      readability: getTextReadability(),
      comparison: getTextComparison(),
      preview: getTextPreview()
    };
    
    return exportData;
  };

  const expectedAnswer = getExpectedAnswer();
  const testCases = getTestCases();
  const validationRules = getValidationRules();
  const hint = getHint();
  const stats = getTextStats();
  const textQuality = getTextQuality();
  const textAnalysis = getTextAnalysis();
  const suggestions = getTextSuggestions();
  const validation = getTextValidation();
  const formatting = getTextFormatting();
  const structure = getTextStructure();
  const readability = getTextReadability();
  const comparison = getTextComparison();
  const preview = getTextPreview();
  const exportData = getTextExport();

  return (
    <div className="text-input-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>📝 Saisie de texte</h4>
          <div className="text-stats">
            <span className="characters-count">
              {stats.characters} caractères
            </span>
            <span className="words-count">
              {stats.words} mot{stats.words > 1 ? 's' : ''}
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

      <div className="text-input-layout">
        {/* Zone de saisie */}
        <div className="text-input-section">
          <div className="section-header">
            <h5>✏️ Saisie de texte</h5>
            <div className="input-info">
              <span className="input-status">
                {text.length > 0 ? '✅ Texte saisi' : '⏳ En attente'}
              </span>
            </div>
          </div>
          
          <div className="input-content">
            <textarea
              className="text-input"
              value={text}
              onChange={handleTextChange}
              placeholder="Saisissez votre réponse ici..."
              rows={8}
            />
            
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

        {/* Statistiques du texte */}
        <div className="text-stats-section">
          <div className="section-header">
            <h5>📊 Statistiques du texte</h5>
            <div className="stats-info">
              <span className="stats-status">
                {stats.words > 0 ? '✅ Statistiques disponibles' : '⏳ En attente'}
              </span>
            </div>
          </div>
          
          <div className="stats-content">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Mots :</span>
                <span className="stat-value">{stats.words}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Caractères :</span>
                <span className="stat-value">{stats.characters}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Caractères (sans espaces) :</span>
                <span className="stat-value">{stats.charactersNoSpaces}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Lignes :</span>
                <span className="stat-value">{stats.lines}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Qualité du texte */}
        <div className="text-quality-section">
          <div className="section-header">
            <h5>📊 Qualité du texte</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {textQuality.score}%
              </span>
            </div>
          </div>
          
          <div className="quality-content">
            <div className="quality-feedback">
              {textQuality.feedback.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  {feedback}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analyse du texte */}
        <div className="text-analysis-section">
          <div className="section-header">
            <h5>📊 Analyse du texte</h5>
            <div className="analysis-info">
              <span className="analysis-status">En cours...</span>
            </div>
          </div>
          
          <div className="analysis-content">
            <div className="analysis-output">
              <pre className="analysis-text">{textAnalysis.analysis}</pre>
              <div className="analysis-result">
                {textAnalysis.result}
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
                <span className={`formatting-value ${formatting.bold ? 'yes' : 'no'}`}>
                  {formatting.bold ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="formatting-item">
                <span className="formatting-label">Italique :</span>
                <span className={`formatting-value ${formatting.italic ? 'yes' : 'no'}`}>
                  {formatting.italic ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="formatting-item">
                <span className="formatting-label">Code :</span>
                <span className={`formatting-value ${formatting.code ? 'yes' : 'no'}`}>
                  {formatting.code ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="formatting-item">
                <span className="formatting-label">Lien :</span>
                <span className={`formatting-value ${formatting.link ? 'yes' : 'no'}`}>
                  {formatting.link ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="formatting-item">
                <span className="formatting-label">Liste :</span>
                <span className={`formatting-value ${formatting.list ? 'yes' : 'no'}`}>
                  {formatting.list ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="formatting-item">
                <span className="formatting-label">Citation :</span>
                <span className={`formatting-value ${formatting.quote ? 'yes' : 'no'}`}>
                  {formatting.quote ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="formatting-item">
                <span className="formatting-label">Titre :</span>
                <span className={`formatting-value ${formatting.header ? 'yes' : 'no'}`}>
                  {formatting.header ? '✅ Oui' : '❌ Non'}
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
                <span className="structure-label">Paragraphes :</span>
                <span className={`structure-value ${structure.hasParagraphs ? 'yes' : 'no'}`}>
                  {structure.hasParagraphs ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="structure-item">
                <span className="structure-label">Phrases :</span>
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
              <div className="structure-item">
                <span className="structure-label">Exclamations :</span>
                <span className={`structure-value ${structure.hasExclamations ? 'yes' : 'no'}`}>
                  {structure.hasExclamations ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="structure-item">
                <span className="structure-label">Virgules :</span>
                <span className={`structure-value ${structure.hasCommas ? 'yes' : 'no'}`}>
                  {structure.hasCommas ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="structure-item">
                <span className="structure-label">Points-virgules :</span>
                <span className={`structure-value ${structure.hasSemicolons ? 'yes' : 'no'}`}>
                  {structure.hasSemicolons ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="structure-item">
                <span className="structure-label">Deux-points :</span>
                <span className={`structure-value ${structure.hasColons ? 'yes' : 'no'}`}>
                  {structure.hasColons ? '✅ Oui' : '❌ Non'}
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
                  <span className="metric-label">Mots par phrase :</span>
                  <span className="metric-value">{readability.metrics.avgWordsPerSentence}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Caractères par mot :</span>
                  <span className="metric-value">{readability.metrics.avgCharactersPerWord}</span>
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
                {preview.characterCount > 0 ? '✅ Aperçu disponible' : '⏳ Aucun aperçu'}
              </span>
            </div>
          </div>
          
          <div className="preview-content">
            <div className="preview-stats">
              <div className="preview-item">
                <span className="preview-label">Première ligne :</span>
                <span className="preview-value">{preview.firstLine || 'Vide'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Dernière ligne :</span>
                <span className="preview-value">{preview.lastLine || 'Vide'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Nombre de mots :</span>
                <span className="preview-value">{preview.wordCount}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Nombre de caractères :</span>
                <span className="preview-value">{preview.characterCount}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Nombre de lignes :</span>
                <span className="preview-value">{preview.lineCount}</span>
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
              {isValidating ? '⏳ Validation...' : '✅ Valider le texte'}
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
                    <h6>Votre réponse :</h6>
                    <div className="user-answer">
                      {validationResult.details.userAnswer}
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h6>Réponse attendue :</h6>
                    <div className="expected-answer">
                      {validationResult.details.expectedAnswer}
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
      <div className="text-input-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Saisissez votre réponse dans la zone de texte.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Cliquez dans la zone de texte</li>
            <li>Saisissez votre réponse</li>
            <li>Vérifiez votre texte</li>
            <li>Testez votre réponse</li>
          </ul>
          <p>
            <strong>Conseils d'utilisation :</strong>
          </p>
          <ul>
            <li>Utilisez des phrases complètes</li>
            <li>Vérifiez l'orthographe et la grammaire</li>
            <li>Structurez votre réponse</li>
            <li>Relisez avant de valider</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextInputExercise;