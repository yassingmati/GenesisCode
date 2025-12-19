import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useParentalControlsManager, ParentalControlsErrorDisplay } from '../../components/ParentalControlsErrorHandler';
import ContentFiltersManager from '../../components/parent/ContentFiltersManager';
import RewardsSystem from '../../components/parent/RewardsSystem';
import TimeLimitControls from '../../components/parent/TimeLimitControls';
import BreakControls from '../../components/parent/BreakControls';
import { Card, CardHeader, CardBody, Button, Accordion, AccordionItem, Spinner, Chip } from "@nextui-org/react";
import { IconSettings, IconClock, IconLock, IconCoffee, IconTrophy, IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

export default function ParentalControlsNew() {
  const { childId } = useParams();
  const navigate = useNavigate();

  const {
    controls,
    loading: controlsLoading,
    saving,
    error,
    success,
    updateControls, // Helper to update specific fields
    setControls,    // Full setter if needed
    saveControls
  } = useParentalControlsManager(childId);

  // Helper handlers for TimeLimitControls
  const handleDailyLimitChange = (value) => {
    // If value is array (from range slider), take first. If number, take it.
    const val = Array.isArray(value) ? value[0] : value;
    updateControls('dailyTimeLimit', val);
  };

  const handleWeeklyLimitChange = (value) => {
    const val = Array.isArray(value) ? value[0] : value;
    updateControls('weeklyTimeLimit', val);
  };

  // Handler for BreakControls
  const handleBreaksChange = (newBreaksConfig) => {
    updateControls('mandatoryBreaks', newBreaksConfig);
  };

  if (controlsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-900">
        <Spinner size="lg" label="Chargement des contrôles..." color="primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Button
            variant="light"
            startContent={<IconArrowLeft size={18} />}
            onPress={() => navigate('/parent/dashboard')}
          >
            Retour
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <IconSettings size={28} className="text-gray-700 dark:text-gray-300" />
            Contrôles Parentaux
          </h1>
          <Button
            color="primary"
            isLoading={saving}
            startContent={!saving && <IconDeviceFloppy size={18} />}
            onPress={saveControls}
            className="shadow-md"
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </Button>
        </div>

        {error && <ParentalControlsErrorDisplay error={error} />}
        {success && (
          <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 border border-green-200 rounded-lg">
            ✅ {success}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Quick Stats / Summary (Optional enhancement) */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <CardHeader className="font-bold text-gray-700 dark:text-gray-200">Résumé</CardHeader>
              <CardBody className="gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Limite Jour</span>
                  <Chip color="primary" variant="flat" size="sm">
                    {Math.floor(controls.dailyTimeLimit / 60)}h {controls.dailyTimeLimit % 60}m
                  </Chip>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Limite Semaine</span>
                  <Chip color="secondary" variant="flat" size="sm">
                    {Math.floor(controls.weeklyTimeLimit / 60)}h
                  </Chip>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Pauses</span>
                  <Chip color={controls.mandatoryBreaks?.enabled ? "success" : "default"} variant="flat" size="sm">
                    {controls.mandatoryBreaks?.enabled ? "Activées" : "Désactivées"}
                  </Chip>
                </div>
              </CardBody>
            </Card>

            {/* Template Selector could go here or inside an accordion */}
          </div>

          {/* Right Column: Accordion Controls */}
          <div className="lg:col-span-2">
            <Accordion selectionMode="multiple" defaultExpandedKeys={["time"]} variant="splitted" className="gap-4">

              <AccordionItem
                key="time"
                aria-label="Limites de Temps"
                title={
                  <div className="flex items-center gap-3">
                    <IconClock className="text-blue-500" />
                    <span className="font-semibold text-gray-800 dark:text-white">Limites de Temps</span>
                  </div>
                }
              >
                <TimeLimitControls
                  dailyLimit={controls.dailyTimeLimit}
                  weeklyLimit={controls.weeklyTimeLimit}
                  onDailyChange={handleDailyLimitChange}
                  onWeeklyChange={handleWeeklyLimitChange}
                />
              </AccordionItem>

              <AccordionItem
                key="content"
                aria-label="Filtres de Contenu"
                title={
                  <div className="flex items-center gap-3">
                    <IconLock className="text-red-500" />
                    <span className="font-semibold text-gray-800 dark:text-white">Filtres de Contenu</span>
                  </div>
                }
              >
                <ContentFiltersManager />
              </AccordionItem>

              <AccordionItem
                key="breaks"
                aria-label="Pauses Obligatoires"
                title={
                  <div className="flex items-center gap-3">
                    <IconCoffee className="text-orange-500" />
                    <span className="font-semibold text-gray-800 dark:text-white">Pauses Obligatoires</span>
                  </div>
                }
              >
                <BreakControls
                  mandatoryBreaks={controls.mandatoryBreaks}
                  onChange={handleBreaksChange}
                />
              </AccordionItem>

              <AccordionItem
                key="rewards"
                aria-label="Récompenses"
                title={
                  <div className="flex items-center gap-3">
                    <IconTrophy className="text-yellow-500" />
                    <span className="font-semibold text-gray-800 dark:text-white">Système de Récompenses</span>
                  </div>
                }
              >
                <RewardsSystem />
              </AccordionItem>

            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
