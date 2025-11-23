import React from 'react';
import { Button, Card, CardBody, Chip, Progress, Accordion, AccordionItem, Snippet } from "@nextui-org/react";
import {
  IconSend,
  IconCheck,
  IconX,
  IconRefresh,
  IconAlertTriangle,
  IconTrophy,
  IconBulb,
  IconChartBar,
  IconListCheck,
  IconTestPipe
} from '@tabler/icons-react';

/**
 * Composant SubmissionPanel - Panel de soumission et résultats
 */
const SubmissionPanel = ({
  onSubmit,
  result,
  isSubmitting,
  attemptsAllowed,
  userAnswer,
  error
}) => {
  const canSubmit = userAnswer && !isSubmitting;
  const hasAttemptsLeft = !attemptsAllowed || (result?.attempts || 0) < attemptsAllowed;

  const handleSubmit = () => {
    if (canSubmit && hasAttemptsLeft) {
      onSubmit();
    }
  };

  const getSubmissionStatus = () => {
    if (isSubmitting) return 'submitting';
    if (result?.correct) return 'success';
    if (result && !result.correct) return 'error';
    return 'idle';
  };

  const getStatusColor = () => {
    switch (getSubmissionStatus()) {
      case 'submitting': return 'primary';
      case 'success': return 'success';
      case 'error': return 'danger';
      default: return 'primary';
    }
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-md">
      <CardBody className="gap-6 p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <IconTarget size={24} className="text-primary" />
            Soumission
          </h3>
          <Chip
            color={getStatusColor()}
            variant="flat"
            startContent={isSubmitting ? <Spinner size="sm" /> : (result?.correct ? <IconCheck size={16} /> : (result ? <IconX size={16} /> : <IconSend size={16} />))}
          >
            {isSubmitting ? 'En cours...' : (result?.correct ? 'Correct !' : (result ? 'Incorrect' : 'Prêt'))}
          </Chip>
        </div>

        {/* Informations sur les tentatives */}
        {attemptsAllowed && (
          <div className="bg-default-50 p-4 rounded-lg border border-divider">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold flex items-center gap-2">
                <IconRefresh size={16} /> Tentatives
              </span>
              <span className="text-sm text-default-500">
                {result?.attempts || 0} / {attemptsAllowed}
              </span>
            </div>
            <Progress
              value={((result?.attempts || 0) / attemptsAllowed) * 100}
              color={!hasAttemptsLeft ? "danger" : "primary"}
              size="sm"
              className="mb-1"
            />
            {!hasAttemptsLeft && (
              <p className="text-tiny text-danger flex items-center gap-1 mt-1">
                <IconAlertTriangle size={12} /> Plus de tentatives disponibles
              </p>
            )}
          </div>
        )}

        {/* Bouton de soumission */}
        <Button
          color={getStatusColor()}
          size="lg"
          variant={result?.correct ? "flat" : "shadow"}
          onPress={handleSubmit}
          isDisabled={!canSubmit || !hasAttemptsLeft}
          isLoading={isSubmitting}
          startContent={!isSubmitting && <IconSend />}
          className="w-full font-bold"
        >
          {isSubmitting ? 'Soumission...' : 'Soumettre ma réponse'}
        </Button>

        {/* Affichage des erreurs */}
        {error && (
          <div className="bg-danger-50 text-danger p-4 rounded-lg border border-danger-200 flex gap-3 items-start">
            <IconAlertTriangle className="min-w-5 mt-1" />
            <div>
              <p className="font-bold text-sm">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Résultats de soumission */}
        {result && (
          <div className={`border rounded-lg overflow-hidden ${result.correct ? 'border-success-200 bg-success-50' : 'border-danger-200 bg-danger-50'}`}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  {result.correct ? <IconCheck className="text-success" size={24} /> : <IconX className="text-danger" size={24} />}
                  <span className={`text-lg font-bold ${result.correct ? 'text-success-700' : 'text-danger-700'}`}>
                    {result.correct ? 'Réponse Correcte !' : 'Réponse Incorrecte'}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white/50 px-3 py-1 rounded-full">
                  <span className="font-bold text-lg">{result.pointsEarned || 0}</span>
                  <span className="text-default-500">/ {result.pointsMax || 0} pts</span>
                </div>
              </div>

              {/* XP gagné */}
              {result.xpEarned > 0 && (
                <div className="flex items-center gap-2 text-warning-600 font-bold mb-4 bg-warning-100 p-2 rounded-lg w-fit">
                  <IconTrophy size={18} />
                  <span>+{result.xpEarned} XP gagné !</span>
                </div>
              )}

              {/* Explication */}
              {result.explanation && (
                <div className="mb-4">
                  <p className="font-semibold flex items-center gap-2 mb-1 text-default-700">
                    <IconBulb size={18} /> Explication
                  </p>
                  <p className="text-default-600 text-sm leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              )}

              {/* Détails spécifiques */}
              {result.details && (
                <Accordion variant="splitted" className="px-0">
                  <AccordionItem
                    key="1"
                    aria-label="Détails"
                    title={
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <IconChartBar size={18} /> Voir les détails
                      </div>
                    }
                    className="bg-white/50 shadow-sm"
                  >
                    <div className="space-y-3 pt-2">
                      {result.details.type === 'QCM' && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold block mb-1">Vos réponses :</span>
                            <span className="text-default-600">{result.details.user?.join(', ') || 'Aucune'}</span>
                          </div>
                          <div>
                            <span className="font-semibold block mb-1">Bonnes réponses :</span>
                            <span className="text-success-600">{result.details.correct?.join(', ') || 'N/A'}</span>
                          </div>
                        </div>
                      )}

                      {result.details.tests && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <IconTestPipe size={16} /> Résultats des tests :
                          </h4>
                          {result.details.tests.map((test, i) => (
                            <div key={i} className={`flex justify-between items-center p-2 rounded border ${test.passed ? 'bg-success-100 border-success-200' : 'bg-danger-100 border-danger-200'}`}>
                              <span className="text-sm font-medium">{test.name || `Test ${i + 1}`}</span>
                              <div className="flex items-center gap-2">
                                {test.passed ? <IconCheck size={16} className="text-success" /> : <IconX size={16} className="text-danger" />}
                                {test.points && <span className="text-xs font-bold">+{test.points} pts</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {!result.details.type && !result.details.tests && (
                        <Snippet hideSymbol className="w-full bg-default-100">
                          {JSON.stringify(result.details, null, 2)}
                        </Snippet>
                      )}
                    </div>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// Helper icon component since IconTarget was missing in imports
const IconTarget = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// Helper spinner component
const Spinner = ({ size }) => (
  <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'}`} />
);

export default SubmissionPanel;