import React, { useState } from 'react';

const ScratchBlocksExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [selectedBlocks, setSelectedBlocks] = useState(userAnswer?.blocks || []);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Helper to normalize blocks (handle legacy strings vs new objects)
  const normalizeBlock = (block, index) => {
    if (typeof block === 'string') {
      // Basic heuristics for legacy data
      let category = 'motion';
      if (block.includes('dire') || block.includes('costume')) category = 'looks';
      if (block.includes('son') || block.includes('jouer')) category = 'sound';
      if (block.includes('quand') || block.includes('cliqué')) category = 'events';
      if (block.includes('si') || block.includes('épéter')) category = 'control';

      return {
        id: `legacy-${index}-${block.replace(/\s+/g, '')}`,
        text: block,
        category,
        type: 'command'
      };
    }
    // Ensure object has an ID
    return {
      ...block,
      id: block.id || `block-${index}-${block.text?.replace(/\s+/g, '')}`
    };
  };

  // Shuffle logic using strict state to prevent re-ordering
  const [shuffledBlocks, setShuffledBlocks] = useState([]);

  React.useEffect(() => {
    // Only proceed if we have blocks
    if (!exercise?.scratchBlocks) return;

    // Create new array with random sort key
    const raw = (exercise.scratchBlocks || []).map((b, i) => normalizeBlock(b, i));

    // Sort by random value (map-sort-map pattern)
    // Using a simple Map allows correct shuffling of the *values* without relying on index
    const shuffled = raw
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    console.log('[Scratch] Blocks randomized for exercise ' + (exercise._id || exercise.id));
    setShuffledBlocks(shuffled);
  }, [exercise._id, exercise.id, exercise.scratchBlocks?.length]); // Strict dependency on ID and length

  const getBlocks = () => {
    // Return empty until shuffled to prevent flash of ordered content
    return shuffledBlocks.length > 0 ? shuffledBlocks : [];
  };

  const getExpectedBlocks = () => {
    // If expectedBlocks is explicitly defined (new format)
    if (exercise.expectedBlocks && exercise.expectedBlocks.length > 0) {
      return exercise.expectedBlocks.map((b, i) => normalizeBlock(b, i));
    }

    // Fallback: assume the scratchBlocks (if simple list) implies using them all?
    // Or check if exercise.solutions exists and use indices
    return (exercise.scratchBlocks || []).map((b, i) => normalizeBlock(b, i));
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const handleBlockSelect = (block) => {
    // Create a unique instance for the workspace
    const newBlock = {
      ...block,
      instanceId: Date.now() + Math.random() // Unique ID for the workspace instance
    };
    const newBlocks = [...selectedBlocks, newBlock];
    setSelectedBlocks(newBlocks);
    onAnswerChange({ blocks: newBlocks });
    setValidationResult(null);
  };

  const handleBlockRemove = (instanceId) => {
    const newBlocks = selectedBlocks.filter(block => block.instanceId !== instanceId);
    setSelectedBlocks(newBlocks);
    onAnswerChange({ blocks: newBlocks });
    setValidationResult(null);
  };

  const handleBlockMove = (fromIndex, toIndex) => {
    const newBlocks = [...selectedBlocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    setSelectedBlocks(newBlocks);
    onAnswerChange({ blocks: newBlocks });
    setValidationResult(null);
  };

  const handleReset = () => {
    setSelectedBlocks([]);
    setValidationResult(null);
    onAnswerChange({ blocks: [] });
  };

  const handleAutoComplete = () => {
    const expectedBlocks = getExpectedBlocks();
    // Map expected blocks to have instanceIds
    const blocksWithInstances = expectedBlocks.map(b => ({
      ...b,
      instanceId: Date.now() + Math.random()
    }));
    setSelectedBlocks(blocksWithInstances);
    onAnswerChange({ blocks: blocksWithInstances });
  };

  const handleValidate = async () => {
    setIsValidating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const expectedBlocks = getExpectedBlocks();

      // Compare based on 'text' and 'category' (content), NOT instanceId
      const userContent = selectedBlocks.map(b => `${b.category}:${b.text.trim()}`);
      const expectedContent = expectedBlocks.map(b => `${b.category}:${b.text.trim()}`);

      const isCorrect = JSON.stringify(userContent) === JSON.stringify(expectedContent);

      // Calculate basic similarity score for partial credit
      let matchCount = 0;
      userContent.forEach((u, i) => {
        if (u === expectedContent[i]) matchCount++;
      });
      const score = Math.round((matchCount / Math.max(userContent.length, expectedContent.length)) * 100);

      const result = {
        isCorrect,
        score: isCorrect ? 100 : score,
        message: isCorrect ? 'Programme Scratch correct !' : 'Le programme contient des erreurs.',
        details: {
          userBlocks: selectedBlocks,
          expectedBlocks,
          differences: isCorrect ? [] : ['L\'ordre ou le contenu des blocs est incorrect']
        }
      };

      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getBlockStats = () => {
    const totalBlocks = getBlocks().length;
    const selectedCount = selectedBlocks.length;
    const completionRate = Math.min(100, totalBlocks > 0 ? (selectedCount / totalBlocks) * 100 : 0);

    return {
      totalBlocks,
      selectedCount,
      completionRate: Math.round(completionRate)
    };
  };

  const getBlockCategory = (block) => block.category || 'motion';

  const getBlockIcon = (block) => {
    if (block.icon) return block.icon;
    switch (getBlockCategory(block)) {
      case 'motion': return '🏃';
      case 'looks': return '👁️';
      case 'sound': return '🔊';
      case 'events': return '🚩';
      case 'control': return '🔄';
      case 'sensing': return '🤔';
      case 'operators': return '➕';
      case 'variables': return '📦';
      default: return '🧩';
    }
  };

  const getBlockColor = (category) => {
    const colors = {
      'motion': '#4C97FF',
      'looks': '#9966FF',
      'sound': '#CF63CF',
      'events': '#FFBF00',
      'control': '#FFAB19',
      'sensing': '#5CB1D6',
      'operators': '#59C059',
      'variables': '#FF8C1A',
      'lists': '#FF661A',
      'unknown': '#CCCCCC'
    };
    return colors[category] || colors.unknown;
  };

  // Helper to make the block look like a Scratch block
  const getBlockStyle = (block) => {
    const color = getBlockColor(getBlockCategory(block));
    return {
      backgroundColor: color,
      borderColor: 'rgba(0,0,0,0.2)',
      color: 'white',
      borderStyle: 'solid',
      borderWidth: '1px',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 2px rgba(0,0,0,0.1)',
      cursor: 'pointer'
    };
  };

  const getBlockUsage = () => {
    const blocks = getBlocks();
    const usage = blocks.map(block => ({
      block,
      used: selectedBlocks.some(selected => selected.text === block.text),
      count: selectedBlocks.filter(selected => selected.text === block.text).length
    }));
    return usage;
  };

  const getProgramQuality = () => {
    const stats = getBlockStats();
    let qualityScore = 0;
    let feedback = [];

    // Simple heuristics
    if (stats.selectedCount > 0) qualityScore += 20;
    if (stats.completionRate >= 100) {
      qualityScore += 30;
      feedback.push('✅ Longueur correcte');
    } else if (stats.completionRate > 0) {
      feedback.push('⚠️ Programme incomplet');
    }

    const hasEvents = selectedBlocks.some(b => b.category === 'events');
    if (hasEvents) {
      qualityScore += 20;
      feedback.push('✅ Contient un événement');
    } else {
      feedback.push('⚠️ Manque un événement de départ');
    }

    // Vérification de la diversité
    const categories = [...new Set(selectedBlocks.map(block => block.category))];
    if (categories.length >= 2) {
      qualityScore += 30;
      feedback.push('✅ Diversité des blocs');
    }

    return {
      score: Math.min(100, qualityScore),
      feedback,
      level: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'bon' : qualityScore >= 40 ? 'moyen' : 'faible'
    };
  };

  const getProgramExecution = () => {
    return {
      blocks: selectedBlocks,
      execution: 'Simulation...',
      result: 'Prêt à exécuter'
    };
  };

  const blocks = getBlocks();
  const testCases = getTestCases();
  const stats = getBlockStats();
  const blockUsage = getBlockUsage();
  const programQuality = getProgramQuality();
  // const programExecution = getProgramExecution(); // Unused for now

  return (
    <div className="scratch-blocks-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>🧩 Blocs Scratch</h4>
          <div className="blocks-stats">
            <span className="blocks-count">
              {stats.selectedCount}/{stats.totalBlocks} blocs
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
          <button onClick={handleAutoComplete} className="auto-btn">
            ▶️ Complétion
          </button>
        </div>
      </div>

      <div className="scratch-blocks-layout">
        {/* Blocs disponibles */}
        <div className="available-blocks-section">
          <div className="section-header">
            <h5>📦 Blocs disponibles</h5>
          </div>

          <div className="blocks-content">
            {blocks.length === 0 ? (
              <div className="empty-blocks">
                <p>Aucun bloc disponible</p>
              </div>
            ) : (
              <div className="blocks-grid">
                {blocks.map((block, index) => {
                  return (
                    <div
                      key={block.id}
                      className={`scratch-block ${getBlockCategory(block)} available`}
                      onClick={() => handleBlockSelect(block)}
                      style={getBlockStyle(block)}
                    >
                      <div className="block-header" style={{ border: 'none', padding: '8px' }}>
                        <span className="block-icon" style={{ marginRight: '8px' }}>{getBlockIcon(block)}</span>
                        <span className="block-text font-bold">{block.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Programme assemblé */}
        <div className="program-section">
          <div className="section-header">
            <h5>🎯 Votre Programme</h5>
          </div>

          <div className="program-content" style={{ minHeight: '300px', background: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
            {selectedBlocks.length === 0 ? (
              <div className="empty-program">
                <p>Glissez ou cliquez sur des blocs pour construire votre programme</p>
              </div>
            ) : (
              <div className="program-blocks flex flex-col gap-2">
                {selectedBlocks.map((block, index) => (
                  <div
                    key={block.instanceId}
                    className={`program-block ${getBlockCategory(block)} transform transition-all hover:scale-[1.02]`}
                    style={{
                      ...getBlockStyle(block),
                      position: 'relative',
                      padding: '12px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="block-position opacity-50 font-mono text-xs">{index + 1}</span>
                      <span className="block-icon">{getBlockIcon(block)}</span>
                      <span className="block-text font-bold">{block.text}</span>
                    </div>

                    <div className="block-controls flex gap-1 opacity-80 hover:opacity-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); index > 0 && handleBlockMove(index, index - 1); }}
                        className="p-1 hover:bg-white/20 rounded"
                        disabled={index === 0}
                        title="Monter"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); index < selectedBlocks.length - 1 && handleBlockMove(index, index + 1); }}
                        className="p-1 hover:bg-white/20 rounded"
                        disabled={index === selectedBlocks.length - 1}
                        title="Descendre"
                      >
                        ↓
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBlockRemove(block.instanceId); }}
                        className="p-1 hover:bg-red-500/20 rounded text-red-50 ml-1"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Qualité du programme */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Analyse</h5>
            <div className="quality-info">
              <span className="quality-score">Score: {programQuality.score}%</span>
            </div>
          </div>

          <div className="quality-content">
            <div className="quality-feedback">
              {programQuality.feedback.map((feedback, index) => (
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
            <h5>Validation</h5>
          </div>

          <div className="controls-content">
            <button
              onClick={handleValidate}
              className="validate-btn"
              disabled={isValidating || selectedBlocks.length === 0}
            >
              {isValidating ? '⏳ Vérification...' : '✅ Vérifier mon programme'}
            </button>
          </div>
        </div>

        {/* Résultat de validation */}
        {validationResult && (
          <div className="validation-result">
            <div className="result-header">
              <div className="result-info">
                <span className={`result-status ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
                  {validationResult.isCorrect ? '✅ Excellent !' : '❌ Pas tout à fait...'}
                </span>
                <span className="result-message">{validationResult.message}</span>
              </div>
            </div>

            {!validationResult.isCorrect && validationResult.details?.differences && (
              <div className="result-content">
                <p className="text-sm text-red-500 mt-2">
                  {validationResult.details.differences[0]}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScratchBlocksExercise;