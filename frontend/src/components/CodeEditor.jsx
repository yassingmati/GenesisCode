import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import './CodeEditor.css';

const CodeEditor = ({ 
  exercise, 
  userAnswer, 
  setUserAnswer, 
  onTest, 
  attempts = 0, 
  maxAttempts = 3,
  showSolution = false,
  solution = null,
  language = 'javascript'
}) => {
  const [code, setCode] = useState(userAnswer || '');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(language || exercise?.language || 'javascript');
  const [isExecuting, setIsExecuting] = useState(false);
  const editorRef = useRef(null);

  // Mapper les langages
  const getMonacoLanguage = (lang) => {
    const languageMap = {
      'javascript': 'javascript',
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'csharp': 'csharp',
      'php': 'php',
      'ruby': 'ruby',
      'go': 'go',
      'rust': 'rust',
      'typescript': 'typescript',
      'html': 'html',
      'css': 'css',
      'sql': 'sql',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'markdown': 'markdown',
      'pseudocode': 'plaintext',
      'scratch': 'plaintext'
    };
    return languageMap[lang?.toLowerCase()] || 'javascript';
  };

  const monacoLanguage = getMonacoLanguage(selectedLanguage);

  useEffect(() => {
    setUserAnswer(code);
  }, [code, setUserAnswer]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configuration du thème et options
    monaco.editor.defineTheme('codegenesis-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' }
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41'
      }
    });

    monaco.editor.setTheme('codegenesis-dark');
  };

  const handleTest = async () => {
    if (!onTest) return;
    
    setIsTesting(true);
    try {
      const result = await onTest(code);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erreur lors du test: ' + error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleExecuteClick = async () => {
    setIsExecuting(true);
    setExecutionOutput('');
    
    try {
      // Simulation d'exécution de code
      const output = await simulateCodeExecution(code, selectedLanguage);
      setExecutionOutput(output);
    } catch (error) {
      setExecutionOutput(`Erreur d'exécution: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const simulateCodeExecution = async (code, lang) => {
    // Simulation d'exécution selon le langage
    return new Promise((resolve) => {
      setTimeout(() => {
        switch (lang.toLowerCase()) {
          case 'javascript':
            resolve(`Exécution JavaScript:\n${code}\n\nRésultat: Code exécuté avec succès`);
            break;
          case 'python':
            resolve(`Exécution Python:\n${code}\n\nRésultat: Script Python exécuté`);
            break;
          case 'java':
            resolve(`Exécution Java:\n${code}\n\nRésultat: Programme Java compilé et exécuté`);
            break;
          default:
            resolve(`Exécution ${lang}:\n${code}\n\nRésultat: Code exécuté`);
        }
      }, 1000);
    });
  };

  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    // Optionnel: réinitialiser le code selon le nouveau langage
    if (newLanguage !== selectedLanguage) {
      setCode(''); // Ou charger un template selon le langage
    }
  };

  const getLanguageIcon = (lang) => {
    const icons = {
      'javascript': '🟨',
      'python': '🐍',
      'java': '☕',
      'cpp': '⚡',
      'c': '⚡',
      'csharp': '🔷',
      'php': '🐘',
      'ruby': '💎',
      'go': '🐹',
      'rust': '🦀',
      'typescript': '🔷',
      'html': '🌐',
      'css': '🎨',
      'sql': '🗄️',
      'json': '📄',
      'xml': '📄',
      'yaml': '📄',
      'markdown': '📝'
    };
    return icons[lang?.toLowerCase()] || '📝';
  };

  const getLanguageName = (lang) => {
    const names = {
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'php': 'PHP',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'typescript': 'TypeScript',
      'html': 'HTML',
      'css': 'CSS',
      'sql': 'SQL',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'markdown': 'Markdown',
      'pseudocode': 'Pseudo-code',
      'scratch': 'Scratch'
    };
    return names[lang?.toLowerCase()] || 'Code';
  };

  return (
    <div className="code-editor-container">
      {/* Header de l'éditeur */}
      <div className="code-editor-header">
        <div className="editor-info">
          <span className="language-icon">{getLanguageIcon(monacoLanguage)}</span>
          <span className="language-name">{getLanguageName(monacoLanguage)}</span>
          {exercise?.type && (
            <span className="exercise-type">{exercise.type}</span>
          )}
        </div>
        
        <div className="editor-actions">
          {/* Sélecteur de langage */}
          <select 
            className="language-selector"
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={showSolution}
          >
            <option value="javascript">🟨 JavaScript</option>
            <option value="python">🐍 Python</option>
            <option value="java">☕ Java</option>
            <option value="cpp">⚡ C++</option>
            <option value="c">🔧 C</option>
            <option value="csharp">🔷 C#</option>
            <option value="php">🐘 PHP</option>
            <option value="ruby">💎 Ruby</option>
            <option value="go">🐹 Go</option>
            <option value="rust">🦀 Rust</option>
            <option value="typescript">🔷 TypeScript</option>
          </select>

          {attempts > 0 && (
            <span className="attempts-info">
              Tentatives: {attempts}/{maxAttempts}
            </span>
          )}
          
          {/* Bouton d'exécution */}
          <button 
            className="execute-button"
            onClick={handleExecuteClick}
            disabled={isExecuting || !code.trim() || showSolution}
          >
            {isExecuting ? '⏳ Exécution...' : '▶️ Exécuter'}
          </button>
          
          {onTest && (
            <button 
              className="test-button"
              onClick={handleTest}
              disabled={isTesting || !code.trim()}
            >
              {isTesting ? '⏳ Test...' : '🧪 Tester'}
            </button>
          )}
        </div>
      </div>

      {/* Zone d'édition */}
      <div className="editor-wrapper">
        <Editor
          height="400px"
          language={monacoLanguage}
          value={code}
          onChange={setCode}
          onMount={handleEditorDidMount}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: showSolution,
            cursorStyle: 'line',
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            folding: true,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
        />
      </div>

      {/* Résultat des tests */}
      {testResult && (
        <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
          <div className="test-result-header">
            <span className="test-icon">
              {testResult.success ? '✅' : '❌'}
            </span>
            <span className="test-status">
              {testResult.success ? 'Test réussi' : 'Test échoué'}
            </span>
          </div>
          {testResult.message && (
            <div className="test-message">{testResult.message}</div>
          )}
          {testResult.details && (
            <div className="test-details">
              <pre>{JSON.stringify(testResult.details, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Résultats d'exécution */}
      {executionOutput && (
        <div className="execution-output-section">
          <div className="execution-header">
            <span className="execution-icon">📊</span>
            <span className="execution-title">Résultat d'exécution</span>
          </div>
          <div className="execution-content">
            <pre className="execution-output">{executionOutput}</pre>
          </div>
        </div>
      )}

      {/* Solution après 3 tentatives */}
      {showSolution && solution && (
        <div className="solution-section">
          <div className="solution-header">
            <span className="solution-icon">💡</span>
            <span className="solution-title">Solution</span>
          </div>
          <div className="solution-content">
            <pre>{solution}</pre>
          </div>
        </div>
      )}

      {/* Template de code si disponible */}
      {exercise?.codeSnippet && !showSolution && (
        <div className="code-template-section">
          <div className="template-header">
            <span className="template-icon">📝</span>
            <span className="template-title">Template de départ</span>
          </div>
          <div className="template-content">
            <pre>{exercise.codeSnippet}</pre>
          </div>
        </div>
      )}

      {/* Cas de test si disponibles */}
      {exercise?.testCases && exercise.testCases.length > 0 && (
        <div className="test-cases-section">
          <div className="test-cases-header">
            <span className="test-cases-icon">🧪</span>
            <span className="test-cases-title">
              Cas de test ({exercise.testCases.filter(tc => tc.public).length} publics)
            </span>
          </div>
          <div className="test-cases-content">
            {exercise.testCases.filter(tc => tc.public).map((tc, i) => (
              <div key={i} className="test-case">
                <div className="test-case-io">
                  <div className="test-input">
                    <strong>Entrée:</strong> {JSON.stringify(tc.input)}
                  </div>
                  <div className="test-expected">
                    <strong>Sortie attendue:</strong> {JSON.stringify(tc.expected)}
                  </div>
                  {tc.points && (
                    <div className="test-points">{tc.points} points</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
