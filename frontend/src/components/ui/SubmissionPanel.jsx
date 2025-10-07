import React from 'react';

/**
 * Composant SubmissionPanel - Panel de soumission et résultats
 */
const SubmissionPanel = ({ 
  onSubmit, 
  result, 
  isSubmitting, 
  attemptsAllowed,
  userAnswer,
  error
}) => {
  const canSubmit = userAnswer && !isSubmitting;
  const hasAttemptsLeft = !attemptsAllowed || (result?.attempts || 0) < attemptsAllowed;

  const handleSubmit = () => {
    if (canSubmit && hasAttemptsLeft) {
      onSubmit();
    }
  };

  const getSubmissionStatus = () => {
    if (isSubmitting) return 'submitting';
    if (result?.correct) return 'success';
    if (result && !result.correct) return 'error';
    return 'idle';
  };

  const getStatusIcon = () => {
    switch (getSubmissionStatus()) {
      case 'submitting': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📤';
    }
  };

  const getStatusText = () => {
    switch (getSubmissionStatus()) {
      case 'submitting': return 'Soumission en cours...';
      case 'success': return 'Réponse correcte !';
      case 'error': return 'Réponse incorrecte';
      default: return 'Soumettre votre réponse';
    }
  };

  return (
    <div className="submission-panel">
      <div className="submission-header">
        <h3>🎯 Soumission</h3>
        <div className="submission-status">
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{getStatusText()}</span>
        </div>
      </div>

      <div className="submission-content">
        {/* Informations sur les tentatives */}
        {attemptsAllowed && (
          <div className="attempts-info">
            <div className="attempts-header">
              <span className="attempts-icon">🔄</span>
              <span className="attempts-title">Tentatives</span>
            </div>
            <div className="attempts-details">
              <div className="attempts-used">
                Utilisées: {result?.attempts || 0}
              </div>
              <div className="attempts-remaining">
                Restantes: {Math.max(0, attemptsAllowed - (result?.attempts || 0))}
              </div>
              {!hasAttemptsLeft && (
                <div className="attempts-exhausted">
                  ⚠️ Toutes les tentatives ont été utilisées
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bouton de soumission */}
        <div className="submission-actions">
          <button
            className={`submit-button ${getSubmissionStatus()}`}
            onClick={handleSubmit}
            disabled={!canSubmit || !hasAttemptsLeft}
          >
            <span className="submit-icon">{getStatusIcon()}</span>
            <span className="submit-text">
              {isSubmitting ? 'Soumission...' : 'Soumettre'}
            </span>
          </button>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="submission-error">
            <div className="error-header">
              <span className="error-icon">⚠️</span>
              <span className="error-title">Erreur</span>
            </div>
            <div className="error-content">
              {error}
            </div>
          </div>
        )}

        {/* Résultats de soumission */}
        {result && (
          <div className={`submission-result ${result.correct ? 'success' : 'error'}`}>
            <div className="result-header">
              <div className="result-status">
                <span className="result-icon">
                  {result.correct ? '✅' : '❌'}
                </span>
                <span className="result-text">
                  {result.correct ? 'Correct !' : 'Incorrect'}
                </span>
              </div>
              <div className="result-score">
                <span className="score-earned">{result.pointsEarned || 0}</span>
                <span className="score-separator">/</span>
                <span className="score-max">{result.pointsMax || 0}</span>
                <span className="score-percentage">
                  ({result.pointsMax > 0 ? Math.round(((result.pointsEarned || 0) / result.pointsMax) * 100) : 0}%)
                </span>
              </div>
            </div>

            {/* XP gagné */}
            {result.xpEarned > 0 && (
              <div className="xp-earned">
                <span className="xp-icon">🌟</span>
                <span className="xp-text">+{result.xpEarned} XP gagné !</span>
              </div>
            )}

            {/* Explication */}
            {result.explanation && (
              <div className="result-explanation">
                <div className="explanation-header">
                  <span className="explanation-icon">💡</span>
                  <span className="explanation-title">Explication</span>
                </div>
                <div className="explanation-content">
                  {result.explanation}
                </div>
              </div>
            )}

            {/* Détails spécifiques selon le type d'exercice */}
            {result.details && (
              <div className="result-details">
                <div className="details-header">
                  <span className="details-icon">📊</span>
                  <span className="details-title">Détails</span>
                </div>
                <div className="details-content">
                  {result.details.type === 'QCM' && (
                    <div className="qcm-details">
                      <div className="qcm-comparison">
                        <div className="qcm-user">
                          <strong>Vos réponses :</strong> {result.details.user?.join(', ') || 'Aucune'}
                        </div>
                        <div className="qcm-correct">
                          <strong>Bonnes réponses :</strong> {result.details.correct?.join(', ') || 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

                  {result.details.tests && (
                    <div className="tests-results">
                      <h4>Résultats des tests :</h4>
                      {result.details.tests.map((test, i) => (
                        <div key={i} className={`test-result ${test.passed ? 'passed' : 'failed'}`}>
                          <div className="test-name">
                            <strong>{test.name || `Test ${i+1}`}</strong>
                          </div>
                          <div className="test-status">
                            <span className="test-icon">
                              {test.passed ? '✅' : '❌'}
                            </span>
                            <span className="test-text">
                              {test.passed ? 'Réussi' : 'Échec'}
                            </span>
                            {test.points && (
                              <span className="test-points">
                                (+{test.points} pts)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Détails génériques */}
                  {!result.details.type && !result.details.tests && (
                    <div className="generic-details">
                      <pre>{JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionPanel;