import React, { useState, useEffect } from 'react';

/**
 * Composant OrderBlocksExercise - Exercice d'ordonnancement de blocs
 */
const OrderBlocksExercise = ({ exercise, userAnswer, onAnswerChange, attempts = 0, maxAttempts = 3 }) => {
  const [blockOrder, setBlockOrder] = useState(userAnswer || []);
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    onAnswerChange(blockOrder);
  }, [blockOrder, onAnswerChange]);

  const moveBlock = (fromIndex, toIndex) => {
    if (showSolution) return; // Empêcher la modification si la solution est affichée
    
    const newOrder = [...blockOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setBlockOrder(newOrder);
  };

  const resetOrder = () => {
    if (showSolution) return;
    setBlockOrder(exercise.blocks?.map((_, index) => index) || []);
  };

  const shuffleOrder = () => {
    if (showSolution) return;
    const shuffled = [...blockOrder].sort(() => Math.random() - 0.5);
    setBlockOrder(shuffled);
  };

  const getBlockById = (blockId) => {
    return exercise.blocks?.find(block => block.id === blockId);
  };

  const getBlockType = (block) => {
    return block.type || 'code';
  };

  const getBlockIcon = (type) => {
    const icons = {
      'code': '💻',
      'comment': '💬',
      'function': '🔧',
      'variable': '📝',
      'condition': '❓',
      'loop': '🔄',
      'return': '↩️',
      'import': '📥',
      'export': '📤',
      'class': '🏗️',
      'method': '⚙️',
      'property': '🏷️'
    };
    return icons[type] || '📦';
  };

  const getBlockColor = (type) => {
    const colors = {
      'code': '#4CAF50',
      'comment': '#9E9E9E',
      'function': '#2196F3',
      'variable': '#FF9800',
      'condition': '#E91E63',
      'loop': '#9C27B0',
      'return': '#795548',
      'import': '#607D8B',
      'export': '#FF5722',
      'class': '#3F51B5',
      'method': '#00BCD4',
      'property': '#8BC34A'
    };
    return colors[type] || '#666';
  };

  return (
    <div className="order-blocks-exercise">
      <div className="order-instruction">
        <p>Ordonnez les blocs de code dans le bon ordre :</p>
        {attempts > 0 && (
          <div className="attempts-info">
            Tentatives: {attempts}/{maxAttempts}
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div className="order-controls">
        <button 
          onClick={resetOrder}
          className="control-button reset"
          disabled={showSolution}
        >
          🔄 Réinitialiser
        </button>
        <button 
          onClick={shuffleOrder}
          className="control-button shuffle"
          disabled={showSolution}
        >
          🎲 Mélanger
        </button>
      </div>

      {/* Zone d'ordonnancement */}
      <div className="order-workspace">
        <div className="blocks-container">
          {blockOrder.map((blockIndex, position) => {
            const block = exercise.blocks?.[blockIndex];
            if (!block) return null;

            const blockType = getBlockType(block);
            const blockIcon = getBlockIcon(blockType);
            const blockColor = getBlockColor(blockType);

            return (
              <div
                key={block.id || blockIndex}
                className="order-block"
                style={{ borderLeftColor: blockColor }}
              >
                <div className="block-header">
                  <div className="block-position">
                    <span className="position-number">{position + 1}</span>
                  </div>
                  <div className="block-type">
                    <span className="type-icon">{blockIcon}</span>
                    <span className="type-label">{blockType}</span>
                  </div>
                  <div className="block-controls">
                    <button
                      onClick={() => position > 0 && moveBlock(position, position - 1)}
                      disabled={position === 0 || showSolution}
                      className="move-button up"
                      title="Déplacer vers le haut"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => position < blockOrder.length - 1 && moveBlock(position, position + 1)}
                      disabled={position === blockOrder.length - 1 || showSolution}
                      className="move-button down"
                      title="Déplacer vers le bas"
                    >
                      ↓
                    </button>
                  </div>
                </div>
                
                <div className="block-content">
                  <pre className="block-code">{block.code}</pre>
                  {block.description && (
                    <div className="block-description">
                      {block.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistiques */}
      <div className="order-stats">
        <div className="stats-item">
          <span className="stats-label">Blocs ordonnés :</span>
          <span className="stats-value">{blockOrder.length}</span>
        </div>
        <div className="stats-item">
          <span className="stats-label">Total de blocs :</span>
          <span className="stats-value">{exercise.blocks?.length || 0}</span>
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
            <div className="solution-blocks">
              {exercise.solution.map((blockId, index) => {
                const block = getBlockById(blockId);
                if (!block) return null;

                const blockType = getBlockType(block);
                const blockIcon = getBlockIcon(blockType);
                const blockColor = getBlockColor(blockType);

                return (
                  <div
                    key={blockId}
                    className="solution-block"
                    style={{ borderLeftColor: blockColor }}
                  >
                    <div className="block-header">
                      <div className="block-position">
                        <span className="position-number">{index + 1}</span>
                      </div>
                      <div className="block-type">
                        <span className="type-icon">{blockIcon}</span>
                        <span className="type-label">{blockType}</span>
                      </div>
                    </div>
                    <div className="block-content">
                      <pre className="block-code">{block.code}</pre>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderBlocksExercise;