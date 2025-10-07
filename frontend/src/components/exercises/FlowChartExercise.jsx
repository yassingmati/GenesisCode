import React, { useState } from 'react';

const FlowChartExercise = ({ exercise, userAnswer, onAnswerChange }) => {
  const [flowChart, setFlowChart] = useState(userAnswer?.chart || {});
  const [currentNode, setCurrentNode] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getNodes = () => {
    return exercise.flowChartNodes || [];
  };

  const getConnections = () => {
    return exercise.flowChartConnections || [];
  };

  const getExpectedChart = () => {
    return exercise.expectedChart || {};
  };

  const getTestCases = () => {
    return exercise.testCases || [];
  };

  const handleNodeAdd = (node) => {
    const newNode = {
      ...node,
      id: Date.now(),
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      connections: []
    };
    
    const newChart = {
      ...flowChart,
      nodes: [...(flowChart.nodes || []), newNode]
    };
    
    setFlowChart(newChart);
    onAnswerChange({ chart: newChart });
  };

  const handleNodeRemove = (nodeId) => {
    const newChart = {
      ...flowChart,
      nodes: (flowChart.nodes || []).filter(node => node.id !== nodeId),
      connections: (flowChart.connections || []).filter(conn => 
        conn.from !== nodeId && conn.to !== nodeId
      )
    };
    
    setFlowChart(newChart);
    onAnswerChange({ chart: newChart });
  };

  const handleNodeUpdate = (nodeId, updates) => {
    const newChart = {
      ...flowChart,
      nodes: (flowChart.nodes || []).map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    };
    
    setFlowChart(newChart);
    onAnswerChange({ chart: newChart });
  };

  const handleConnectionAdd = (fromNodeId, toNodeId) => {
    const newConnection = {
      id: Date.now(),
      from: fromNodeId,
      to: toNodeId,
      label: ''
    };
    
    const newChart = {
      ...flowChart,
      connections: [...(flowChart.connections || []), newConnection]
    };
    
    setFlowChart(newChart);
    onAnswerChange({ chart: newChart });
  };

  const handleConnectionRemove = (connectionId) => {
    const newChart = {
      ...flowChart,
      connections: (flowChart.connections || []).filter(conn => conn.id !== connectionId)
    };
    
    setFlowChart(newChart);
    onAnswerChange({ chart: newChart });
  };

  const handleNodeSelect = (node) => {
    setCurrentNode(node);
  };

  const handleReset = () => {
    setFlowChart({});
    setCurrentNode(null);
    setValidationResult(null);
    onAnswerChange({ chart: {} });
  };

  const handleAutoComplete = () => {
    const expectedChart = getExpectedChart();
    setFlowChart(expectedChart);
    onAnswerChange({ chart: expectedChart });
  };

  const handleValidate = async () => {
    setIsValidating(true);
    
    try {
      // Simulation de validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expectedChart = getExpectedChart();
      const userNodes = flowChart.nodes || [];
      const expectedNodes = expectedChart.nodes || [];
      
      const isCorrect = JSON.stringify(userNodes.map(n => n.id).sort()) === 
                        JSON.stringify(expectedNodes.map(n => n.id).sort());
      
      const result = {
        isCorrect,
        score: isCorrect ? 100 : 0,
        message: isCorrect ? 'Organigramme correct !' : 'L\'organigramme contient des erreurs.',
        details: {
          userChart: flowChart,
          expectedChart,
          differences: isCorrect ? [] : ['Des différences ont été détectées']
        }
      };
      
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const getChartStats = () => {
    const nodes = flowChart.nodes || [];
    const connections = flowChart.connections || [];
    const totalNodes = getNodes().length;
    const completionRate = totalNodes > 0 ? (nodes.length / totalNodes) * 100 : 0;
    
    return {
      totalNodes,
      currentNodes: nodes.length,
      connections: connections.length,
      completionRate: Math.round(completionRate)
    };
  };

  const getNodeType = (node) => {
    return node.type || 'unknown';
  };

  const getNodeIcon = (type) => {
    const icons = {
      'start': '🚀',
      'end': '🏁',
      'process': '⚡',
      'decision': '❓',
      'input': '📥',
      'output': '📤',
      'loop': '🔄',
      'unknown': '❓'
    };
    return icons[type] || icons.unknown;
  };

  const getNodeColor = (type) => {
    const colors = {
      'start': '#4CAF50',
      'end': '#F44336',
      'process': '#2196F3',
      'decision': '#FF9800',
      'input': '#9C27B0',
      'output': '#00BCD4',
      'loop': '#E91E63',
      'unknown': '#9E9E9E'
    };
    return colors[type] || colors.unknown;
  };

  const getNodeDescription = (node) => {
    return node.description || node.content || 'Description non disponible';
  };

  const getNodeConnections = (nodeId) => {
    return (flowChart.connections || []).filter(conn => 
      conn.from === nodeId || conn.to === nodeId
    );
  };

  const getChartQuality = () => {
    const stats = getChartStats();
    const nodes = flowChart.nodes || [];
    const connections = flowChart.connections || [];
    
    let qualityScore = 0;
    let feedback = [];
    
    // Vérification de la complétude
    if (stats.completionRate >= 80) {
      qualityScore += 30;
      feedback.push('✅ Organigramme complet');
    } else {
      feedback.push('⚠️ Organigramme incomplet');
    }
    
    // Vérification de la diversité
    const types = [...new Set(nodes.map(node => node.type))];
    if (types.length >= 3) {
      qualityScore += 25;
      feedback.push('✅ Diversité des nœuds');
    } else {
      feedback.push('⚠️ Peu de diversité');
    }
    
    // Vérification de la logique
    if (nodes.length > 0) {
      qualityScore += 25;
      feedback.push('✅ Logique présente');
    } else {
      feedback.push('❌ Aucune logique');
    }
    
    // Vérification de la cohérence
    if (connections.length > 0) {
      qualityScore += 20;
      feedback.push('✅ Connexions présentes');
    } else {
      feedback.push('⚠️ Aucune connexion');
    }
    
    return {
      score: qualityScore,
      feedback,
      level: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'bon' : qualityScore >= 40 ? 'moyen' : 'faible'
    };
  };

  const getChartVisualization = () => {
    const nodes = flowChart.nodes || [];
    const connections = flowChart.connections || [];
    
    return {
      nodes,
      connections,
      visualization: 'Visualisation de l\'organigramme...'
    };
  };

  const nodes = getNodes();
  const connections = getConnections();
  const expectedChart = getExpectedChart();
  const testCases = getTestCases();
  const stats = getChartStats();
  const chartQuality = getChartQuality();
  const chartVisualization = getChartVisualization();

  return (
    <div className="flow-chart-exercise">
      {/* En-tête */}
      <div className="exercise-header">
        <div className="header-info">
          <h4>📊 Organigramme</h4>
          <div className="chart-stats">
            <span className="nodes-count">
              {stats.currentNodes}/{stats.totalNodes} nœuds
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
            ▶️ Complétion automatique
          </button>
        </div>
      </div>

      <div className="flow-chart-layout">
        {/* Nœuds disponibles */}
        <div className="available-nodes-section">
          <div className="section-header">
            <h5>📦 Nœuds disponibles</h5>
            <div className="nodes-info">
              <span className="nodes-count">
                {nodes.length} nœud{nodes.length > 1 ? 's' : ''} disponible{nodes.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="nodes-content">
            {nodes.length === 0 ? (
              <div className="empty-nodes">
                <p>Aucun nœud disponible</p>
              </div>
            ) : (
              <div className="nodes-grid">
                {nodes.map((node, index) => {
                  const isUsed = (flowChart.nodes || []).some(n => n.id === node.id);
                  
                  return (
                    <div
                      key={node.id}
                      className={`flow-node ${getNodeType(node)} ${isUsed ? 'used' : 'available'}`}
                      onClick={() => !isUsed && handleNodeAdd(node)}
                      style={{ borderColor: getNodeColor(getNodeType(node)) }}
                    >
                      <div className="node-header">
                        <span className="node-icon">{getNodeIcon(getNodeType(node))}</span>
                        <span className="node-type">{getNodeType(node)}</span>
                      </div>
                      
                      <div className="node-content">
                        <div className="node-name">{node.name}</div>
                        <div className="node-description">
                          {getNodeDescription(node)}
                        </div>
                      </div>
                      
                      <div className="node-status">
                        {isUsed ? (
                          <span className="used-badge">✅ Utilisé</span>
                        ) : (
                          <span className="available-badge">🔄 Disponible</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Zone de travail */}
        <div className="workspace-section">
          <div className="section-header">
            <h5>🎯 Zone de travail</h5>
            <div className="workspace-info">
              <span className="workspace-nodes">
                {(flowChart.nodes || []).length} nœud{(flowChart.nodes || []).length > 1 ? 's' : ''} placé{(flowChart.nodes || []).length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="workspace-content">
            {(flowChart.nodes || []).length === 0 ? (
              <div className="empty-workspace">
                <p>Aucun nœud placé</p>
                <p>Cliquez sur des nœuds pour commencer</p>
              </div>
            ) : (
              <div className="workspace-canvas">
                {(flowChart.nodes || []).map((node, index) => (
                  <div
                    key={node.id}
                    className={`workspace-node ${getNodeType(node)} ${currentNode?.id === node.id ? 'selected' : ''}`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      borderColor: getNodeColor(getNodeType(node))
                    }}
                    onClick={() => handleNodeSelect(node)}
                  >
                    <div className="node-header">
                      <span className="node-icon">{getNodeIcon(getNodeType(node))}</span>
                      <span className="node-name">{node.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNodeRemove(node.id);
                        }}
                        className="remove-node-btn"
                        title="Retirer ce nœud"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="node-content">
                      <div className="node-description">
                        {getNodeDescription(node)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nœud sélectionné */}
        {currentNode && (
          <div className="selected-node-section">
            <div className="section-header">
              <h5>🎯 Nœud sélectionné</h5>
              <div className="node-info">
                <span className="node-type">{getNodeType(currentNode)}</span>
              </div>
            </div>
            
            <div className="node-content">
              <div className="node-details">
                <h6>{currentNode.name}</h6>
                <p>{getNodeDescription(currentNode)}</p>
              </div>
              
              <div className="node-connections">
                <h6>Connexions :</h6>
                <div className="connections-list">
                  {getNodeConnections(currentNode.id).map((conn, index) => (
                    <div key={index} className="connection-item">
                      <span className="connection-label">{conn.label || 'Sans label'}</span>
                      <button
                        onClick={() => handleConnectionRemove(conn.id)}
                        className="remove-connection-btn"
                        title="Supprimer cette connexion"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Qualité de l'organigramme */}
        <div className="quality-section">
          <div className="section-header">
            <h5>📊 Qualité de l'organigramme</h5>
            <div className="quality-info">
              <span className="quality-score">
                Score: {chartQuality.score}%
              </span>
            </div>
          </div>
          
          <div className="quality-content">
            <div className="quality-feedback">
              {chartQuality.feedback.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  {feedback}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visualisation */}
        <div className="visualization-section">
          <div className="section-header">
            <h5>👁️ Visualisation</h5>
            <div className="visualization-info">
              <span className="visualization-status">En cours...</span>
            </div>
          </div>
          
          <div className="visualization-content">
            <div className="visualization-output">
              <pre className="visualization-text">{chartVisualization.visualization}</pre>
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
              disabled={isValidating || (flowChart.nodes || []).length === 0}
            >
              {isValidating ? '⏳ Validation...' : '✅ Valider l\'organigramme'}
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
                    <h6>Votre organigramme :</h6>
                    <div className="chart-comparison">
                      {(validationResult.details.userChart.nodes || []).map((node, index) => (
                        <div key={index} className="chart-item">
                          <span className="node-position">{index + 1}.</span>
                          <span className="node-name">{node.name}</span>
                          <span className="node-type">({getNodeType(node)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h6>Organigramme attendu :</h6>
                    <div className="chart-comparison">
                      {(validationResult.details.expectedChart.nodes || []).map((node, index) => (
                        <div key={index} className="chart-item">
                          <span className="node-position">{index + 1}.</span>
                          <span className="node-name">{node.name}</span>
                          <span className="node-type">({getNodeType(node)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
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
      <div className="flow-chart-instructions">
        <h5>📋 Instructions</h5>
        <div className="instructions-content">
          <p>
            <strong>Objectif :</strong> Créez un organigramme en assemblant des nœuds et des connexions.
          </p>
          <p>
            <strong>Comment procéder :</strong>
          </p>
          <ul>
            <li>Cliquez sur les nœuds disponibles</li>
            <li>Placez-les dans la zone de travail</li>
            <li>Connectez les nœuds appropriés</li>
            <li>Vérifiez la logique du flux</li>
          </ul>
          <p>
            <strong>Types de nœuds :</strong>
          </p>
          <ul>
            <li>🚀 <strong>Début :</strong> Point de départ du processus</li>
            <li>🏁 <strong>Fin :</strong> Point d'arrivée du processus</li>
            <li>⚡ <strong>Traitement :</strong> Opérations et calculs</li>
            <li>❓ <strong>Décision :</strong> Prise de décisions conditionnelles</li>
            <li>📥 <strong>Entrée :</strong> Acquisition des données</li>
            <li>📤 <strong>Sortie :</strong> Affichage des résultats</li>
            <li>🔄 <strong>Boucle :</strong> Répétition d'actions</li>
          </ul>
          <p>
            <strong>Conseils de création :</strong>
          </p>
          <ul>
            <li>Commencez par le nœud de début</li>
            <li>Ajoutez la logique de traitement</li>
            <li>Incluez les décisions et boucles</li>
            <li>Terminez par le nœud de fin</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FlowChartExercise;