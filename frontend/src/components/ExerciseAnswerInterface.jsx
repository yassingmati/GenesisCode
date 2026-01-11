import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from './ui/CodeEditor';
import ScratchEditor from './ui/ScratchEditor';
import QCMExercise from './exercises/QCMExercise';
import {
  Button,
  Checkbox,
  Textarea,
  Input,
  Select,
  SelectItem,
  Snippet,
  Chip,
  Card,
  CardBody,
  ScrollShadow
} from "@nextui-org/react";
import {
  IconCheck,
  IconX,
  IconBulb,
  IconPlayerPlay,
  IconArrowUp,
  IconArrowDown,
  IconPuzzle
} from '@tabler/icons-react';

/**
 * Interface unifiée pour répondre aux exercices
 * Optimisée pour ExerciseWorkspace (pas de padding/cards internes)
 */
export default function ExerciseAnswerInterface({
  exercise,
  answer,
  onAnswer,
  onTest,
  attempts = 0,
  maxAttempts = 3,
  isSubmitting = false,
  submissionResult // Reçu du parent pour affichage contextuel si besoin
}) {
  const [userAnswer, setUserAnswer] = useState(answer);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Sync internal state with prop
  useEffect(() => {
    setUserAnswer(answer);
  }, [answer]);

  // Initialiser la réponse si vide
  useEffect(() => {
    if (userAnswer === null || userAnswer === undefined) {
      const initial = getInitialAnswer(exercise);
      setUserAnswer(initial);
      onAnswer(initial);
    }
  }, [exercise]);

  // Propager les changements vers le parent
  const handleAnswerChange = (newAnswer) => {
    setUserAnswer(newAnswer);
    onAnswer(newAnswer);
  };

  const getInitialAnswer = (exercise) => {
    switch (exercise.type) {
      case 'QCM': return [];
      case 'TextInput':
      case 'FillInTheBlank':
      case 'SpotTheError':
      case 'Code':
      case 'Trace':
      case 'Debug':
      case 'CodeCompletion':
      case 'PseudoCode':
      case 'Complexity':
      case 'CodeOutput':
      case 'Optimization': return '';
      case 'OrderBlocks': return exercise.blocks?.map((_, i) => i) || [];
      case 'DragDrop':
      case 'Matching': return {};
      case 'Algorithm':
      case 'AlgorithmSteps': return exercise.algorithmSteps?.map((_, i) => i) || [];
      case 'ScratchBlocks': return [];
      default: return null;
    }
  };

  // Rendu de l'interface selon le type d'exercice
  const renderInterface = () => {
    switch (exercise.type) {
      case 'QCM':
        return <QCMExercise exercise={exercise} userAnswer={userAnswer} onAnswerChange={handleAnswerChange} />;
      case 'TextInput':
      case 'FillInTheBlank':
      case 'SpotTheError':
        return <TextInputInterface exercise={exercise} answer={userAnswer} onAnswer={handleAnswerChange} />;
      case 'Code':
      case 'Trace':
      case 'Debug':
      case 'CodeCompletion':
      case 'PseudoCode':
      case 'Complexity':
      case 'CodeOutput':
      case 'Optimization':
        return <CodeInterface exercise={exercise} answer={userAnswer} onAnswer={handleAnswerChange} />;
      case 'OrderBlocks':
        return <OrderBlocksInterface exercise={exercise} answer={userAnswer} onAnswer={handleAnswerChange} />;
      case 'DragDrop':
        return <DragDropInterface exercise={exercise} answer={userAnswer} onAnswer={handleAnswerChange} />;
      case 'Matching':
        return <MatchingInterface exercise={exercise} answer={userAnswer} onAnswer={handleAnswerChange} />;
      case 'Algorithm':
      case 'AlgorithmSteps':
        return <AlgorithmInterface exercise={exercise} answer={userAnswer} onAnswer={handleAnswerChange} />;
      case 'Scratch':
      case 'ScratchBlocks':
        return <ScratchInterface exercise={exercise} answer={userAnswer} onAnswer={handleAnswerChange} />;
      case 'CodeCompletion':
        return <CodeCompletionInterface exercise={exercise} answer={userAnswer} onAnswer={handleAnswerChange} />;
      case 'PseudoCode':
        return <PseudoCodeInterface exercise={exercise} answer={userAnswer} onAnswer={handleAnswerChange} />;
      default:
        return (
          <div className="bg-danger-50 text-danger p-4 rounded-lg border border-danger-200">
            Type d'exercice non supporté: {exercise.type}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Interface principale */}
      <div className="flex-1">
        {renderInterface()}
      </div>

      {/* Zone de test (si applicable) */}
      <AnimatePresence>
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 p-4 rounded-lg border bg-content2"
          >
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? <IconCheck size={20} className="text-success" /> : <IconX size={20} className="text-danger" />}
              <span className="font-bold">{testResult.success ? 'Test réussi' : 'Erreur'}</span>
            </div>
            <p className="text-sm">{testResult.message}</p>
          </motion.div>
        )}
        {submissionResult && submissionResult.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mt-4 p-4 rounded-lg border ${submissionResult.isCorrect ? 'bg-success-50 border-success-200 text-success-900' : 'bg-warning-50 border-warning-200 text-warning-900'}`}
          >
            <div className="flex items-start gap-3">
              {submissionResult.isCorrect ? <IconCheck className="text-success" /> : <IconBulb className="text-warning" />}
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">{submissionResult.isCorrect ? 'Excellent travail !' : 'Conseil'}</p>
                <p className="text-sm whitespace-pre-wrap">{submissionResult.feedback}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sous-composants ---

function QCMInterface({ exercise, answer, onAnswer }) {
  const options = exercise.options || [];
  const currentAnswer = answer || [];

  const handleOptionChange = (index, checked) => {
    if (checked) onAnswer([...currentAnswer, index]);
    else onAnswer(currentAnswer.filter(i => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => (
        <Card
          key={index}
          isPressable
          onPress={() => handleOptionChange(index, !currentAnswer.includes(index))}
          className={`border-2 transition-colors ${currentAnswer.includes(index) ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-content2'}`}
        >
          <CardBody className="flex flex-row items-center gap-3 p-4">
            <Checkbox
              isSelected={currentAnswer.includes(index)}
              onValueChange={() => { }}
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
  return (
    <Textarea
      value={answer || ''}
      onValueChange={onAnswer}
      placeholder="Tapez votre réponse ici..."
      minRows={6}
      variant="faded"
      size="lg"
      className="w-full font-mono"
    />
  );
}

function CodeInterface({ exercise, answer, onAnswer }) {
  // CodeEditor expects 'value' and 'onChange', not 'userAnswer' and 'setUserAnswer'
  const codeValue = typeof answer === 'string' ? answer : (answer?.code || '');

  const handleCodeChange = (newValue) => {
    // Update the answer with the new code string
    onAnswer(newValue);
  };

  return (
    <div className="w-full h-full flex flex-col border border-divider rounded-lg overflow-hidden bg-content1" style={{ minHeight: '500px' }}>
      <CodeEditor
        value={codeValue}
        onChange={handleCodeChange}
        language={exercise.language || 'javascript'}
        readOnly={false}
        height="500px"
        showToolbar={true}
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
        <Card key={blocks[blockIndex]?.id} className="border border-divider bg-content1">
          <CardBody className="flex flex-row items-center gap-3 p-3">
            <div className="flex flex-col gap-1">
              <Button
                isIconOnly size="sm" variant="light"
                onPress={() => position > 0 && moveBlock(position, position - 1)}
                isDisabled={position === 0}
              >
                <IconArrowUp size={16} />
              </Button>
              <Button
                isIconOnly size="sm" variant="light"
                onPress={() => position < currentAnswer.length - 1 && moveBlock(position, position + 1)}
                isDisabled={position === currentAnswer.length - 1}
              >
                <IconArrowDown size={16} />
              </Button>
            </div>
            <Chip variant="flat" color="default">{position + 1}</Chip>
            <code className="flex-1 font-mono text-sm bg-content2 p-2 rounded">
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
    onAnswer({ ...currentAnswer, [elementId]: targetId });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-default-500 uppercase">Éléments</h4>
        {elements.map((element, index) => (
          <Card key={element.id || index} className="bg-content1">
            <CardBody className="p-3">
              <p>{typeof element === 'object' ? element.content : element}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-default-500 uppercase">Associations</h4>
        {elements.map((element, index) => (
          <div key={element.id || index} className="flex flex-col gap-2 p-3 border border-divider rounded-lg bg-content1/50">
            <span className="font-medium text-sm">{typeof element === 'object' ? element.content : element}</span>
            <Select
              placeholder="Choisir une cible"
              selectedKeys={currentAnswer[element.id || index] ? [currentAnswer[element.id || index].toString()] : []}
              onChange={(e) => handleAssignment(element.id || index, e.target.value)}
              size="sm"
              variant="faded"
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
  );
}

function MatchingInterface({ exercise, answer, onAnswer }) {
  const prompts = exercise.prompts || [];
  const matches = exercise.matches || [];
  const currentAnswer = answer || {};

  const handlePairing = (promptId, matchId) => {
    const newAnswer = { ...currentAnswer };
    if (matchId) newAnswer[promptId] = matchId;
    else delete newAnswer[promptId];
    onAnswer(newAnswer);
  };

  return (
    <div className="flex flex-col gap-4">
      {prompts.map((prompt, index) => (
        <div key={prompt.id || index} className="flex items-center gap-4 bg-content1 p-2 rounded-lg">
          <div className="flex-1 p-3 bg-content2 rounded-lg text-center font-medium shadow-sm">
            {typeof prompt === 'object' ? prompt.content : prompt}
          </div>
          <IconPlayerPlay size={20} className="text-default-400" />
          <div className="flex-1">
            <Select
              placeholder="Correspondance..."
              selectedKeys={currentAnswer[prompt.id] ? [currentAnswer[prompt.id].toString()] : []}
              onChange={(e) => handlePairing(prompt.id, e.target.value)}
              variant="faded"
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
        <Card key={steps[stepIndex]?.id} className="border border-divider bg-content1">
          <CardBody className="flex flex-row items-center gap-3 p-3">
            <div className="flex flex-col gap-1">
              <Button
                isIconOnly size="sm" variant="light"
                onPress={() => position > 0 && moveStep(position, position - 1)}
                isDisabled={position === 0}
              >
                <IconArrowUp size={16} />
              </Button>
              <Button
                isIconOnly size="sm" variant="light"
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
      <div className="h-[60vh] min-h-[500px] border border-divider rounded-lg overflow-hidden shadow-sm">
        <ScratchEditor
          initialXml={exercise.initialXml}
          onXmlChange={(xml) => onAnswer(xml)}
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
        <h5 className="font-semibold mb-2 text-default-500 uppercase text-xs">Blocs disponibles</h5>
        <ScrollShadow className="flex-1 border border-divider rounded-lg p-2 bg-content2">
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
        <h5 className="font-semibold mb-2 text-default-500 uppercase text-xs">Votre programme</h5>
        <ScrollShadow className="flex-1 border border-divider rounded-lg p-2 bg-content1">
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
    onAnswer({ ...currentAnswer, [gapId]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#1e1e1e] p-4 rounded-lg text-white font-mono text-sm whitespace-pre-wrap shadow-inner">
        {exercise.codeTemplate}
      </div>

      <h5 className="font-semibold text-default-600">Complétez les trous :</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gaps.map((gap) => (
          <Input
            key={gap.id}
            label={gap.placeholder}
            placeholder={`...`}
            value={currentAnswer[gap.id] || ''}
            onValueChange={(val) => handleGapChange(gap.id, val)}
            description={gap.hint}
            classNames={{ input: "font-mono" }}
            variant="faded"
          />
        ))}
      </div>
    </div>
  );
}

function PseudoCodeInterface({ exercise, answer, onAnswer }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-default-600">Écrivez le pseudo-code demandé :</p>
      <Textarea
        value={answer || ''}
        onValueChange={onAnswer}
        placeholder="Écrivez votre pseudo-code ici..."
        minRows={8}
        variant="bordered"
        classNames={{ input: "font-mono" }}
      />
    </div>
  );
}
