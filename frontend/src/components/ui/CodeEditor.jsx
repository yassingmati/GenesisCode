import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Paper,
  Group,
  Select,
  Badge,
  Button,
  ActionIcon,
  Text,
  Box,
  Code,
  Tooltip
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconTrash,
  IconMessageCircle,
  IconBrush,
  IconTerminal2,
  IconCode
} from '@tabler/icons-react';

const CodeEditor = ({
  value = '',
  onChange,
  language = 'javascript',
  readOnly = false,
  height = '400px',
  options = {},
  onMount = null,
  showToolbar = true,
  showHeader = true,
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
    <Paper withBorder radius="md" overflow="hidden" shadow="sm" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showHeader && (
        <Box p="xs" bg="dark.8" style={{ borderBottom: '1px solid #373A40' }}>
          <Group justify="space-between">
            <Group gap="xs">
              {showLanguageSelector ? (
                <Select
                  size="xs"
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  disabled={readOnly}
                  data={Object.entries(languageMap).map(([key, lang]) => ({
                    value: key,
                    label: `${lang.icon} ${lang.name}`
                  }))}
                  styles={{ input: { backgroundColor: '#2C2E33', color: '#fff', border: '1px solid #373A40' } }}
                />
              ) : (
                <Badge
                  variant="filled"
                  color="dark"
                  leftSection={<IconCode size={12} />}
                  size="lg"
                  radius="sm"
                >
                  {languageMap[selectedLanguage]?.name || selectedLanguage.toUpperCase()}
                </Badge>
              )}
              {readOnly && <Badge color="orange" variant="light">Lecture seule</Badge>}
            </Group>

            <Button
              size="xs"
              variant="gradient"
              gradient={{ from: 'green', to: 'teal' }}
              leftSection={<IconPlayerPlay size={14} />}
              onClick={handleExecute}
              disabled={isExecuting || !value.trim()}
              loading={isExecuting}
            >
              Exécuter
            </Button>
          </Group>
        </Box>
      )}

      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          language={selectedLanguage}
          value={value}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={defaultOptions}
          theme="codegenesis-dark"
        />
      </div>

      {showToolbar && !readOnly && (
        <Box p="xs" bg="dark.8" style={{ borderTop: '1px solid #373A40' }}>
          <Group gap="xs">
            <Tooltip label="Effacer le code">
              <Button size="xs" variant="subtle" color="gray" leftSection={<IconTrash size={14} />} onClick={clearCode}>
                Effacer
              </Button>
            </Tooltip>
            <Tooltip label="Ajouter un commentaire">
              <Button size="xs" variant="subtle" color="gray" leftSection={<IconMessageCircle size={14} />} onClick={addComment}>
                Commenter
              </Button>
            </Tooltip>
            <Tooltip label="Formater le code">
              <Button size="xs" variant="subtle" color="gray" leftSection={<IconBrush size={14} />} onClick={formatCode}>
                Formater
              </Button>
            </Tooltip>
          </Group>
        </Box>
      )}

      {output && (
        <Box p="md" bg="dark.9" style={{ borderTop: '1px solid #373A40' }}>
          <Group mb="xs" gap="xs">
            <IconTerminal2 size={16} color="var(--mantine-color-gray-5)" />
            <Text size="sm" fw={600} c="gray.3">Résultat d'exécution</Text>
          </Group>
          <Code block bg="dark.8" c="gray.3" style={{ whiteSpace: 'pre-wrap' }}>
            {output}
          </Code>
        </Box>
      )}
    </Paper>
  );
};

export default CodeEditor;
