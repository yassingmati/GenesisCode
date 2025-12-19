import React from 'react';
import { Switch, Slider, Card, CardBody } from "@nextui-org/react";
import { IconCoffee, IconClockPlay } from '@tabler/icons-react';

export default function BreakControls({
    mandatoryBreaks,
    onChange,
    disabled = false
}) {
    const { enabled = false, breakInterval = 30, breakDuration = 5 } = mandatoryBreaks || {};

    const handleToggle = (value) => {
        onChange({ ...mandatoryBreaks, enabled: value });
    };

    const handleIntervalChange = (value) => {
        onChange({ ...mandatoryBreaks, breakInterval: value });
    };

    const handleDurationChange = (value) => {
        onChange({ ...mandatoryBreaks, breakDuration: value });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <IconCoffee size={18} /> Pauses Obligatoires
                    </h4>
                    <p className="text-xs text-gray-500">
                        Forcer une pause après un certain temps d'écran
                    </p>
                </div>
                <Switch
                    isSelected={enabled}
                    onValueChange={handleToggle}
                    isDisabled={disabled}
                    color="success"
                />
            </div>

            {enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-appearance-in">
                    <Card className="bg-orange-50 dark:bg-orange-900/10 border-none shadow-sm">
                        <CardBody className="p-4">
                            <div className="flex items-center gap-2 mb-2 text-orange-700 dark:text-orange-400">
                                <IconClockPlay size={18} />
                                <span className="font-semibold text-sm">Fréquence</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">
                                Pause toutes les <span className="font-bold">{breakInterval}</span> minutes
                            </p>
                            <Slider
                                size="sm"
                                step={5}
                                minValue={15}
                                maxValue={120}
                                value={breakInterval}
                                onChange={handleIntervalChange}
                                isDisabled={disabled}
                                color="warning"
                                aria-label="Intervalle de pause"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>15min</span>
                                <span>2h</span>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-teal-50 dark:bg-teal-900/10 border-none shadow-sm">
                        <CardBody className="p-4">
                            <div className="flex items-center gap-2 mb-2 text-teal-700 dark:text-teal-400">
                                <IconCoffee size={18} />
                                <span className="font-semibold text-sm">Durée</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">
                                Durée de la pause : <span className="font-bold">{breakDuration}</span> minutes
                            </p>
                            <Slider
                                size="sm"
                                step={1}
                                minValue={1}
                                maxValue={30}
                                value={breakDuration}
                                onChange={handleDurationChange}
                                isDisabled={disabled}
                                color="success"
                                aria-label="Durée de pause"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>1min</span>
                                <span>30min</span>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
}
