import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import CodeEditor from '../ui/CodeEditor';
import {
    IconRefresh,
    IconEye,
    IconPlus,
    IconTrash,
    IconPlayerPlay
} from '@tabler/icons-react';
import {
    Button,
    Tooltip,
    Group,
    Text,
    ActionIcon,
    Modal,
    TextInput,
    Select
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 80vh;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
`;

const Workspace = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const EditorPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  border-right: 1px solid #333;
`;

const EditorWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const PreviewPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const PaneHeader = styled.div`
  padding: 0.5rem 1rem;
  background: #25262b;
  border-bottom: 1px solid #373a40;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
`;

const FileTabs = styled.div`
  display: flex;
  background: #252526;
  overflow-x: auto;
  border-bottom: 1px solid #333;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #444;
  }
`;

const FileTab = styled.button`
  background: ${props => props.active ? '#1e1e1e' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#969696'};
  border: none;
  border-right: 1px solid #333;
  border-top: ${props => props.active ? '1px solid #007fd4' : '1px solid transparent'};
  padding: 8px 12px;
  font-size: 13px;
  font-family: 'Segoe UI', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: space-between;
  
  &:hover {
    background: ${props => props.active ? '#1e1e1e' : '#2d2d2d'};
  }
`;

const PreviewFrame = styled.iframe`
  flex: 1;
  border: none;
  background: white;
  width: 100%;
  height: 100%;
`;

// Helper to get icon color
const getIconColor = (name) => {
    if (name.endsWith('.html')) return '#e34c26';
    if (name.endsWith('.css')) return '#264de4';
    if (name.endsWith('.js')) return '#f7df1e';
    return '#ccc';
};

// --- Component Definition ---

const WebProjectExercise = ({
    exercise,
    userAnswer,
    onAnswerChange,
    disabled
}) => {
    const [files, setFiles] = useState([]);
    const [activeFileIndex, setActiveFileIndex] = useState(0);
    const [previewKey, setPreviewKey] = useState(0);
    const [previewContent, setPreviewContent] = useState('');
    const [opened, { open, close }] = useDisclosure(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFileType, setNewFileType] = useState('html');
    const [showSolution, setShowSolution] = useState(false); // Toggle between preview and solution image

    // Initialisation des fichiers
    useEffect(() => {
        console.log("WebProject Initialization. Exercise Files:", exercise.files);
        if (userAnswer && userAnswer.files) {
            setFiles(userAnswer.files);
        } else if (exercise.files && exercise.files.length > 0) {
            const initialFiles = JSON.parse(JSON.stringify(exercise.files));
            setFiles(initialFiles);
            // Initial run to show something
            updatePreview(initialFiles);
        } else {
            // Fallback si pas de fichiers définis
            const defaults = [
                { name: 'index.html', content: '<!-- Votre HTML ici -->\n<h1>Hello World</h1>', language: 'html' },
                { name: 'style.css', content: '/* Votre CSS ici */\nh1 { color: blue; }', language: 'css' }
            ];
            setFiles(defaults);
            updatePreview(defaults);
        }
    }, [exercise]);

    // Function to generate preview content from files
    const updatePreview = (currentFiles) => {
        const htmlFile = currentFiles.find(f => f.name.endsWith('.html')) || { content: '' };
        const cssFiles = currentFiles.filter(f => f.name.endsWith('.css'));
        const jsFiles = currentFiles.filter(f => f.name.endsWith('.js'));

        // Combine all CSS
        const combinedCss = cssFiles.map(f => f.content).join('\n');

        // Combine all JS
        const combinedJs = jsFiles.map(f => f.content).join('\n');

        const source = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            ${combinedCss}
          </style>
        </head>
        <body>
          ${htmlFile.content}
          <script>
            try {
              ${combinedJs}
            } catch (error) {
              console.error(error);
            }
          </script>
        </body>
      </html>
    `;
        setPreviewContent(source);
        setPreviewKey(prev => prev + 1);
    };


    const handleCodeChange = (newCode) => {
        const updatedFiles = [...files];
        updatedFiles[activeFileIndex].content = newCode;
        setFiles(updatedFiles);
        // Only propagate files on keystroke, not screenshot (too heavy)
        onAnswerChange({ files: updatedFiles });
    };

    // Trigger capture after preview update (with delay to ensure render)
    // No screenshot capture needed for keyword validation
    useEffect(() => {
        // Just trigger visual update if needed, but no screenshot
    }, [previewKey]);

    const handleAddFile = () => {
        if (!newFileName) return;
        const extension = newFileType === 'javascript' ? 'js' : newFileType;
        const name = newFileName.endsWith(`.${extension}`) ? newFileName : `${newFileName}.${extension}`;

        if (files.some(f => f.name === name)) {
            alert('Un fichier avec ce nom existe déjà');
            return;
        }

        const newFile = {
            name,
            content: '',
            language: newFileType
        };

        const updatedFiles = [...files, newFile];
        setFiles(updatedFiles);
        onAnswerChange({ files: updatedFiles });
        setActiveFileIndex(updatedFiles.length - 1);
        setNewFileName('');
        close();
    };

    const handleDeleteFile = (e, index) => {
        e.stopPropagation();
        if (files.length <= 1) {
            alert('Vous devez garder au moins un fichier');
            return;
        }
        if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tout le code ?')) {
            const updatedFiles = files.filter((_, i) => i !== index);
            setFiles(updatedFiles);
            onAnswerChange({ files: updatedFiles });
            if (activeFileIndex >= index && activeFileIndex > 0) {
                setActiveFileIndex(activeFileIndex - 1);
            }
        }
    };

    const runCode = () => {
        updatePreview(files);
    };

    const handleEditorDidMount = (editor, monaco) => {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            runCode();
        });
    };

    const activeFile = files[activeFileIndex] || {};

    return (
        <Container>
            <Workspace>
                <EditorPane>
                    <FileTabs>
                        {files.map((file, index) => (
                            <FileTab
                                key={index}
                                active={index === activeFileIndex}
                                onClick={() => setActiveFileIndex(index)}
                                name={file.name}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{
                                        color: getIconColor(file.name),
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}>
                                        {file.name.endsWith('.html') ? '<>' : file.name.endsWith('.css') ? '#' : 'JS'}
                                    </span>
                                    {file.name}
                                </div>
                                {!file.readOnly && (
                                    <ActionIcon
                                        size="xs"
                                        color="red"
                                        variant="transparent"
                                        onClick={(e) => handleDeleteFile(e, index)}
                                        style={{ marginLeft: 4, opacity: 0.6 }}
                                    >
                                        <IconTrash size={12} />
                                    </ActionIcon>
                                )}
                            </FileTab>
                        ))}
                        <ActionIcon
                            variant="filled"
                            color="dark"
                            size="sm"
                            onClick={open}
                            style={{ margin: '4px', alignSelf: 'center' }}
                        >
                            <IconPlus size={14} />
                        </ActionIcon>
                    </FileTabs>

                    <EditorWrapper>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                            <CodeEditor
                                value={activeFile.content || ''}
                                onChange={handleCodeChange}
                                language={activeFile.language || 'html'}
                                height="100%"
                                readOnly={disabled || activeFile.readOnly}
                                showToolbar={false}
                                showHeader={false}
                                theme="vs-dark"
                                onMount={handleEditorDidMount}
                            />
                        </div>
                    </EditorWrapper>
                </EditorPane>

                <PreviewPane>
                    <PaneHeader>
                        <Group gap="xs">
                            <IconEye size={16} />
                            <Text size="sm" fw={600}>
                                {showSolution ? 'Résultat attendu' : 'Résultat visuel'}
                            </Text>
                        </Group>
                        <Group gap="xs">
                            {exercise.solutionImage && (
                                <Tooltip label={showSolution ? "Voir mon code" : "Voir la solution attendue"}>
                                    <ActionIcon
                                        variant={showSolution ? "filled" : "light"}
                                        color="blue"
                                        onClick={() => setShowSolution(!showSolution)}
                                    >
                                        <IconEye size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                            <Tooltip label="Exécuter le code (Ctrl+Enter)">
                                <Button
                                    size="xs"
                                    variant="filled"
                                    color="green"
                                    onClick={runCode}
                                    leftSection={<IconPlayerPlay size={14} />}
                                    style={{ height: '28px', padding: '0 12px' }}
                                >
                                    Exécuter
                                </Button>
                            </Tooltip>
                        </Group>
                    </PaneHeader>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <PreviewFrame
                            id="preview-frame"
                            key={previewKey}
                            srcDoc={previewContent}
                            title="Preview"
                            sandbox="allow-scripts allow-same-origin"
                        />
                        {showSolution && exercise.solutionImage && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'white',
                                backgroundImage: `url(${exercise.solutionImage})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                zIndex: 10
                            }} />
                        )}
                    </div>
                </PreviewPane>
            </Workspace>

            <Modal opened={opened} onClose={close} title="Nouveau fichier" size="sm" centered>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <TextInput
                        label="Nom du fichier"
                        placeholder="exemple"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.currentTarget.value)}
                        data-autofocus
                    />
                    <Select
                        label="Type"
                        data={[
                            { value: 'html', label: 'HTML (.html)' },
                            { value: 'css', label: 'CSS (.css)' },
                            { value: 'javascript', label: 'JavaScript (.js)' }
                        ]}
                        value={newFileType}
                        onChange={setNewFileType}
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={close}>Annuler</Button>
                        <Button onClick={handleAddFile}>Créer</Button>
                    </Group>
                </div>
            </Modal>
        </Container>
    );
};

export default WebProjectExercise;
