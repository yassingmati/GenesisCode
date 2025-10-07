import React, { useState, useEffect } from 'react';
import CodeEditor from '../CodeEditor';

/**
 * Composant SpotTheErrorExercise - Exercice de détection d'erreurs
 */
const SpotTheErrorExercise = ({ 
  exercise, 
  userAnswer, 
  onAnswerChange, 
  onCodeChange,
  onTest,
  attempts = 0, 
  maxAttempts = 3 
}) => {
  const [identifiedErrors, setIdentifiedErrors] = useState(userAnswer?.errors || []);
  const [code, setCode] = useState(userAnswer?.code || exercise?.codeSnippet || '');
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    onAnswerChange({ errors: identifiedErrors, code });
  }, [identifiedErrors, code, onAnswerChange]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  const addError = (line, type, description) => {
    if (showSolution) return; // Empêcher la modification si la solution est affichée
    
    const newError = { 
      line: parseInt(line), 
      type, 
      description,
      id: Date.now()
    };
    setIdentifiedErrors([...identifiedErrors, newError]);
  };

  const removeError = (errorId) => {
    if (showSolution) return;
    setIdentifiedErrors(identifiedErrors.filter(err => err.id !== errorId));
  };

  const getErrorTypeInfo = (type) => {
    const typeMap = {
      'syntax': { icon: '🔴', label: 'Erreur de syntaxe', color: '#f44336' },
      'logic': { icon: '🟡', label: 'Erreur de logique', color: '#ff9800' },
      'runtime': { icon: '🟠', label: 'Erreur d\'exécution', color: '#ff5722' },
      'performance': { icon: '🟣', label: 'Problème de performance', color: '#9c27b0' },
      'style': { icon: '🔵', label: 'Problème de style', color: '#2196f3' },
      'security': { icon: '🔒', label: 'Problème de sécurité', color: '#795548' }
    };
    return typeMap[type] || { icon: '❓', label: type, color: '#666' };
  };

  const handleTest = async (userCode) => {
    if (onTest) {
      return await onTest(userCode);
    }
    return {
      success: true,
      message: 'Code analysé avec succès',
      details: {
        errorsFound: identifiedErrors.length,
        errors: identifiedErrors
      }
    };
  };

  return (
    <div className="spot-error-exercise">
      <div className="error-instruction">
        <p>Identifiez et marquez toutes les erreurs dans le code suivant :</p>
        {attempts > 0 && (
          <div className="attempts-info">
            Tentatives: {attempts}/{maxAttempts}
          </div>
        )}
      </div>

      <div className="error-layout">
        {/* Éditeur de code */}
        <div className="code-section">
          <CodeEditor
            exercise={exercise}
            userAnswer={code}
            setUserAnswer={handleCodeChange}
            onTest={handleTest}
            attempts={attempts}
            maxAttempts={maxAttempts}
            showSolution={showSolution}
            solution={exercise?.solution}
            language={exercise?.language || 'javascript'}
          />
        </div>

        {/* Panel d'erreurs */}
        <div className="errors-panel">
          <div className="errors-header">
            <h4>Erreurs identifiées</h4>
            <div className="errors-count">
              {identifiedErrors.length} erreur{identifiedErrors.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Légende des types d'erreur */}
          <div className="error-legend">
            <h5>Types d'erreurs :</h5>
            <div className="legend-items">
              {['syntax', 'logic', 'runtime', 'performance', 'style', 'security'].map(type => {
                const typeInfo = getErrorTypeInfo(type);
                return (
                  <div key={type} className="legend-item">
                    <span 
                      className="legend-color" 
                      style={{ backgroundColor: typeInfo.color }}
                    />
                    <span className="legend-icon">{typeInfo.icon}</span>
                    <span className="legend-label">{typeInfo.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Liste des erreurs identifiées */}
          <div className="errors-list">
            {identifiedErrors.length === 0 ? (
              <div className="no-errors">
                <p>Aucune erreur identifiée</p>
                <p>Cliquez sur "Ajouter une erreur" pour commencer</p>
              </div>
            ) : (
              identifiedErrors.map((error, index) => {
                const typeInfo = getErrorTypeInfo(error.type);
                return (
                  <div key={error.id} className="error-item">
                    <div className="error-header">
                      <div className="error-type">
                        <span 
                          className="type-badge"
                          style={{ backgroundColor: typeInfo.color }}
                        >
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                      </div>
                      <div className="error-line">
                        Ligne {error.line}
                      </div>
                      <button
                        onClick={() => removeError(error.id)}
                        className="remove-error-btn"
                        disabled={showSolution}
                        title="Supprimer cette erreur"
                      >
                        ×
                      </button>
                    </div>
                    <div className="error-description">
                      {error.description}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Formulaire d'ajout d'erreur */}
          <div className="add-error-form">
            <h5>Ajouter une erreur</h5>
            <div className="form-fields">
              <div className="field-group">
                <label>Ligne :</label>
                <input
                  type="number"
                  id="error-line"
                  placeholder="Numéro de ligne"
                  min="1"
                  className="line-input"
                />
              </div>
              
              <div className="field-group">
                <label>Type :</label>
                <select id="error-type" className="type-select">
                  <option value="">Sélectionner un type</option>
                  {['syntax', 'logic', 'runtime', 'performance', 'style', 'security'].map(type => {
                    const typeInfo = getErrorTypeInfo(type);
                    return (
                      <option key={type} value={type}>
                        {typeInfo.icon} {typeInfo.label}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="field-group">
                <label>Description :</label>
                <input
                  type="text"
                  id="error-description"
                  placeholder="Description de l'erreur"
                  className="description-input"
                />
              </div>
              
              <button
                onClick={() => {
                  const line = document.getElementById('error-line').value;
                  const type = document.getElementById('error-type').value;
                  const description = document.getElementById('error-description').value;
                  
                  if (line && type && description) {
                    addError(line, type, description);
                    // Réinitialiser les champs
                    document.getElementById('error-line').value = '';
                    document.getElementById('error-type').value = '';
                    document.getElementById('error-description').value = '';
                  }
                }}
                className="add-error-btn"
                disabled={showSolution}
              >
                + Ajouter l'erreur
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Solution après 3 tentatives */}
      {showSolution && exercise?.solution && (
        <div className="solution-section">
          <div className="solution-header">
            <span className="solution-icon">💡</span>
            <span className="solution-title">Solution</span>
          </div>
          <div className="solution-content">
            <p>{exercise.solution}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotTheErrorExercise;