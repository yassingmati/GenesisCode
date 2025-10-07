import React, { useState } from 'react';

const PseudoCodeExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [pseudoCode, setPseudoCode] = useState(userAnswer?.code || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getStructure = () => {
    return exercise.pseudoCodeStructure || '';
  };

  const getExpectedCode = () => {
    return exercise.expectedCode || '';
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const getKeywords = () => {
    return exercise.keywords || [];
  };

  const handleCodeChange = (newCode) => {
    setPseudoCode(newCode);
    onAnswerChange({ code: newCode });
  };

  const handleReset = () => {
    setPseudoCode('');
    setValidationResult(null);
    onAnswerChange({ code: '' });
  };

  const handleAutoComplete = () => {
    const expectedCode = getExpectedCode();
    setPseudoCode(expectedCode);
    onAnswerChange({ code: expectedCode });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedCode = getExpectedCode();
      const isCorrect = pseudoCode.trim().toLowerCase() === expectedCode.trim().toLowerCase();
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Pseudo-code correct !' : 'Le pseudo-code contient des erreurs.',
        details: {
          userCode: pseudoCode,
          expectedCode,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getCodeStats = () => {
    const lines = pseudoCode.split('\n').filter(line => line.trim().length > 0);
    const words = pseudoCode.split(/\s+/).filter(word => word.length > 0);
    const characters = pseudoCode.length;
    
    return {
      lines: lines.length,
      words: words.length,
      characters
    };
  };

  const getKeywordUsage = () => {
    const keywords = getKeywords();
    const usage = keywords.map(keyword => ({
      keyword,
      count: (pseudoCode.match(new RegExp(keyword, 'gi')) || []).length,
      used: (pseudoCode.match(new RegExp(keyword, 'gi')) || []).length > 0
    }));
    
    return usage;
  };

  const getCodeStructure = () => {
    const structure = getStructure();
    const userStructure = pseudoCode;
    
    return {
      expected: structure,
      user: userStructure,
      matches: structure.trim().toLowerCase() === userStructure.trim().toLowerCase()
    };
  };

  const getCodeQuality = () => {
    const stats = getCodeStats();
    const keywordUsage = getKeywordUsage();
    const usedKeywords = keywordUsage.filter(k => k.used).length;
    const totalKeywords = keywordUsage.length;
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la longueur
    if (stats.lines >= 5) {
      qualityScore += 20;
      feedback.push('✅ Longueur appropriée');
    } else {
      feedback.push('⚠️ Code trop court');
    }
    
    // Vérification des mots-clés
    if (usedKeywords >= totalKeywords * 0.5) {
      qualityScore += 30;
      feedback.push('✅ Utilisation des mots-clés');
    } else {
      feedback.push('⚠️ Peu de mots-clés utilisés');
    }
    
    // Vérification de la structure
    if (stats.lines > 0) {
      qualityScore += 25;
      feedback.push('✅ Structure présente');
    } else {
      feedback.push('❌ Aucune structure');
    }
    
    // Vérification de la complétude
    if (stats.characters > 50) {
      qualityScore += 25;
      feedback.push('✅ Code détaillé');
    } else {
      feedback.push('⚠️ Code trop court');
    }
    
    return {
      score: qualityScore,
      feedback,
      level: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'bon' : qualityScore >= 40 ? 'moyen' : 'faible'
    };
  };

  const structure = getStructure();
  const expectedCode = getExpectedCode();
  const testCases = getTestCases();
  const keywords = getKeywords();
  const stats = getCodeStats();
  const keywordUsage = getKeywordUsage();
  const codeStructure = getCodeStructure();
  const codeQuality = getCodeQuality();

  return (
    <div className="pseudo-code-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>📝 Pseudo-code</h4>
          <div className="code-stats">
            <span className="lines-count">
              {stats.lines} ligne{stats.lines > 1 ? 's' : ''}
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
          <button onClick={handleAutoComplete} className="auto-btn">
            ▶️ Complétion automatique
          </button>
        </div>
      </div>

      <div className="pseudo-code-layout">
        {/* Structure attendue */}
        {structure && (
          <div className="structure-section">
            <div className="section-header">
              <h5>📋 Structure attendue</h5>
              <div className="structure-info">
                <span className="structure-status">
                  {codeStructure.matches ? '✅ Correspond' : '❌ Ne correspond pas'}
                </span>
              </div>
            </div>
            
            <div className="structure-content">
              <pre className="structure-code">{structure}</pre>
            </div>
          </div>
        )}

        {/* Mots-clés */}
        {keywords.length > 0 && (
          <div className="keywords-section">
            <div className="section-header">
              <h5>🔑 Mots-clés</h5>
              <div className="keywords-info">
                <span className="keywords-count">
                  {keywords.length} mot{keywords.length > 1 ? 's' : ''}-clé{keywords.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="keywords-content">
              <div className="keywords-list">
                {keywords.map((keyword, index) => (
                  <div key={index} className="keyword-item">
                    <span className="keyword-text">{keyword}</span>
                    <span className="keyword-usage">
                      {keywordUsage[index]?.used ? '✅ Utilisé' : '❌ Non utilisé'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Éditeur de pseudo-code */}
        <div className="code-editor-section">
          <div className="section-header">
            <h5>✏️ Votre pseudo-code</h5>
            <div className="editor-info">
              <span className="code-quality">
                Qualité: {codeQuality.level} ({codeQuality.score}%)
              </span>
            </div>
          </div>
          
          <div className="editor-content">
            <textarea
              value={pseudoCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="Écrivez votre pseudo-code ici..."
              className="pseudo-code-editor"
              rows={15}
            />
          </div>
        </div>

        {/* Qualité du code */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Qualité du code</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {codeQuality.score}%
              </span>
            </div>
          </div>
          
          <div className="quality-content">
            <div className="quality-feedback">
              {codeQuality.feedback.map((feedback, index) => (
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
              disabled={isValidating || !pseudoCode.trim()}
            >
              {isValidating ? '⏳ Validation...' : '✅ Valider le pseudo-code'}
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
                    <h6>Votre code :</h6>
                    <pre className="user-code">{validationResult.details.userCode}</pre>
                  </div>
                  
                  <div className="details-section">
                    <h6>Code attendu :</h6>
                    <pre className="expected-code">{validationResult.details.expectedCode}</pre>
                  </div>
                  
                  {validationResult.details.differences && validationResult.details.differences.length > 0 && (
                    <div className="details-section">
                      <h6>Différences :</h6>
                      <ul className="differences-list">
                        {validationResult.details.differences.map((diff, index) => (
                          <li key={index} className="difference-item">{diff}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
      <div className="pseudo-code-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Écrivez le pseudo-code demandé en suivant la structure et les mots-clés fournis.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Analysez la structure attendue</li>
            <li>Utilisez les mots-clés appropriés</li>
            <li>Écrivez le pseudo-code étape par étape</li>
            <li>Vérifiez la cohérence</li>
          </ul>
          <p>
            <strong>Éléments du pseudo-code :</strong>
          </p>
          <ul>
            <li>📝 <strong>Structure :</strong> Organisation logique du code</li>
            <li>🔑 <strong>Mots-clés :</strong> Termes techniques appropriés</li>
            <li>📊 <strong>Qualité :</strong> Clarté et précision</li>
            <li>🧪 <strong>Tests :</strong> Validation des cas d'usage</li>
          </ul>
          <p>
            <strong>Conseils d'écriture :</strong>
          </p>
          <ul>
            <li>Utilisez un langage clair et précis</li>
            <li>Suivez la structure fournie</li>
            <li>Incluez tous les mots-clés nécessaires</li>
            <li>Vérifiez la logique de votre code</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PseudoCodeExercise;