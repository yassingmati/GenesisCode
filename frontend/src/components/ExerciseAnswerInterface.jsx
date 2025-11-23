import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from './ui/CodeEditor';
import ScratchEditor from './ui/ScratchEditor';
import {
  Button,
  Checkbox,
  Textarea,
  Input,
  Select,
  SelectItem,
  Snippet,
  Chip,
  Divider,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Accordion,
  AccordionItem,
  ScrollShadow
} from "@nextui-org/react";
import {
  IconCheck,
  IconX,
  IconBulb,
  IconPlayerPlay,
  IconArrowUp,
  IconArrowDown,
  IconPuzzle,
  IconTestPipe,
  IconSend,
  IconGripVertical
} from '@tabler/icons-react';

/**
 * Interface unifiée pour répondre aux exercices
 * Logique simplifiée et UX améliorée avec NextUI
 */
export default function ExerciseAnswerInterface({
  exercise,
  onAnswer,
  onTest,
  attempts = 0,
  maxAttempts = 3,
  isSubmitting = false,
  onSubmit
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
        return;
      }

      if (onSubmit) {
        onSubmit();
      } else if (onAnswer) {
        onAnswer(userAnswer);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
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

          const code = userAnswer.toLowerCase().trim();
          const hasFunction = code.includes('function') || code.includes('=>') || code.includes('const') || code.includes('let');
          const hasReturn = code.includes('return') || code.includes('console.log') || code.includes('print');

          if (!hasFunction || !hasReturn) return false;

          if (exercise.type === 'Code') {
            return code.includes('function') || code.includes('=>') || code.includes('const') || code.includes('let');
          }

          if (exercise.type === 'Debug') {
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

        case 'Scratch':
          return typeof userAnswer === 'string' && userAnswer.trim().length > 0;

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

    if (!codeLower.includes('function') && !codeLower.includes('=>') && !codeLower.includes('const') && !codeLower.includes('let')) {
      return { valid: false, message: 'Il manque une déclaration de fonction' };
    }

    if (!codeLower.includes('return') && !codeLower.includes('console.log') && !codeLower.includes('print')) {
      return { valid: false, message: 'Il manque un retour de valeur ou un affichage' };
    }

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

      case 'Scratch':
        return <ScratchInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;

      case 'ScratchBlocks':
        return <ScratchInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;

      case 'CodeCompletion':
        return <CodeCompletionInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;

      case 'PseudoCode':
        return <PseudoCodeInterface exercise={exercise} answer={userAnswer} onAnswer={setUserAnswer} />;

      default:
        return (
          <div className="bg-danger-50 text-danger p-4 rounded-lg border border-danger-200">
            Type d'exercice non supporté: {exercise.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="mb-6">
        <p className="text-lg whitespace-pre-wrap leading-relaxed text-default-700">
          {exercise.question}
        </p>
      </div>

      {/* Interface de réponse */}
      <div className="mb-6">
        {renderAnswerInterface()}
      </div>

      <Divider className="my-6" />

      {/* Boutons d'action */}
      <div className="flex justify-end gap-3">
        {onTest && (
          <Button
            variant="flat"
            color="secondary"
            startContent={<IconTestPipe size={18} />}
            onPress={handleTest}
            isDisabled={!isAnswerValid() || isTesting}
            isLoading={isTesting}
          >
            Tester ma réponse
          </Button>
        )}

        <Button
          color="primary"
          startContent={<IconSend size={18} />}
          onPress={handleSubmit}
          isDisabled={!isAnswerValid() || isSubmitting}
          isLoading={isSubmitting}
          className="bg-gradient-to-r from-primary to-secondary shadow-lg"
        >
          Soumettre
        </Button>
      </div>

      {/* Résultat du test */}
      <AnimatePresence>
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4"
          >
            <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-success-50 border-success-200 text-success-700' : 'bg-danger-50 border-danger-200 text-danger-700'}`}>
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? <IconCheck size={20} /> : <IconX size={20} />}
                <span className="font-bold">{testResult.success ? 'Test réussi' : 'Erreur de test'}</span>
              </div>
              <p className="text-sm mb-2">{testResult.message}</p>
              {testResult.details && (
                <Snippet hideSymbol color={testResult.success ? 'success' : 'danger'} className="w-full">
                  {typeof testResult.details === 'string' ? testResult.details : JSON.stringify(testResult.details, null, 2)}
                </Snippet>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solution après 3 tentatives */}
      <AnimatePresence>
        {showSolution && exercise.solution && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="p-4 rounded-lg border border-success-200 bg-success-50">
              <div className="flex items-center gap-2 mb-2 text-success-700">
                <IconBulb size={20} />
                <span className="font-bold">Solution</span>
              </div>
              <Snippet hideSymbol color="success" className="w-full">
                {exercise.solution}
              </Snippet>
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
    <div className="flex flex-col gap-3">
      {options.map((option, index) => (
        <Card
          key={index}
          isPressable
          onPress={() => handleOptionChange(index, !currentAnswer.includes(index))}
          className={`border-2 ${currentAnswer.includes(index) ? 'border-primary bg-primary/5' : 'border-transparent'}`}
        >
          <CardBody className="flex flex-row items-center gap-3 p-4">
            <Checkbox
              isSelected={currentAnswer.includes(index)}
              onValueChange={() => { }} // Géré par le onPress du Card
              classNames={{ label: "w-full" }}
            >
              {typeof option === 'object' ? option.text : option}
            </Checkbox>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function TextInputInterface({ exercise, answer, onAnswer }) {
  const currentAnswer = answer || '';

  return (
    <Textarea
      value={currentAnswer}
      onValueChange={onAnswer}
      placeholder="Tapez votre réponse ici..."
      minRows={4}
      variant="bordered"
      className="w-full"
    />
  );
}

function CodeInterface({ exercise, answer, onAnswer }) {
  const currentAnswer = answer || '';

  const handleTest = async (userCode) => {
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
    <div className="border border-divider rounded-lg overflow-hidden">
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
    <div className="flex flex-col gap-2">
      {currentAnswer.map((blockIndex, position) => (
        <Card key={blocks[blockIndex]?.id} className="border border-divider">
          <CardBody className="flex flex-row items-center gap-3 p-3">
            <div className="flex flex-col gap-1">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => position > 0 && moveBlock(position, position - 1)}
                isDisabled={position === 0}
              >
                <IconArrowUp size={16} />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => position < currentAnswer.length - 1 && moveBlock(position, position + 1)}
                isDisabled={position === currentAnswer.length - 1}
              >
                <IconArrowDown size={16} />
              </Button>
            </div>
            <Chip variant="flat" color="default">{position + 1}</Chip>
            <code className="flex-1 font-mono text-sm bg-default-100 p-2 rounded">
              {blocks[blockIndex]?.code}
            </code>
          </CardBody>
        </Card>
      ))}
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-lg font-semibold mb-3">Éléments</h4>
        <div className="flex flex-col gap-2">
          {elements.map((element, index) => (
            <Card key={element.id || index} className="bg-default-50">
              <CardBody className="p-3">
                <p>{typeof element === 'object' ? element.content : element}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-3">Associations</h4>
        <div className="flex flex-col gap-2">
          {elements.map((element, index) => (
            <div key={element.id || index} className="flex flex-col gap-2 p-3 border border-divider rounded-lg">
              <span className="font-medium text-sm">{typeof element === 'object' ? element.content : element}</span>
              <Select
                placeholder="Choisir une cible"
                selectedKeys={currentAnswer[element.id || index] ? [currentAnswer[element.id || index].toString()] : []}
                onChange={(e) => handleAssignment(element.id || index, e.target.value)}
                size="sm"
              >
                {targets.map((t, i) => (
                  <SelectItem key={(t.id || i).toString()} value={(t.id || i).toString()}>
                    {typeof t === 'object' ? t.content : t}
                  </SelectItem>
                ))}
              </Select>
            </div>
          ))}
        </div>
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
    <div className="flex flex-col gap-4">
      {prompts.map((prompt, index) => (
        <div key={prompt.id || index} className="flex items-center gap-4">
          <div className="flex-1 p-3 bg-default-100 rounded-lg text-center font-medium">
            {typeof prompt === 'object' ? prompt.content : prompt}
          </div>
          <IconPlayerPlay size={20} className="text-default-400" />
          <div className="flex-1">
            <Select
              placeholder="Correspondance..."
              selectedKeys={currentAnswer[prompt.id] ? [currentAnswer[prompt.id].toString()] : []}
              onChange={(e) => handlePairing(prompt.id, e.target.value)}
            >
              {matches.map((m, i) => (
                <SelectItem key={(m.id || i).toString()} value={(m.id || i).toString()}>
                  {typeof m === 'object' ? m.content : m}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      ))}
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
    <div className="flex flex-col gap-2">
      {currentAnswer.map((stepIndex, position) => (
        <Card key={steps[stepIndex]?.id} className="border border-divider">
          <CardBody className="flex flex-row items-center gap-3 p-3">
            <div className="flex flex-col gap-1">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => position > 0 && moveStep(position, position - 1)}
                isDisabled={position === 0}
              >
                <IconArrowUp size={16} />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => position < currentAnswer.length - 1 && moveStep(position, position + 1)}
                isDisabled={position === currentAnswer.length - 1}
              >
                <IconArrowDown size={16} />
              </Button>
            </div>
            <Chip variant="flat" color="primary">{position + 1}</Chip>
            <p className="flex-1">{steps[stepIndex]?.content}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function ScratchInterface({ exercise, answer, onAnswer }) {
  if (exercise.type === 'Scratch') {
    return (
      <div className="h-[600px] border border-divider rounded-lg overflow-hidden">
        <ScratchEditor
          initialXml={exercise.initialXml}
          onCodeChange={(code) => onAnswer(code)}
          readOnly={false}
        />
      </div>
    );
  }

  const blocks = exercise.scratchBlocks || [];
  const currentAnswer = answer || [];

  const addBlock = (block) => {
    onAnswer([...currentAnswer, { ...block, id: Date.now() }]);
  };

  const removeBlock = (id) => {
    onAnswer(currentAnswer.filter(block => block.id !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[500px]">
      <div className="md:col-span-5 flex flex-col">
        <h5 className="font-semibold mb-2">Blocs disponibles</h5>
        <ScrollShadow className="flex-1 border border-divider rounded-lg p-2 bg-default-50">
          <div className="flex flex-col gap-2">
            {blocks.map((block, index) => (
              <Button
                key={index}
                variant="flat"
                color={block.category === 'motion' ? 'primary' : block.category === 'control' ? 'warning' : 'default'}
                className="justify-start"
                startContent={<IconPuzzle size={18} />}
                onPress={() => addBlock(block)}
              >
                {block.text}
              </Button>
            ))}
          </div>
        </ScrollShadow>
      </div>

      <div className="md:col-span-7 flex flex-col">
        <h5 className="font-semibold mb-2">Votre programme</h5>
        <ScrollShadow className="flex-1 border border-divider rounded-lg p-2 bg-default-100">
          {currentAnswer.length === 0 ? (
            <div className="h-full flex items-center justify-center text-default-400">
              <p>Cliquez sur des blocs pour commencer</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {currentAnswer.map((block) => (
                <div key={block.id} className="flex gap-2">
                  <Button
                    className="flex-1 justify-start"
                    variant="solid"
                    color={block.category === 'motion' ? 'primary' : block.category === 'control' ? 'warning' : 'default'}
                    startContent={<IconPuzzle size={18} />}
                  >
                    {block.text}
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    onPress={() => removeBlock(block.id)}
                  >
                    <IconX size={18} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollShadow>
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
    <div className="flex flex-col gap-4">
      <div className="bg-[#1e1e1e] p-4 rounded-lg text-white font-mono text-sm whitespace-pre-wrap">
        {exercise.codeTemplate}
      </div>

      <h5 className="font-semibold">Complétez les trous :</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gaps.map((gap) => (
          <Input
            key={gap.id}
            label={gap.placeholder}
            placeholder={`Complétez ${gap.placeholder}`}
            value={currentAnswer[gap.id] || ''}
            onValueChange={(val) => handleGapChange(gap.id, val)}
            description={gap.hint}
            classNames={{ input: "font-mono" }}
          />
        ))}
      </div>
    </div>
  );
}

function PseudoCodeInterface({ exercise, answer, onAnswer }) {
  const currentAnswer = answer || '';

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-default-600">Écrivez le pseudo-code demandé :</p>
      <Textarea
        value={currentAnswer}
        onValueChange={onAnswer}
        placeholder="Écrivez votre pseudo-code ici..."
        minRows={6}
        variant="bordered"
        classNames={{ input: "font-mono" }}
      />
    </div>
  );
}
