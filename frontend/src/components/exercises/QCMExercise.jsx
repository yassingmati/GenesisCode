import React, { useState, useEffect } from 'react';
import './QCMExercise.css';

/**
 * Composant QCMExercise - Exercice à choix multiples
 */
const QCMExercise = ({ exercise, userAnswer, onAnswerChange, attempts = 0, maxAttempts = 3 }) => {
  const [selectedOptions, setSelectedOptions] = useState(userAnswer || []);
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    onAnswerChange(selectedOptions);
  }, [selectedOptions, onAnswerChange]);

  // Determine if multiple selection should be allowed
  // If explicitly set in exercise data OR if there are multiple correct solutions
  const isMultiple = exercise.allowMultiple === true || (Array.isArray(exercise.solutions) && exercise.solutions.length > 1);

  const handleOptionToggle = (optionIndex) => {
    if (showSolution) return; // Empêcher la modification si la solution est affichée

    if (!isMultiple) {
      // Mode choix unique : on remplace la sélection
      // Si on clique sur l'élément déjà sélectionné, on le garde (ou on le désélectionne ? radio usually keeps it)
      // Comportement standard radio : cliquer sur un autre change, cliquer sur le même ne fait rien.
      // Sauf si on veut permettre de désélectionner. Pour un QCM, souvent on sélectionne une réponse.
      // Mais ici on utilise un array.

      const isSelected = selectedOptions.includes(optionIndex);
      if (isSelected) {
        // Optionnel : permettre la désélection en recliquant ? 
        // Souvent non pour des radios. Mais gardons la logique toggle si c'est le seul.
        // Pour l'instant : Switch to clicked option.
        // Si c'est déjà sélectionné, on ne fait rien ou on laisse comme ça.
        // Si on veut permettre "pas de réponse", on pourrait toggle.
        // Le code précédent permettait le toggle.
        // Allons-y pour : Remplacer par la nouvelle sélection.
        setSelectedOptions([optionIndex]);
      } else {
        setSelectedOptions([optionIndex]);
      }
      return;
    }

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
    <div className={`qcm-exercise ${isMultiple ? 'multiple-selection' : 'single-selection'}`}>
      <div className="qcm-instruction">
        <p>
          {isMultiple ?
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
                    {isMultiple ? (
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
        {isMultiple && (
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