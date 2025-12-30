import React, { useState, useCallback, useMemo } from 'react';
import ScratchEditor from '../ui/ScratchEditor';
import { Button, Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import { IconTerminal, IconCheck, IconX } from '@tabler/icons-react';
import { compareScratchXml } from '../../utils/scratchValidator';

const ScratchExercise = ({ exercise, onAnswerChange, disabled }) => {
    const [code, setCode] = useState('');
    const [xml, setXml] = useState(exercise.initialXml || '');
    const [output, setOutput] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);

    // Memoize validation rules for performance
    const rules = useMemo(() => exercise.validationRules || [], [exercise.validationRules]);

    const validateCode = useCallback((currentXml) => {
        if (!rules.length) return { passed: true, errors: [] };

        const errors = [];

        // Helper to count occurrences of a block type in XML
        const countBlocks = (xmlString, blockType) => {
            const regex = new RegExp(`type="${blockType}"`, 'g');
            return (xmlString.match(regex) || []).length;
        };

        rules.forEach(rule => {
            if (rule.type === 'mustUseBlock') {
                if (countBlocks(currentXml, rule.value) === 0) {
                    errors.push(rule.message || `Vous devez utiliser le bloc "${rule.value}"`);
                }
            } else if (rule.type === 'maxBlocks') {
                // Rudimentary total block count check
                const totalBlocks = (currentXml.match(/<block/g) || []).length;
                if (totalBlocks > parseInt(rule.value)) {
                    errors.push(rule.message || `Maximum ${rule.value} blocs autorisés (actuel: ${totalBlocks})`);
                }
            }
            // Add more rule types as needed (whitelist, blacklist, etc.)
        });

        return { passed: errors.length === 0, errors };
    }, [rules]);

    // Execute code and validate result
    const runCode = () => {
        setOutput([]);
        const logs = [];

        // 1. Static Validation (Rules Check)
        const { passed: rulesPassed, errors } = validateCode(xml);

        // 1.5 Semantic Solution Check (if solution exists and no rules failed yet)
        let semanticPassed = true;
        let semanticError = null;

        if (rulesPassed && exercise.solutions && exercise.solutions[0]) {
            // Assuming validationRules might NOT be enough if strict solution is provided
            // We check against the first solution string
            const comparison = compareScratchXml(xml, exercise.solutions[0]);
            if (!comparison.passed) {
                semanticPassed = false;
                semanticError = comparison.message;
                errors.push(semanticError);
            }
        }

        setValidationErrors(errors);

        if (!rulesPassed || !semanticPassed) {
            logs.push({ type: 'system-error', content: 'Validation échouée. Vérifiez les contraintes.' });
            if (semanticError) {
                logs.push({ type: 'error', content: semanticError });
            }
            setOutput(logs);
            onAnswerChange({ code, xml, output: logs, passed: false });
            return;
        }

        // 2. Worker Execution
        try {
            const worker = new Worker('/scratch-runner.worker.js');

            // Timeout to kill infinite loops
            const timeoutId = setTimeout(() => {
                worker.terminate();
                const timeoutLog = { type: 'error', content: 'Erreur: Temps d\'exécution dépassé (boucle infinie ?)' };
                const newLogs = [...logs, timeoutLog];
                setOutput(newLogs);
                onAnswerChange({ code, xml, output: newLogs, passed: false });
            }, 5000); // 5 seconds timeout

            worker.onmessage = (e) => {
                clearTimeout(timeoutId);
                const { success, logs: workerLogs } = e.data;

                // Merge logs if needed, normally workerLogs contains everything
                setOutput(workerLogs);

                const hasRuntimeError = workerLogs.some(l => l.type === 'error');
                const passed = success && !hasRuntimeError && rulesPassed;

                onAnswerChange({
                    code,
                    xml,
                    output: workerLogs,
                    passed
                });
                worker.terminate();
            };

            worker.onerror = (err) => {
                clearTimeout(timeoutId);
                const errorLog = { type: 'error', content: `Erreur Worker: ${err.message}` };
                const newLogs = [...logs, errorLog];
                setOutput(newLogs);
                onAnswerChange({ code, xml, output: newLogs, passed: false });
                worker.terminate();
            };

            worker.postMessage({ code });

        } catch (err) {
            const errorLog = { type: 'error', content: `Erreur d'initialisation: ${err.message}` };
            setOutput(prev => [...prev, errorLog]);
            onAnswerChange({ code, xml, output: [...logs, errorLog], passed: false });
        }
    };

    const handleCodeChange = useCallback((newCode) => {
        setCode(newCode);
    }, []);

    const handleXmlChange = useCallback((newXml) => {
        setXml(newXml);
        // Optimistic validation check just to clear errors if fixed? 
        // Or keep it on "Run" only to avoid flickering. 
        // Let's keep it on Run for now, but we sync the state.
        onAnswerChange && onAnswerChange({ code, xml: newXml });
    }, [code, onAnswerChange]);

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-200px)] min-h-[600px]">
            <div className="flex flex-col lg:flex-row gap-4 h-full">
                {/* Editor Area (Left/Top) */}
                <div className="flex-1 min-w-0 h-full bg-white rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
                    <ScratchEditor
                        initialXml={exercise.initialXml}
                        onCodeChange={handleCodeChange}
                        onXmlChange={handleXmlChange}
                        readOnly={disabled}
                    />
                </div>

                {/* Info & Output Area (Right/Bottom) */}
                <div className="w-full lg:w-96 flex flex-col gap-4">
                    {/* Instructions Card */}
                    <Card shadow="sm" className="flex-shrink-0">
                        <CardHeader className="font-bold text-sm uppercase text-default-500 bg-gray-50 border-b border-gray-100 py-3">
                            Mission
                        </CardHeader>
                        <CardBody className="p-4">
                            <p className="text-md font-medium text-gray-800 mb-2">{exercise.translations?.fr?.question || exercise.question}</p>
                            {exercise.hint && (
                                <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg flex gap-2 items-start mt-2">
                                    <span>💡</span>
                                    <span>{exercise.hint}</span>
                                </div>
                            )}

                            {/* Active Validation Rules Display */}
                            {rules.length > 0 && (
                                <div className="mt-4 border-t border-gray-100 pt-3">
                                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Contraintes</p>
                                    <ul className="space-y-1">
                                        {rules.map((rule, i) => {
                                            // Check status if we have validation errors
                                            const isFailed = validationErrors.some(e => e === rule.message || (rule.type === 'mustUseBlock' && e.includes(rule.value)));
                                            // Note: precise mapping of error-to-rule is tricky with simple strings. 
                                            // Optimized UX would assign IDs to rules.
                                            return (
                                                <li key={i} className={`text-xs flex items-center gap-2 ${isFailed && validationErrors.length > 0 ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                                                    {isFailed && validationErrors.length > 0 ? <IconX size={14} /> : <IconCheck size={14} className="text-gray-300" />}
                                                    {rule.message || (rule.type === 'mustUseBlock' ? `Utiliser: ${rule.value}` : rule.type)}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Console Output */}
                    <Card shadow="sm" className="flex-1 bg-[#1e1e1e] text-white overflow-hidden flex flex-col min-h-[200px]">
                        <CardHeader className="bg-[#2d2d2d] py-2 px-4 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-mono uppercase tracking-wider">
                                <IconTerminal size={14} />
                                Terminal
                            </div>
                            <Button
                                size="sm"
                                color="success"
                                onClick={runCode}
                                className="font-bold shadow-lg shadow-green-500/20"
                                isDisabled={disabled || !code}
                            >
                                ▶ Exécuter
                            </Button>
                        </CardHeader>

                        <CardBody className="font-mono text-xs overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-700">
                            {output.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-600 italic select-none">
                                    Prêt à exécuter...
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {output.map((line, i) => (
                                        <div
                                            key={i}
                                            className={`
                            px-4 py-1.5 border-b border-white/5 last:border-0 break-words
                            ${line.type === 'error' ? 'text-red-400 bg-red-900/10' : ''}
                            ${line.type === 'system-error' ? 'text-orange-400 bg-orange-900/10 font-bold' : ''}
                            ${line.type === 'log' ? 'text-gray-300' : ''}
                        `}
                                        >
                                            <span className="opacity-50 mr-2 select-none">&gt;</span>
                                            {line.content}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ScratchExercise;
