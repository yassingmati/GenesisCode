import React, { useState, useEffect } from 'react';
import CodeEditor from '../../components/CodeEditor';

// =========================
// NOUVEAUX COMPOSANTS D'EXERCICES POUR ALGORITHMES ET PROGRAMMATION
// =========================

export function AlgorithmExercise({ exercise, userAnswer, setUserAnswer }) {
  const steps = exercise.algorithmSteps || [];
  const [currentOrder, setCurrentOrder] = useState(steps.map((_, i) => i));

  useEffect(() => {
    const stepIds = currentOrder.map(index => steps[index]?.id).filter(Boolean);
    setUserAnswer(stepIds);
  }, [currentOrder, steps, setUserAnswer]);

  const moveStep = (fromIndex, toIndex) => {
    const newOrder = [...currentOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setCurrentOrder(newOrder);
  };

  return (
    <div className="exercise-algorithm">
      <div className="instruction">
        <p>Ordonnez les étapes de l'algorithme dans le bon ordre :</p>
      </div>
      
      <div className="algorithm-steps">
        {currentOrder.map((stepIndex, position) => (
          <div key={steps[stepIndex]?.id} className="algorithm-step">
            <div className="step-controls">
              <button 
                onClick={() => position > 0 && moveStep(position, position - 1)}
                disabled={position === 0}
                className="btn-move up"
              >
                ↑
              </button>
              <span className="step-number">{position + 1}</span>
              <button 
                onClick={() => position < steps.length - 1 && moveStep(position, position + 1)}
                disabled={position === steps.length - 1}
                className="btn-move down"
              >
                ↓
              </button>
            </div>
            <div className="step-content">
              {steps[stepIndex]?.description || steps[stepIndex]?.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FlowChartExercise({ exercise, userAnswer, setUserAnswer }) {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    setUserAnswer({ nodes, connections });
  }, [nodes, connections, setUserAnswer]);

  return (
    <div className="exercise-flowchart">
      <div className="instruction">
        <p>Créez l'organigramme en plaçant et connectant les éléments :</p>
      </div>
      
      <div className="flowchart-workspace">
        <div className="flowchart-info">
          <p>💡 Cet exercice nécessite une interface de création d'organigramme interactive.</p>
          <p>Fonctionnalité à implémenter avec une bibliothèque comme React Flow ou D3.js</p>
          <div className="flowchart-placeholder">
            <h4>Éléments disponibles :</h4>
            <div className="flowchart-elements">
              <div className="fc-element start">Début</div>
              <div className="fc-element process">Processus</div>
              <div className="fc-element decision">Décision</div>
              <div className="fc-element end">Fin</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TraceExercise({ exercise, userAnswer, setUserAnswer, attempts = 0, maxAttempts = 3 }) {
  const variables = exercise.traceVariables || [];
  const [trace, setTrace] = useState(userAnswer?.trace || []);
  const [code, setCode] = useState(userAnswer?.code || '');
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    setUserAnswer({ trace, code });
  }, [trace, code, setUserAnswer]);

  const addTraceStep = () => {
    const newStep = {};
    variables.forEach(variable => {
      newStep[variable.name] = '';
    });
    setTrace([...trace, newStep]);
  };

  const updateTraceStep = (stepIndex, variable, value) => {
    const newTrace = [...trace];
    newTrace[stepIndex][variable] = value;
    setTrace(newTrace);
  };

  const handleTest = async (userCode) => {
    // Simulation d'un test de traçage
    return {
      success: true,
      message: 'Code exécuté avec succès',
      details: {
        steps: trace.length,
        variables: trace
      }
    };
  };

  return (
    <div className="exercise-trace">
      <div className="instruction">
        <p>Tracez l'exécution du code en indiquant les valeurs des variables à chaque étape :</p>
      </div>
      
      {/* Éditeur de code */}
      <CodeEditor
        exercise={exercise}
        userAnswer={code}
        setUserAnswer={setCode}
        onTest={handleTest}
        attempts={attempts}
        maxAttempts={maxAttempts}
        showSolution={showSolution}
        solution={exercise.solution}
        language={exercise.language || 'javascript'}
      />
      
      <div className="trace-table">
        <table>
          <thead>
            <tr>
              <th>Étape</th>
              {variables.map(variable => (
                <th key={variable.name}>{variable.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trace.map((step, stepIndex) => (
              <tr key={stepIndex}>
                <td>{stepIndex + 1}</td>
                {variables.map(variable => (
                  <td key={variable.name}>
                    <input
                      type="text"
                      value={step[variable.name] || ''}
                      onChange={(e) => updateTraceStep(stepIndex, variable.name, e.target.value)}
                      placeholder={variable.type || 'valeur'}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        <button className="btn-add-step" onClick={addTraceStep}>
          + Ajouter une étape
        </button>
      </div>
    </div>
  );
}

export function DebugExercise({ exercise, userAnswer, setUserAnswer, attempts = 0, maxAttempts = 3 }) {
  const [foundErrors, setFoundErrors] = useState(userAnswer?.errors || []);
  const [code, setCode] = useState(userAnswer?.code || '');
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    setUserAnswer({ errors: foundErrors, code });
  }, [foundErrors, code, setUserAnswer]);

  const addError = (line, type, description) => {
    const newError = { line, type, description };
    setFoundErrors([...foundErrors, newError]);
  };

  const removeError = (index) => {
    setFoundErrors(foundErrors.filter((_, i) => i !== index));
  };

  const handleTest = async (userCode) => {
    // Simulation d'un test de débogage
    return {
      success: true,
      message: 'Code analysé avec succès',
      details: {
        errorsFound: foundErrors.length,
        errors: foundErrors
      }
    };
  };

  return (
    <div className="exercise-debug">
      <div className="instruction">
        <p>Identifiez les erreurs dans le code suivant :</p>
      </div>
      
      {/* Éditeur de code */}
      <CodeEditor
        exercise={exercise}
        userAnswer={code}
        setUserAnswer={setCode}
        onTest={handleTest}
        attempts={attempts}
        maxAttempts={maxAttempts}
        showSolution={showSolution}
        solution={exercise.solution}
        language={exercise.language || 'javascript'}
      />
      
      <div className="errors-found">
        <h4>Erreurs identifiées :</h4>
        {foundErrors.map((error, index) => (
          <div key={index} className="error-item">
            <span>Ligne {error.line}: {error.type} - {error.description}</span>
            <button onClick={() => removeError(index)}>✕</button>
          </div>
        ))}
        
        <div className="add-error-form">
          <input type="number" placeholder="Ligne" id="error-line" />
          <select id="error-type">
            <option value="">Type d'erreur</option>
            <option value="syntax">Erreur de syntaxe</option>
            <option value="logic">Erreur de logique</option>
            <option value="runtime">Erreur d'exécution</option>
          </select>
          <input type="text" placeholder="Description" id="error-desc" />
          <button onClick={() => {
            const line = document.getElementById('error-line').value;
            const type = document.getElementById('error-type').value;
            const desc = document.getElementById('error-desc').value;
            if (line && type && desc) {
              addError(parseInt(line), type, desc);
              document.getElementById('error-line').value = '';
              document.getElementById('error-type').value = '';
              document.getElementById('error-desc').value = '';
            }
          }}>
            Ajouter erreur
          </button>
        </div>
      </div>
    </div>
  );
}

export function CodeCompletionExercise({ exercise, userAnswer, setUserAnswer, attempts = 0, maxAttempts = 3 }) {
  const [completions, setCompletions] = useState(userAnswer?.completions || {});
  const [code, setCode] = useState(userAnswer?.code || '');
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    setUserAnswer({ completions, code });
  }, [completions, code, setUserAnswer]);

  const updateCompletion = (gapId, value) => {
    setCompletions({ ...completions, [gapId]: value });
  };

  const handleTest = async (userCode) => {
    // Simulation d'un test de complétion
    return {
      success: true,
      message: 'Code complété avec succès',
      details: {
        completions: Object.keys(completions).length,
        gaps: completions
      }
    };
  };

  return (
    <div className="exercise-code-completion">
      <div className="instruction">
        <p>Complétez le code en remplissant les parties manquantes :</p>
      </div>
      
      {/* Éditeur de code */}
      <CodeEditor
        exercise={exercise}
        userAnswer={code}
        setUserAnswer={setCode}
        onTest={handleTest}
        attempts={attempts}
        maxAttempts={maxAttempts}
        showSolution={showSolution}
        solution={exercise.solution}
        language={exercise.language || 'javascript'}
      />
      
      <div className="code-template">
        <pre>
          {exercise.codeTemplate ? 
            exercise.codeTemplate.split(/(\{GAP_\d+\})/).map((part, index) => {
              if (part.match(/\{GAP_(\d+)\}/)) {
                const gapId = part.match(/\{GAP_(\d+)\}/)[1];
                return (
                  <input
                    key={index}
                    type="text"
                    className="code-gap"
                    placeholder="..."
                    value={completions[gapId] || ''}
                    onChange={(e) => updateCompletion(gapId, e.target.value)}
                  />
                );
              }
              return part;
            }) :
            'Template de code non disponible'
          }
        </pre>
      </div>
      
      {exercise.codeGaps && exercise.codeGaps.length > 0 && (
        <div className="gap-hints">
          <h4>Indices :</h4>
          {exercise.codeGaps.map((gap, index) => (
            <div key={index} className="gap-hint">
              <strong>Gap {gap.id}:</strong> {gap.hint}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PseudoCodeExercise({ exercise, userAnswer, setUserAnswer, attempts = 0, maxAttempts = 3 }) {
  const [code, setCode] = useState(userAnswer || '');
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    setUserAnswer(code);
  }, [code, setUserAnswer]);

  const handleTest = async (userCode) => {
    // Simulation d'un test de pseudo-code
    return {
      success: true,
      message: 'Pseudo-code analysé avec succès',
      details: {
        lines: userCode.split('\n').length,
        keywords: ['DÉBUT', 'FIN', 'SI', 'ALORS', 'SINON', 'POUR', 'TANT QUE'].filter(keyword => 
          userCode.toUpperCase().includes(keyword)
        )
      }
    };
  };

  return (
    <div className="exercise-pseudo-code">
      <div className="instruction">
        <p>Écrivez le pseudo-code pour résoudre le problème suivant :</p>
      </div>
      
      {/* Éditeur de code pour pseudo-code */}
      <CodeEditor
        exercise={exercise}
        userAnswer={code}
        setUserAnswer={setCode}
        onTest={handleTest}
        attempts={attempts}
        maxAttempts={maxAttempts}
        showSolution={showSolution}
        solution={exercise.solution}
        language="pseudocode"
      />
      
      <div className="pseudo-code-tips">
        <h4>💡 Conseils pour le pseudo-code :</h4>
        <ul>
          <li>Utilisez DÉBUT et FIN pour délimiter</li>
          <li>LIRE pour les entrées, ÉCRIRE pour les sorties</li>
          <li>SI...ALORS...SINON...FIN SI pour les conditions</li>
          <li>POUR...FIN POUR ou TANT QUE...FIN TANT QUE pour les boucles</li>
        </ul>
      </div>
    </div>
  );
}

export function ComplexityExercise({ exercise, userAnswer, setUserAnswer, attempts = 0, maxAttempts = 3 }) {
  const [complexity, setComplexity] = useState(userAnswer?.complexity || '');
  const [justification, setJustification] = useState(userAnswer?.justification || '');
  const [code, setCode] = useState(userAnswer?.code || '');
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    setUserAnswer({ complexity, justification, code });
  }, [complexity, justification, code, setUserAnswer]);

  const handleTest = async (userCode) => {
    // Simulation d'un test d'analyse de complexité
    return {
      success: true,
      message: 'Analyse de complexité effectuée',
      details: {
        complexity,
        justification: justification.length,
        codeLines: userCode.split('\n').length
      }
    };
  };

  return (
    <div className="exercise-complexity">
      <div className="instruction">
        <p>Analysez la complexité algorithmique du code suivant :</p>
      </div>
      
      {/* Éditeur de code */}
      <CodeEditor
        exercise={exercise}
        userAnswer={code}
        setUserAnswer={setCode}
        onTest={handleTest}
        attempts={attempts}
        maxAttempts={maxAttempts}
        showSolution={showSolution}
        solution={exercise.solution}
        language={exercise.language || 'javascript'}
      />
      
      <div className="complexity-analysis">
        <div className="complexity-input">
          <label>Complexité temporelle :</label>
          <select value={complexity} onChange={(e) => setComplexity(e.target.value)}>
            <option value="">Sélectionnez...</option>
            <option value="O(1)">O(1) - Constante</option>
            <option value="O(log n)">O(log n) - Logarithmique</option>
            <option value="O(n)">O(n) - Linéaire</option>
            <option value="O(n log n)">O(n log n) - Quasi-linéaire</option>
            <option value="O(n²)">O(n²) - Quadratique</option>
            <option value="O(2^n)">O(2^n) - Exponentielle</option>
          </select>
        </div>
        
        <div className="justification-input">
          <label>Justification :</label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Expliquez pourquoi cette complexité..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

export function DataStructureExercise({ exercise, userAnswer, setUserAnswer }) {
  const [operations, setOperations] = useState([]);

  useEffect(() => {
    setUserAnswer({ operations });
  }, [operations, setUserAnswer]);

  const addOperation = (operation, value = null) => {
    const newOp = { operation, value, id: Date.now() };
    setOperations([...operations, newOp]);
  };

  return (
    <div className="exercise-data-structure">
      <div className="instruction">
        <p>Effectuez les opérations suivantes sur la structure de données {exercise.dataStructureType} :</p>
      </div>
      
      <div className="data-structure-operations">
        <div className="operation-buttons">
          {exercise.dataStructureOperations?.map((op, index) => (
            <button
              key={index}
              className="operation-btn"
              onClick={() => {
                if (op.requiresValue) {
                  const value = prompt(`Valeur pour ${op.name}:`);
                  if (value) addOperation(op.name, value);
                } else {
                  addOperation(op.name);
                }
              }}
            >
              {op.name}
            </button>
          ))}
        </div>
        
        <div className="operations-sequence">
          <h4>Séquence d'opérations :</h4>
          {operations.map((op, index) => (
            <div key={op.id} className="operation-item">
              {index + 1}. {op.operation}{op.value && `(${op.value})`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScratchBlocksExercise({ exercise, userAnswer, setUserAnswer, attempts = 0, maxAttempts = 3 }) {
  const [selectedBlocks, setSelectedBlocks] = useState(userAnswer?.blocks || []);
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    setUserAnswer({ blocks: selectedBlocks });
  }, [selectedBlocks, setUserAnswer]);

  const addBlock = (block) => {
    setSelectedBlocks([...selectedBlocks, { ...block, id: Date.now() }]);
  };

  const removeBlock = (id) => {
    setSelectedBlocks(selectedBlocks.filter(block => block.id !== id));
  };

  const moveBlock = (fromIndex, toIndex) => {
    const newBlocks = [...selectedBlocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    setSelectedBlocks(newBlocks);
  };

  return (
    <div className="exercise-scratch-blocks">
      <div className="instruction">
        <p>Assemblez les blocs Scratch pour créer le programme demandé :</p>
        {attempts > 0 && (
          <div className="attempts-info">
            Tentatives: {attempts}/{maxAttempts}
          </div>
        )}
      </div>
      
      <div className="scratch-workspace">
        <div className="available-blocks">
          <h4>Blocs disponibles :</h4>
          <div className="blocks-grid">
            {exercise.scratchBlocks?.map((block, index) => (
              <div
                key={index}
                className={`scratch-block ${block.category}`}
                onClick={() => addBlock(block)}
                title={block.description || block.text}
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
            {selectedBlocks.length === 0 ? (
              <div className="empty-program">
                <p>Glissez-déposez des blocs ici pour commencer</p>
              </div>
            ) : (
              selectedBlocks.map((block, index) => (
                <div key={block.id} className={`scratch-block ${block.category} selected`}>
                  <div className="block-controls">
                    <button 
                      onClick={() => index > 0 && moveBlock(index, index - 1)}
                      disabled={index === 0}
                      className="btn-move up"
                    >
                      ↑
                    </button>
                    <span className="position">{index + 1}</span>
                    <button 
                      onClick={() => index < selectedBlocks.length - 1 && moveBlock(index, index + 1)}
                      disabled={index === selectedBlocks.length - 1}
                      className="btn-move down"
                    >
                      ↓
                    </button>
                    <button onClick={() => removeBlock(block.id)} className="btn-remove">✕</button>
                  </div>
                  <div className="block-content">
                    <div className="block-icon">{block.icon || '🧩'}</div>
                    <div className="block-text">{block.text}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Solution après 3 tentatives */}
      {showSolution && exercise.solution && (
        <div className="solution-section">
          <div className="solution-header">
            <span className="solution-icon">💡</span>
            <span className="solution-title">Solution</span>
          </div>
          <div className="solution-content">
            <div className="solution-blocks">
              {exercise.solution.map((block, index) => (
                <div key={index} className={`scratch-block ${block.category} solution`}>
                  <div className="block-icon">{block.icon || '🧩'}</div>
                  <div className="block-text">{block.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function VisualProgrammingExercise({ exercise, userAnswer, setUserAnswer }) {
  return (
    <div className="exercise-visual-programming">
      <div className="instruction">
        <p>Créez le programme en utilisant les éléments visuels :</p>
      </div>
      
      <div className="visual-programming-info">
        <p>💡 Interface de programmation visuelle à implémenter</p>
        <p>Fonctionnalité avancée nécessitant une bibliothèque de programmation visuelle</p>
      </div>
    </div>
  );
}

export function ConceptMappingExercise({ exercise, userAnswer, setUserAnswer }) {
  const [mappings, setMappings] = useState([]);

  useEffect(() => {
    setUserAnswer({ mappings });
  }, [mappings, setUserAnswer]);

  const addMapping = (conceptId, definitionId) => {
    const newMapping = { conceptId, definitionId };
    setMappings([...mappings.filter(m => m.conceptId !== conceptId), newMapping]);
  };

  return (
    <div className="exercise-concept-mapping">
      <div className="instruction">
        <p>Associez chaque concept à sa définition correspondante :</p>
      </div>
      
      <div className="concept-mapping-container">
        <div className="concepts-section">
          <h4>Concepts</h4>
          {exercise.concepts?.map((concept, index) => (
            <div key={concept.id || index} className="concept-item">
              {concept.content}
            </div>
          ))}
        </div>
        
        <div className="definitions-section">
          <h4>Définitions</h4>
          {exercise.definitions?.map((definition, index) => (
            <div key={definition.id || index} className="definition-item">
              {definition.content}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mappings-section">
        <h4>Vos associations :</h4>
        {exercise.concepts?.map((concept, index) => (
          <div key={concept.id || index} className="mapping-row">
            <span className="concept-label">{concept.content}</span>
            <span className="arrow">→</span>
            <select 
              value={mappings.find(m => m.conceptId === (concept.id || index))?.definitionId || ''}
              onChange={(e) => addMapping(concept.id || index, e.target.value)}
            >
              <option value="">Choisir une définition...</option>
              {exercise.definitions?.map((def, defIndex) => (
                <option key={def.id || defIndex} value={def.id || defIndex}>
                  {def.content}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CodeOutputExercise({ exercise, userAnswer, setUserAnswer, attempts = 0, maxAttempts = 3 }) {
  const [output, setOutput] = useState(userAnswer?.output || '');
  const [code, setCode] = useState(userAnswer?.code || '');
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    setUserAnswer({ output, code });
  }, [output, code, setUserAnswer]);

  const handleTest = async (userCode) => {
    // Simulation d'un test de prédiction de sortie
    return {
      success: true,
      message: 'Sortie prédite avec succès',
      details: {
        outputLength: output.length,
        codeLines: userCode.split('\n').length
      }
    };
  };

  return (
    <div className="exercise-code-output">
      <div className="instruction">
        <p>Prédisez la sortie de ce code :</p>
      </div>
      
      {/* Éditeur de code */}
      <CodeEditor
        exercise={exercise}
        userAnswer={code}
        setUserAnswer={setCode}
        onTest={handleTest}
        attempts={attempts}
        maxAttempts={maxAttempts}
        showSolution={showSolution}
        solution={exercise.solution}
        language={exercise.language || 'javascript'}
      />
      
      <div className="output-prediction">
        <label>Sortie prédite :</label>
        <textarea
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          placeholder="Écrivez la sortie exacte du programme..."
          rows={4}
        />
      </div>
      
      <div className="output-tips">
        <p>💡 Attention aux espaces, retours à la ligne et à la casse !</p>
      </div>
    </div>
  );
}

export function OptimizationExercise({ exercise, userAnswer, setUserAnswer, attempts = 0, maxAttempts = 3 }) {
  const [optimization, setOptimization] = useState(userAnswer?.optimization || '');
  const [improvements, setImprovements] = useState(userAnswer?.improvements || {});
  const [code, setCode] = useState(userAnswer?.code || '');
  const [showSolution, setShowSolution] = useState(attempts >= maxAttempts);

  useEffect(() => {
    setUserAnswer({ optimization, improvements, code });
  }, [optimization, improvements, code, setUserAnswer]);

  const toggleImprovement = (criterion) => {
    setImprovements({
      ...improvements,
      [criterion]: !improvements[criterion]
    });
  };

  const handleTest = async (userCode) => {
    // Simulation d'un test d'optimisation
    return {
      success: true,
      message: 'Code optimisé avec succès',
      details: {
        improvements: Object.keys(improvements).filter(k => improvements[k]).length,
        criteria: exercise.optimizationCriteria?.length || 0
      }
    };
  };

  return (
    <div className="exercise-optimization">
      <div className="instruction">
        <p>Optimisez le code suivant selon les critères demandés :</p>
      </div>
      
      {/* Éditeur de code */}
      <CodeEditor
        exercise={exercise}
        userAnswer={code}
        setUserAnswer={setCode}
        onTest={handleTest}
        attempts={attempts}
        maxAttempts={maxAttempts}
        showSolution={showSolution}
        solution={exercise.solution}
        language={exercise.language || 'javascript'}
      />
      
      <div className="optimization-section">
        <label>Code optimisé :</label>
        <textarea
          value={optimization}
          onChange={(e) => setOptimization(e.target.value)}
          placeholder="Écrivez votre version optimisée..."
          rows={8}
        />
      </div>
      
      {exercise.optimizationCriteria && (
        <div className="optimization-criteria">
          <h4>Améliorations apportées :</h4>
          {exercise.optimizationCriteria.map((criterion, index) => (
            <label key={index} className="criterion-checkbox">
              <input
                type="checkbox"
                checked={improvements[criterion] || false}
                onChange={() => toggleImprovement(criterion)}
              />
              {criterion}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
