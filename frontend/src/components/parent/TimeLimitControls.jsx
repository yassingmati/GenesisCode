import React from 'react';
import { Slider, Card, CardBody } from "@nextui-org/react";

export default function TimeLimitControls({
    dailyLimit,
    weeklyLimit,
    onDailyChange,
    onWeeklyChange,
    disabled = false
}) {
    const formatTime = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h${m > 0 ? ` ${m}m` : ''}`;
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm border border-gray-100 dark:border-slate-700">
                <CardBody className="p-4 bg-gray-50 dark:bg-slate-800">
                    <div className="mb-2 flex justify-between items-center">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Limite Quotidienne
                        </label>
                        <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-sm">
                            {formatTime(dailyLimit)} / jour
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                        Temps maximum autorisé par jour (toutes activités confondues)
                    </p>
                    <Slider
                        size="md"
                        step={15}
                        minValue={0}
                        maxValue={480} // 8h max
                        value={dailyLimit}
                        onChange={onDailyChange}
                        isDisabled={disabled}
                        showSteps={true}
                        color="primary"
                        className="max-w-md"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2 max-w-md">
                        <span>0h</span>
                        <span>4h</span>
                        <span>8h</span>
                    </div>
                </CardBody>
            </Card>

            <Card className="shadow-sm border border-gray-100 dark:border-slate-700">
                <CardBody className="p-4 bg-gray-50 dark:bg-slate-800">
                    <div className="mb-2 flex justify-between items-center">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Limite Hebdomadaire
                        </label>
                        <span className="text-secondary font-bold bg-secondary/10 px-2 py-0.5 rounded text-sm">
                            {formatTime(weeklyLimit)} / semaine
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                        Temps maximum autorisé sur une semaine glissante
                    </p>
                    <Slider
                        size="md"
                        step={30}
                        minValue={0}
                        maxValue={2400} // 40h max
                        value={weeklyLimit}
                        onChange={onWeeklyChange}
                        isDisabled={disabled}
                        color="secondary"
                        className="max-w-md"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2 max-w-md">
                        <span>0h</span>
                        <span>20h</span>
                        <span>40h</span>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
