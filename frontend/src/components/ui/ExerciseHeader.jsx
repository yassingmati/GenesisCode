import React from 'react';
import { Chip, Card, CardBody } from "@nextui-org/react";
import {
  IconCheck,
  IconAlertCircle,
  IconTarget,
  IconListCheck,
  IconCode,
  IconClick,
  IconKeyboard,
  IconEdit,
  IconLink,
  IconBox,
  IconBug,
  IconChartDots,
  IconSitemap,
  IconSearch,
  IconTools,
  IconPencil,
  IconClipboardList,
  IconBolt,
  IconDatabase,
  IconPuzzle,
  IconPalette,
  IconMap,
  IconTerminal,
  IconRocket,
  IconClock,
  IconRefresh,
  IconChartPie,
  IconBulb
} from '@tabler/icons-react';

/**
 * Composant ExerciseHeader - En-tête d'exercice avec métadonnées
 */
const ExerciseHeader = ({
  title,
  difficulty,
  points,
  type,
  timeLimit,
  attemptsAllowed,
  hint,
  showSolutionAfterAttempts,
  allowPartial,
  language
}) => {
  const getDifficultyInfo = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return { color: "success", label: 'Facile', icon: <IconCheck size={16} /> };
      case 'hard':
        return { color: "danger", label: 'Difficile', icon: <IconAlertCircle size={16} /> };
      default:
        return { color: "warning", label: 'Moyen', icon: <IconTarget size={16} /> };
    }
  };

  const getTypeInfo = (type) => {
    const typeMap = {
      'QCM': { icon: <IconListCheck size={18} />, label: 'QCM' },
      'Code': { icon: <IconCode size={18} />, label: 'Code' },
      'DragDrop': { icon: <IconClick size={18} />, label: 'Glisser-Déposer' },
      'TextInput': { icon: <IconKeyboard size={18} />, label: 'Saisie' },
      'FillInTheBlank': { icon: <IconEdit size={18} />, label: 'Remplissage' },
      'Matching': { icon: <IconLink size={18} />, label: 'Correspondance' },
      'OrderBlocks': { icon: <IconBox size={18} />, label: 'Ordre' },
      'SpotTheError': { icon: <IconBug size={18} />, label: 'Erreur' },
      'Algorithm': { icon: <IconChartDots size={18} />, label: 'Algorithme' },
      'FlowChart': { icon: <IconSitemap size={18} />, label: 'Organigramme' },
      'Trace': { icon: <IconSearch size={18} />, label: 'Traçage' },
      'Debug': { icon: <IconTools size={18} />, label: 'Débogage' },
      'CodeCompletion': { icon: <IconPencil size={18} />, label: 'Complétion' },
      'PseudoCode': { icon: <IconClipboardList size={18} />, label: 'Pseudo-code' },
      'Complexity': { icon: <IconBolt size={18} />, label: 'Complexité' },
      'DataStructure': { icon: <IconDatabase size={18} />, label: 'Structure Données' },
      'ScratchBlocks': { icon: <IconPuzzle size={18} />, label: 'Scratch' },
      'VisualProgramming': { icon: <IconPalette size={18} />, label: 'Visuel' },
      'ConceptMapping': { icon: <IconMap size={18} />, label: 'Concept Map' },
      'CodeOutput': { icon: <IconTerminal size={18} />, label: 'Sortie Code' },
      'Optimization': { icon: <IconRocket size={18} />, label: 'Optimisation' }
    };
    return typeMap[type] || { icon: <IconPuzzle size={18} />, label: type };
  };

  const difficultyInfo = getDifficultyInfo(difficulty);
  const typeInfo = getTypeInfo(type);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <div className="flex flex-wrap gap-2">
            <Chip
              startContent={typeInfo.icon}
              variant="flat"
              color="primary"
              size="sm"
            >
              {typeInfo.label}
            </Chip>
            <Chip
              startContent={<IconTarget size={16} />}
              variant="flat"
              color="secondary"
              size="sm"
            >
              {points} points
            </Chip>
            <Chip
              startContent={difficultyInfo.icon}
              variant="flat"
              color={difficultyInfo.color}
              size="sm"
            >
              {difficultyInfo.label}
            </Chip>
            {language && (
              <Chip
                startContent={<IconCode size={16} />}
                variant="flat"
                color="default"
                size="sm"
              >
                {language}
              </Chip>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          {timeLimit && (
            <Chip startContent={<IconClock size={16} />} variant="dot" color="warning" size="sm">
              {timeLimit}min
            </Chip>
          )}
          {attemptsAllowed && (
            <Chip startContent={<IconRefresh size={16} />} variant="dot" color="primary" size="sm">
              {attemptsAllowed} essais
            </Chip>
          )}
          {allowPartial && (
            <Chip startContent={<IconChartPie size={16} />} variant="dot" color="success" size="sm">
              Partiel
            </Chip>
          )}
          {showSolutionAfterAttempts && (
            <Chip startContent={<IconBulb size={16} />} variant="dot" color="secondary" size="sm">
              Sol. après {showSolutionAfterAttempts}
            </Chip>
          )}
        </div>
      </div>

      {hint && (
        <Card className="bg-warning-50 border-warning-200 border shadow-none">
          <CardBody className="flex flex-row gap-3 items-start py-3">
            <IconBulb className="text-warning-600 min-w-5 mt-1" size={20} />
            <div>
              <p className="font-bold text-warning-700 text-sm mb-1">Indice</p>
              <p className="text-warning-800 text-sm">{hint}</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default ExerciseHeader;