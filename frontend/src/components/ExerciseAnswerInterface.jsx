import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from './ui/CodeEditor';
import './ExerciseAnswerInterface.css';

/**
 * Interface unifiée pour répondre aux exercices
 * Logique simplifiée et UX améliorée
 */
export default function ExerciseAnswerInterface({ 
  exercise, 
  onAnswer, 
  onTest, 
  attempts = 0, 
  maxAttempts = 3,
  isSubmitting = false 
}) {
  const [userAnswer, setUserAnswer] = useState(null);
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Initialiser la réponse selon le type d'exercice
  useEffect(() => {
    if (!userAnswer) {
      const initialAnswer = getInitialAnswer(exercise);
      setUserAnswer(initialAnswer);
    }
  }, [exercise]);

  // Fonction pour obtenir la réponse initiale selon le type
  const getInitialAnswer = (exercise) => {
    switch (exercise.type) {
      case 'QCM':
        return [];
      case 'TextInput':
      case 'FillInTheBlank':
      case 'SpotTheError':
        return '';
      case 'Code':
      case 'Trace':
      case 'Debug':
      case 'CodeCompletion':
      case 'PseudoCode':
      case 'Complexity':
      case 'CodeOutput':
      case 'Optimization':
        return '';
      case 'OrderBlocks':
        return exercise.blocks?.map((_, i) => i) || [];
      case 'DragDrop':
      case 'Matching':
        return {};
      case 'Algorithm':
      case 'AlgorithmSteps':
        return exercise.algorithmSteps?.map((_, i) => i) || [];
      case 'ScratchBlocks':
        return [];
      default:
        return null;
    }
  };

  // Fonction de test unifiée
  const handleTest = async () => {
    if (!onTest) return;
    
    try {
      // Validation avancée pour les exercices de code
      if (['Code', 'Trace', 'Debug', 'CodeCompletion', 'PseudoCode', 'Complexity', 'CodeOutput', 'Optimization'].includes(exercise.type)) {
        const validation = validateCodeAnswer(userAnswer);
        if (!validation.valid) {
          setTestResult({
            success: false,
            message: `Erreur de validation: ${validation.message}`,
            details: validation.details
          });
          return;
        }
      }
      
      setIsTesting(true);
      const result = await onTest(userAnswer);
      setTestResult(result);
    } catch (error) {
      console.error('Erreur lors du test:', error);
      setTestResult({
        success: false,
        message: 'Erreur lors du test: ' + error.message,
        details: 'Vérifiez votre connexion et réessayez'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Fonction de soumission unifiée - Version améliorée
  const handleSubmit = () => {
    try {
      if (!isAnswerValid()) {
        alert('Veuillez compléter votre réponse avant de soumettre');
        return;
      }
      
      if (onAnswer) {
        onAnswer(userAnswer);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de la soumission. Veuillez réessayer.');
    }
  };

  // Vérifier si la réponse est valide
  const isAnswerValid = () => {
    if (!userAnswer) return false;
    
    try {
      switch (exercise.type) {
      case 'QCM':
        return Array.isArray(userAnswer) && userAnswer.length > 0;
      
      case 'TextInput':
      case 'FillInTheBlank':
      case 'SpotTheError':
        return typeof userAnswer === 'string' && userAnswer.trim().length > 0;
      
      case 'Code':
      case 'Trace':
      case 'Debug':
      case 'CodeCompletion':
      case 'PseudoCode':
      case 'Complexity':
      case 'CodeOutput':
      case 'Optimization':
        if (typeof userAnswer !== 'string' || userAnswer.trim().length === 0) return false;
        
        // Validation stricte pour le code
        const code = userAnswer.toLowerCase().trim();
        
        // Vérifications de base pour tout code
        const hasFunction = code.includes('function') || code.includes('=>') || code.includes('const') || code.includes('let');
        const hasReturn = code.includes('return') || code.includes('console.log') || code.includes('print');
        
        if (!hasFunction || !hasReturn) return false;
        
        // Validations spécifiques selon le type d'exercice
        if (exercise.type === 'Code') {
          // Vérifier que c'est du code JavaScript valide
          return code.includes('function') || code.includes('=>') || code.includes('const') || code.includes('let');
        }
        
        if (exercise.type === 'Debug') {
          // Pour le debug, vérifier qu'il y a une identification d'erreur
          return code.includes('error') || code.includes('erreur') || code.includes('bug') || code.includes('problem');
        }
        
        return true;
      
      case 'OrderBlocks':
      case 'Algorithm':
      case 'AlgorithmSteps':
        return Array.isArray(userAnswer) && userAnswer.length > 0;
      
      case 'DragDrop':
      case 'Matching':
        return typeof userAnswer === 'object' && Object.keys(userAnswer).length > 0;
      
      case 'ScratchBlocks':
        return Array.isArray(userAnswer) && userAnswer.length > 0;
      
      default:
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      return false;
    }
  };

  // Validation avancée pour les exercices de code
  const validateCodeAnswer = (code) => {
    if (!code || typeof code !== 'string') return { valid: false, message: 'Code vide' };
    
    const codeLower = code.toLowerCase().trim();
    
    // Vérifications de base
    if (!codeLower.includes('function') && !codeLower.includes('=>') && !codeLower.includes('const') && !codeLower.includes('let')) {
      return { valid: false, message: 'Il manque une déclaration de fonction' };
    }
    
    if (!codeLower.includes('return') && !codeLower.includes('console.log') && !codeLower.includes('print')) {
      return { valid: false, message: 'Il manque un retour de valeur ou un affichage' };
    }
    
    // Vérifications spécifiques selon l'exercice
    if (exercise.name && exercise.name.toLowerCase().includes('factoriel')) {
      if (!codeLower.includes('factoriel') || !codeLower.includes('n * factoriel')) {
        return { valid: false, message: 'La fonction doit s\'appeler "factoriel" et être récursive' };
      }
    }
    
    if (exercise.name && exercise.name.toLowerCase().includes('fizz')) {
      if (!codeLower.includes('fizz') || !codeLower.includes('buzz')) {
        return { valid: false, message: 'Il manque la logique FizzBuzz' };
      }
    }
    
    if (exercise.name && exercise.name.toLowerCase().includes('somme')) {
      if (!codeLower.includes('filter') && !codeLower.includes('for') && !codeLower.includes('reduce')) {
        return { valid: false, message: 'Il manque une méthode pour traiter les éléments du tableau' };
      }
    }
    
    return { valid: true, message: 'Code valide' };
  };

  // Rendu de l'interface selon le type d'exercice
  const renderAnswerInterface = () => {
    switch (exercise.type) {
      case 'QCM':
        return <QCMInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;
      
      case 'TextInput':
      case 'FillInTheBlank':
      case 'SpotTheError':
        return <TextInputInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;
      
      case 'Code':
      case 'Trace':
      case 'Debug':
      case 'CodeCompletion':
      case 'PseudoCode':
      case 'Complexity':
      case 'CodeOutput':
      case 'Optimization':
        return <CodeInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;
      
      case 'OrderBlocks':
        return <OrderBlocksInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;
      
      case 'DragDrop':
        return <DragDropInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;
      
      case 'Matching':
        return <MatchingInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;
      
      case 'Algorithm':
      case 'AlgorithmSteps':
        return <AlgorithmInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;
      
      case 'ScratchBlocks':
        return <ScratchInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;
      
      case 'CodeCompletion':
        return <CodeCompletionInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;
      
      case 'PseudoCode':
        return <PseudoCodeInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;
      
      default:
        return <div className="unsupported-exercise">
          <p>Type d'exercice non supporté: {exercise.type}</p>
        </div>;
    }
  };

  return (
    <div className="exercise-answer-interface">
      {/* En-tête avec informations */}
      <div className="answer-header">
        <div className="exercise-info">
          <h3>{exercise.name}</h3>
          <div className="exercise-meta">
            <span className="type-badge">{exercise.type}</span>
            <span className="points-badge">{exercise.points || 10} points</span>
            {attempts > 0 && (
              <span className="attempts-badge">
                Tentatives: {attempts}/{maxAttempts}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="question-section">
        <p className="question-text">{exercise.question}</p>
      </div>

      {/* Interface de réponse */}
      <div className="answer-section">
        {renderAnswerInterface()}
      </div>

      {/* Boutons d'action */}
      <div className="action-buttons">
        {onTest && (
          <button 
            className="btn-test"
            onClick={handleTest}
            disabled={!isAnswerValid() || isTesting}
          >
            {isTesting ? '⏳ Test en cours...' : '🧪 Tester ma réponse'}
          </button>
        )}
        
        <button 
          className="btn-submit"
          onClick={handleSubmit}
          disabled={!isAnswerValid() || isSubmitting}
        >
          {isSubmitting ? '⏳ Envoi...' : '📤 Soumettre'}
        </button>
      </div>

      {/* Résultat du test */}
      <AnimatePresence>
        {testResult && (
          <motion.div 
            className={`test-result ${testResult.success ? 'success' : 'error'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="result-header">
              <span className="result-icon">
                {testResult.success ? '✅' : '❌'}
              </span>
              <span className="result-message">{testResult.message}</span>
            </div>
            {testResult.details && (
              <div className="result-details">
                <pre>{JSON.stringify(testResult.details, null, 2)}</pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solution après 3 tentatives */}
      <AnimatePresence>
        {showSolution && exercise.solution && (
          <motion.div 
            className="solution-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="solution-header">
              <span className="solution-icon">💡</span>
              <span className="solution-title">Solution</span>
            </div>
            <div className="solution-content">
              <pre>{exercise.solution}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================
// COMPOSANTS D'INTERFACE SPÉCIFIQUES
// =========================

function QCMInterface({ exercise, answer, onAnswer }) {
  const options = exercise.options || [];
  const currentAnswer = answer || [];
  
  const handleOptionChange = (index, checked) => {
    if (checked) {
      onAnswer([...currentAnswer, index]);
    } else {
      onAnswer(currentAnswer.filter(i => i !== index));
    }
  };

  return (
    <div className="qcm-interface">
      <div className="options-grid">
        {options.map((option, index) => (
          <label key={index} className="option-item">
            <input
              type="checkbox"
              checked={currentAnswer.includes(index)}
              onChange={(e) => handleOptionChange(index, e.target.checked)}
            />
            <span className="option-text">
              {typeof option === 'object' ? option.text : option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function TextInputInterface({ exercise, answer, onAnswer }) {
  const currentAnswer = answer || '';
  
  return (
    <div className="text-input-interface">
      <textarea
        className="answer-textarea"
        value={currentAnswer}
        onChange={(e) => onAnswer(e.target.value)}
        placeholder="Tapez votre réponse ici..."
        rows={4}
      />
    </div>
  );
}

function CodeInterface({ exercise, answer, onAnswer }) {
  const currentAnswer = answer || '';
  
  const handleTest = async (userCode) => {
    // Simulation d'un test de code
    return {
      success: true,
      message: 'Code exécuté avec succès',
      details: {
        lines: userCode.split('\n').length,
        language: exercise.language || 'javascript'
      }
    };
  };

  return (
    <div className="code-interface">
      <CodeEditor
        exercise={exercise}
        userAnswer={currentAnswer}
        setUserAnswer={onAnswer}
        onTest={handleTest}
        attempts={0}
        maxAttempts={3}
        showSolution={false}
        language={exercise.language || 'javascript'}
      />
    </div>
  );
}

function OrderBlocksInterface({ exercise, answer, onAnswer }) {
  const blocks = exercise.blocks || [];
  const currentAnswer = answer || [];
  
  const moveBlock = (fromIndex, toIndex) => {
    const newAnswer = [...currentAnswer];
    const [moved] = newAnswer.splice(fromIndex, 1);
    newAnswer.splice(toIndex, 0, moved);
    onAnswer(newAnswer);
  };

  return (
    <div className="order-blocks-interface">
      <div className="blocks-container">
        {currentAnswer.map((blockIndex, position) => (
          <div key={blocks[blockIndex]?.id} className="block-item">
            <div className="block-controls">
              <button 
                onClick={() => position > 0 && moveBlock(position, position - 1)}
                disabled={position === 0}
                className="btn-move up"
              >
                ↑
              </button>
              <span className="position">{position + 1}</span>
              <button 
                onClick={() => position < currentAnswer.length - 1 && moveBlock(position, position + 1)}
                disabled={position === currentAnswer.length - 1}
                className="btn-move down"
              >
                ↓
              </button>
            </div>
            <pre className="block-code">{blocks[blockIndex]?.code}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function DragDropInterface({ exercise, answer, onAnswer }) {
  const elements = exercise.elements || [];
  const targets = exercise.targets || [];
  const currentAnswer = answer || {};

  const handleAssignment = (elementId, targetId) => {
    onAnswer({
      ...currentAnswer,
      [elementId]: targetId
    });
  };

  return (
    <div className="drag-drop-interface">
      <div className="elements-section">
        <h4>Éléments</h4>
        {elements.map((element, index) => (
          <div key={element.id || index} className="element-item">
            {typeof element === 'object' ? element.content : element}
          </div>
        ))}
      </div>
      
      <div className="targets-section">
        <h4>Cibles</h4>
        {targets.map((target, index) => (
          <div key={target.id || index} className="target-item">
            {typeof target === 'object' ? target.content : target}
          </div>
        ))}
      </div>
      
      <div className="assignments-section">
        <h4>Associations :</h4>
        {elements.map((element, index) => (
          <div key={element.id || index} className="assignment-row">
            <span className="element-label">
              {typeof element === 'object' ? element.content : element}
            </span>
            <select 
              value={currentAnswer[element.id || index] || ''}
              onChange={(e) => handleAssignment(element.id || index, e.target.value)}
            >
              <option value="">Sélectionner une cible</option>
              {targets.map((target, targetIndex) => (
                <option key={target.id || targetIndex} value={target.id || targetIndex}>
                  {typeof target === 'object' ? target.content : target}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchingInterface({ exercise, answer, onAnswer }) {
  const prompts = exercise.prompts || [];
  const matches = exercise.matches || [];
  const currentAnswer = answer || {};

  const handlePairing = (promptId, matchId) => {
    const newAnswer = { ...currentAnswer };
    if (matchId) {
      newAnswer[promptId] = matchId;
    } else {
      delete newAnswer[promptId];
    }
    onAnswer(newAnswer);
  };

  return (
    <div className="matching-interface">
      <div className="matching-container">
        {prompts.map((prompt, index) => (
          <div key={prompt.id || index} className="matching-row">
            <div className="prompt-item">
              {typeof prompt === 'object' ? prompt.content : prompt}
            </div>
            <div className="arrow">→</div>
            <select 
              value={currentAnswer[prompt.id] || ''}
              onChange={(e) => handlePairing(prompt.id, e.target.value)}
              className="match-select"
            >
              <option value="">Choisir...</option>
              {matches.map((match, matchIndex) => (
                <option key={match.id || matchIndex} value={match.id || matchIndex}>
                  {typeof match === 'object' ? match.content : match}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlgorithmInterface({ exercise, answer, onAnswer }) {
  const steps = exercise.algorithmSteps || [];
  const currentAnswer = answer || [];
  
  const moveStep = (fromIndex, toIndex) => {
    const newAnswer = [...currentAnswer];
    const [moved] = newAnswer.splice(fromIndex, 1);
    newAnswer.splice(toIndex, 0, moved);
    onAnswer(newAnswer);
  };

  return (
    <div className="algorithm-interface">
      <div className="steps-container">
        {currentAnswer.map((stepIndex, position) => (
          <div key={steps[stepIndex]?.id} className="step-item">
            <div className="step-controls">
              <button 
                onClick={() => position > 0 && moveStep(position, position - 1)}
                disabled={position === 0}
                className="btn-move up"
              >
                ↑
              </button>
              <span className="position">{position + 1}</span>
              <button 
                onClick={() => position < currentAnswer.length - 1 && moveStep(position, position + 1)}
                disabled={position === currentAnswer.length - 1}
                className="btn-move down"
              >
                ↓
              </button>
            </div>
            <div className="step-content">{steps[stepIndex]?.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScratchInterface({ exercise, answer, onAnswer }) {
  const blocks = exercise.scratchBlocks || [];
  const currentAnswer = answer || [];
  
  const addBlock = (block) => {
    onAnswer([...currentAnswer, { ...block, id: Date.now() }]);
  };

  const removeBlock = (id) => {
    onAnswer(currentAnswer.filter(block => block.id !== id));
  };

  return (
    <div className="scratch-interface">
      <div className="available-blocks">
        <h4>Blocs disponibles :</h4>
        <div className="blocks-grid">
          {blocks.map((block, index) => (
            <div
              key={index}
              className={`scratch-block ${block.category}`}
              onClick={() => addBlock(block)}
            >
              <div className="block-icon">{block.icon || '🧩'}</div>
              <div className="block-text">{block.text}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="program-area">
        <h4>Votre programme :</h4>
        <div className="selected-blocks">
          {currentAnswer.length === 0 ? (
            <div className="empty-program">
              <p>Cliquez sur des blocs pour commencer</p>
            </div>
          ) : (
            currentAnswer.map((block, index) => (
              <div key={block.id} className={`scratch-block ${block.category} selected`}>
                <div className="block-content">
                  <div className="block-icon">{block.icon || '🧩'}</div>
                  <div className="block-text">{block.text}</div>
                </div>
                <button onClick={() => removeBlock(block.id)} className="btn-remove">✕</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CodeCompletionInterface({ exercise, answer, onAnswer }) {
  const currentAnswer = answer || {};
  const gaps = exercise.codeGaps || [];
  
  const handleGapChange = (gapId, value) => {
    onAnswer({
      ...currentAnswer,
      [gapId]: value
    });
  };

  return (
    <div className="code-completion-interface">
      <div className="code-template">
        <h4>Template de code :</h4>
        <pre>{exercise.codeTemplate}</pre>
      </div>
      
      <div className="gaps-section">
        <h4>Complétez les trous :</h4>
        {gaps.map((gap, index) => (
          <div key={gap.id} className="gap-item">
            <label className="gap-label">
              {gap.placeholder}:
              {gap.hint && <span className="gap-hint"> ({gap.hint})</span>}
            </label>
            <input
              type="text"
              className="gap-input"
              value={currentAnswer[gap.id] || ''}
              onChange={(e) => handleGapChange(gap.id, e.target.value)}
              placeholder={`Complétez ${gap.placeholder}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PseudoCodeInterface({ exercise, answer, onAnswer }) {
  const currentAnswer = answer || '';
  
  return (
    <div className="pseudo-code-interface">
      <div className="instruction">
        <p>Écrivez le pseudo-code demandé :</p>
      </div>
      
      <textarea
        className="pseudo-code-textarea"
        value={currentAnswer}
        onChange={(e) => onAnswer(e.target.value)}
        placeholder="Écrivez votre pseudo-code ici..."
        rows={8}
      />
      
      {exercise.pseudoCodeStructure && (
        <div className="structure-hint">
          <h4>Structure attendue :</h4>
          <pre className="structure-example">{exercise.pseudoCodeStructure}</pre>
        </div>
      )}
    </div>
  );
}
