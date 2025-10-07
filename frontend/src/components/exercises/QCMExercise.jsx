import React, { useState, useEffect } from 'react';

/**
 * Composant QCMExercise - Exercice à choix multiples
 */
const QCMExercise = ({ exercise, userAnswer, onAnswerChange, attempts = 0, maxAttempts = 3 }) => {
  const [selectedOptions, setSelectedOptions] = useState(userAnswer || []);
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    onAnswerChange(selectedOptions);
  }, [selectedOptions, onAnswerChange]);

  const handleOptionToggle = (optionIndex) => {
    if (showSolution) return; // Empêcher la modification si la solution est affichée
    
    const newSelection = [...selectedOptions];
    const index = newSelection.indexOf(optionIndex);
    
    if (index > -1) {
      // Désélectionner si déjà sélectionné
      newSelection.splice(index, 1);
    } else {
      // Ajouter à la sélection
      newSelection.push(optionIndex);
    }
    
    setSelectedOptions(newSelection);
  };

  const isOptionSelected = (optionIndex) => {
    return selectedOptions.includes(optionIndex);
  };

  const isOptionCorrect = (optionIndex) => {
    if (!showSolution) return false;
    return exercise.solutions?.includes(optionIndex) || false;
  };

  const getOptionStatus = (optionIndex) => {
    if (!showSolution) return 'normal';
    
    const isSelected = isOptionSelected(optionIndex);
    const isCorrect = isOptionCorrect(optionIndex);
    
    if (isCorrect && isSelected) return 'correct-selected';
    if (isCorrect && !isSelected) return 'correct-missed';
    if (!isCorrect && isSelected) return 'incorrect-selected';
    return 'normal';
  };

  const getOptionIcon = (optionIndex) => {
    if (!showSolution) return '';
    
    const isSelected = isOptionSelected(optionIndex);
    const isCorrect = isOptionCorrect(optionIndex);
    
    if (isCorrect && isSelected) return '✅';
    if (isCorrect && !isSelected) return '💡';
    if (!isCorrect && isSelected) return '❌';
    return '';
  };

  return (
    <div className="qcm-exercise">
      <div className="qcm-instruction">
        <p>
          {exercise.allowMultiple ? 
            'Sélectionnez toutes les bonnes réponses :' : 
            'Sélectionnez la bonne réponse :'
          }
        </p>
        {attempts > 0 && (
          <div className="attempts-info">
            Tentatives: {attempts}/{maxAttempts}
          </div>
        )}
      </div>
      
      <div className="qcm-options">
        {exercise.options?.map((option, index) => {
          const status = getOptionStatus(index);
          const icon = getOptionIcon(index);
          
          return (
            <div
              key={index}
              className={`qcm-option ${status} ${isOptionSelected(index) ? 'selected' : ''}`}
              onClick={() => handleOptionToggle(index)}
            >
              <div className="option-content">
                <div className="option-header">
                  <div className="option-radio">
                    {exercise.allowMultiple ? (
                      <div className={`checkbox ${isOptionSelected(index) ? 'checked' : ''}`}>
                        {isOptionSelected(index) && '✓'}
                      </div>
                    ) : (
                      <div className={`radio ${isOptionSelected(index) ? 'checked' : ''}`}>
                        {isOptionSelected(index) && '●'}
                      </div>
                    )}
                  </div>
                  
                  <div className="option-text">
                    {option.text || option.content || option}
                  </div>
                  
                  {icon && (
                    <div className="option-icon">
                      {icon}
                    </div>
                  )}
                </div>
                
                {option.media && (
                  <div className="option-media">
                    {option.media.type === 'image' && (
                      <img src={option.media.url} alt={option.media.alt || 'Image'} />
                    )}
                    {option.media.type === 'video' && (
                      <video controls>
                        <source src={option.media.url} type={option.media.mimeType} />
                      </video>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Solution après 3 tentatives */}
      {showSolution && exercise.solution && (
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
      
      {/* Statistiques de sélection */}
      <div className="qcm-stats">
        <div className="stats-item">
          <span className="stats-label">Réponses sélectionnées :</span>
          <span className="stats-value">{selectedOptions.length}</span>
        </div>
        {exercise.allowMultiple && (
          <div className="stats-item">
            <span className="stats-label">Réponses possibles :</span>
            <span className="stats-value">{exercise.options?.length || 0}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QCMExercise;