import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import * as Fr from 'blockly/msg/fr';
import { Paper, Box, Button, Group, Select, Badge } from '@nextui-org/react';
import { IconPlayerPlay, IconTrash, IconCode } from '@tabler/icons-react';

// Configuration de la langue française
Blockly.setLocale(Fr);

const ScratchEditor = ({
    initialXml,
    onCodeChange,
    onXmlChange,
    readOnly = false,
    toolbox = null
}) => {
    const blocklyDiv = useRef(null);
    const workspace = useRef(null);
    const [generatedCode, setGeneratedCode] = useState('');

    // Définition de la boîte à outils par défaut si non fournie
    const defaultToolbox = {
        kind: 'categoryToolbox',
        contents: [
            {
                kind: 'category',
                name: 'Logique',
                colour: '#5C81A6',
                contents: [
                    { kind: 'block', type: 'controls_if' },
                    { kind: 'block', type: 'logic_compare' },
                    { kind: 'block', type: 'logic_operation' },
                    { kind: 'block', type: 'logic_negate' },
                    { kind: 'block', type: 'logic_boolean' },
                ],
            },
            {
                kind: 'category',
                name: 'Boucles',
                colour: '#5CA65C',
                contents: [
                    { kind: 'block', type: 'controls_repeat_ext' },
                    { kind: 'block', type: 'controls_whileUntil' },
                    { kind: 'block', type: 'controls_for' },
                ],
            },
            {
                kind: 'category',
                name: 'Maths',
                colour: '#5C68A6',
                contents: [
                    { kind: 'block', type: 'math_number' },
                    { kind: 'block', type: 'math_arithmetic' },
                    { kind: 'block', type: 'math_single' },
                ],
            },
            {
                kind: 'category',
                name: 'Texte',
                colour: '#5CA699',
                contents: [
                    { kind: 'block', type: 'text' },
                    { kind: 'block', type: 'text_print' },
                ],
            },
            {
                kind: 'category',
                name: 'Variables',
                colour: '#A65C81',
                custom: 'VARIABLE',
            },
        ],
    };

    useEffect(() => {
        if (!blocklyDiv.current) return;

        // Injection de Blockly
        workspace.current = Blockly.inject(blocklyDiv.current, {
            toolbox: toolbox || defaultToolbox,
            readOnly: readOnly,
            scrollbars: true,
            move: {
                scrollbars: true,
                drag: true,
                wheel: true,
            },
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2,
            },
            grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true,
            },
            trashcan: true,
        });

        // Chargement du code initial si présent
        if (initialXml) {
            try {
                const xml = Blockly.utils.xml.textToDom(initialXml);
                Blockly.Xml.domToWorkspace(xml, workspace.current);
            } catch (e) {
                console.error('Erreur lors du chargement du XML initial:', e);
            }
        }

        // Écouteur de changements
        const changeListener = () => {
            if (!workspace.current) return;

            // Génération du code JavaScript
            const code = javascriptGenerator.workspaceToCode(workspace.current);
            setGeneratedCode(code);
            if (onCodeChange) onCodeChange(code);

            // Sauvegarde de l'état XML
            const xml = Blockly.Xml.workspaceToDom(workspace.current);
            const xmlText = Blockly.Xml.domToText(xml);
            if (onXmlChange) onXmlChange(xmlText);
        };

        workspace.current.addChangeListener(changeListener);

        // Nettoyage
        return () => {
            if (workspace.current) {
                workspace.current.dispose();
            }
        };
    }, [readOnly, toolbox]); // Re-render si ces props changent

    // Redimensionnement automatique
    useEffect(() => {
        const handleResize = () => {
            if (workspace.current) {
                Blockly.svgResize(workspace.current);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClear = () => {
        if (workspace.current) {
            workspace.current.clear();
        }
    };

    return (
        <div className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
            <div className="flex justify-between items-center p-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded flex items-center">
                        <IconCode size={14} className="mr-1" />
                        Scratch Editor
                    </span>
                </div>
                <div className="flex gap-2">
                    {!readOnly && (
                        <button
                            className="flex items-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                            onClick={handleClear}
                        >
                            <IconTrash size={14} className="mr-1" />
                            Effacer
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-grow relative" style={{ minHeight: '500px' }}>
                <div
                    ref={blocklyDiv}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
            </div>
        </div>
    );
};

export default ScratchEditor;
