import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({
  value = '',
  onChange,
  language = 'javascript',
  readOnly = false,
  height = '400px',
  theme = 'vs-dark',
  options = {},
  onMount = null,
  showToolbar = true,
  showLanguageSelector = false,
  onLanguageChange = null
}) => {
  const editorRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState('');

  const languageMap = {
    'javascript': { name: 'JavaScript', icon: '🟨' },
    'python': { name: 'Python', icon: '🐍' },
    'java': { name: 'Java', icon: '☕' },
    'cpp': { name: 'C++', icon: '⚡' },
    'c': { name: 'C', icon: '🔧' },
    'csharp': { name: 'C#', icon: '🔷' },
    'php': { name: 'PHP', icon: '🐘' },
    'ruby': { name: 'Ruby', icon: '💎' },
    'go': { name: 'Go', icon: '🐹' },
    'rust': { name: 'Rust', icon: '🦀' },
    'typescript': { name: 'TypeScript', icon: '🔷' },
    'html': { name: 'HTML', icon: '🌐' },
    'css': { name: 'CSS', icon: '🎨' },
    'sql': { name: 'SQL', icon: '🗄️' },
    'json': { name: 'JSON', icon: '📄' }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configuration Monaco
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    
    // Configuration du thème personnalisé
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
    
    if (onMount) {
      onMount(editor, monaco);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setOutput('');
    
    try {
      // Simulation d'exécution de code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOutput = `Exécution ${languageMap[selectedLanguage]?.name || selectedLanguage}:
${value}

Résultat: Code exécuté avec succès
Sortie: Hello World!
Temps d'exécution: 0.001s`;
      
      setOutput(mockOutput);
    } catch (error) {
      setOutput(`Erreur d'exécution: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const clearCode = () => {
    onChange('');
  };

  const addComment = () => {
    onChange(value + '\n// Votre code ici');
  };

  const formatCode = () => {
    // Simulation de formatage
    const formatted = value
      .split('\n')
      .map(line => line.trim())
      .join('\n');
    onChange(formatted);
  };

  const defaultOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: readOnly,
    cursorStyle: 'line',
    automaticLayout: true,
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible'
    },
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true
    },
    ...options
  };

  return (
    <div className="code-editor-container">
      <div className="editor-header">
        <div className="editor-info">
          {showLanguageSelector ? (
            <select 
              className="language-selector"
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={readOnly}
            >
              {Object.entries(languageMap).map(([key, lang]) => (
                <option key={key} value={key}>
                  {lang.icon} {lang.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="language-badge">
              {languageMap[selectedLanguage]?.icon} {languageMap[selectedLanguage]?.name || selectedLanguage.toUpperCase()}
            </span>
          )}
          {readOnly && <span className="read-only-badge">Lecture seule</span>}
        </div>
        
        <div className="editor-actions">
          <button 
            onClick={handleExecute}
            disabled={isExecuting || !value.trim()}
            className="execute-btn"
          >
            {isExecuting ? '⏳ Exécution...' : '▶️ Exécuter'}
          </button>
        </div>
      </div>
      
      <Editor
        height={height}
        language={selectedLanguage}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={defaultOptions}
        theme="codegenesis-dark"
      />
      
      {showToolbar && !readOnly && (
        <div className="editor-toolbar">
          <button 
            onClick={clearCode}
            className="toolbar-btn"
            title="Effacer le code"
          >
            🗑️ Effacer
          </button>
          <button 
            onClick={addComment}
            className="toolbar-btn"
            title="Ajouter un commentaire"
          >
            💬 Commentaire
          </button>
          <button 
            onClick={formatCode}
            className="toolbar-btn"
            title="Formater le code"
          >
            🎨 Formater
          </button>
        </div>
      )}

      {output && (
        <div className="execution-output">
          <div className="output-header">
            <span className="output-icon">📊</span>
            <span className="output-title">Résultat d'exécution</span>
          </div>
          <pre className="output-content">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;


