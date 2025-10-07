import React from 'react';

/**
 * Composant ExerciseHeader - En-tête d'exercice avec métadonnées
 */
const ExerciseHeader = ({ 
  title, 
  difficulty, 
  points, 
  type, 
  timeLimit, 
  attemptsAllowed,
  hint,
  showSolutionAfterAttempts,
  allowPartial,
  language
}) => {
  const getDifficultyInfo = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return { 
          color: '#4CAF50', 
          label: '😊 Facile',
          icon: '😊'
        };
      case 'hard':
        return { 
          color: '#f44336', 
          label: '🔥 Difficile',
          icon: '🔥'
        };
      default:
        return { 
          color: '#ff9800', 
          label: '🎯 Moyen',
          icon: '🎯'
        };
    }
  };

  const getTypeInfo = (type) => {
    const typeMap = {
      'QCM': { icon: '📝', label: 'Question à Choix Multiples' },
      'Code': { icon: '💻', label: 'Programmation' },
      'DragDrop': { icon: '🖱️', label: 'Glisser-Déposer' },
      'TextInput': { icon: '⌨️', label: 'Saisie de Texte' },
      'FillInTheBlank': { icon: '📝', label: 'Remplissage de Trous' },
      'Matching': { icon: '🔗', label: 'Correspondance' },
      'OrderBlocks': { icon: '📦', label: 'Ordre des Blocs' },
      'SpotTheError': { icon: '🐛', label: 'Détection d\'Erreurs' },
      'Algorithm': { icon: '🧮', label: 'Algorithme' },
      'FlowChart': { icon: '📊', label: 'Organigramme' },
      'Trace': { icon: '🔍', label: 'Traçage' },
      'Debug': { icon: '🔧', label: 'Débogage' },
      'CodeCompletion': { icon: '✏️', label: 'Complétion de Code' },
      'PseudoCode': { icon: '📋', label: 'Pseudo-code' },
      'Complexity': { icon: '⚡', label: 'Complexité' },
      'DataStructure': { icon: '🗂️', label: 'Structure de Données' },
      'ScratchBlocks': { icon: '🧩', label: 'Blocs Scratch' },
      'VisualProgramming': { icon: '🎨', label: 'Programmation Visuelle' },
      'ConceptMapping': { icon: '🗺️', label: 'Cartographie de Concepts' },
      'CodeOutput': { icon: '📤', label: 'Sortie de Code' },
      'Optimization': { icon: '⚡', label: 'Optimisation' }
    };
    return typeMap[type] || { icon: '❓', label: type };
  };

  const difficultyInfo = getDifficultyInfo(difficulty);
  const typeInfo = getTypeInfo(type);

  return (
    <div className="exercise-header">
      <div className="header-main">
        <div className="header-left">
          <h1 className="exercise-title">{title}</h1>
          <div className="exercise-meta">
            <div className="meta-item">
              <span className="meta-icon">{typeInfo.icon}</span>
              <span className="meta-label">{typeInfo.label}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">⭐</span>
              <span className="meta-label">{points} points</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">{difficultyInfo.icon}</span>
              <span className="meta-label">{difficultyInfo.label}</span>
            </div>
            {language && (
              <div className="meta-item">
                <span className="meta-icon">💻</span>
                <span className="meta-label">{language}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="header-right">
          <div className="exercise-constraints">
            {timeLimit && (
              <div className="constraint-item">
                <span className="constraint-icon">⏱️</span>
                <span className="constraint-label">Limite: {timeLimit}min</span>
              </div>
            )}
            {attemptsAllowed && (
              <div className="constraint-item">
                <span className="constraint-icon">🔄</span>
                <span className="constraint-label">Tentatives: {attemptsAllowed}</span>
              </div>
            )}
            {allowPartial && (
              <div className="constraint-item">
                <span className="constraint-icon">📊</span>
                <span className="constraint-label">Points partiels</span>
              </div>
            )}
            {showSolutionAfterAttempts && (
              <div className="constraint-item">
                <span className="constraint-icon">💡</span>
                <span className="constraint-label">Solution après {showSolutionAfterAttempts} tentatives</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {hint && (
        <div className="exercise-hint">
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
  );
};

export default ExerciseHeader;