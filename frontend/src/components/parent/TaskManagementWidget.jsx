import React, { useState, useEffect } from 'react';
import {
    Card, CardBody, CardHeader, CardFooter,
    Chip, Button, Progress, Divider
} from "@nextui-org/react";
import {
    IconCalendar, IconCheck, IconClock, IconRepeat, IconTarget, IconTrophy, IconHourglass
} from '@tabler/icons-react';
import { taskService } from '../../services/taskService';

export default function TaskManagementWidget({ childId }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tasks, setTasks] = useState([]);
    const [taskFrequency, setTaskFrequency] = useState('daily'); // 'daily' or 'monthly'
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (childId) {
            loadTasks();
        }
    }, [childId, selectedDate, taskFrequency]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            // Fetch assigned tasks (from Admin)
            const assignedTasks = await taskService.getChildTasks(childId, selectedDate, selectedDate) || [];

            // Normalize Assigned Tasks
            const normalizedAssigned = Array.isArray(assignedTasks) ? assignedTasks.map(t => ({
                id: t._id,
                title: t.templateId?.title || 'Tâche assignée',
                description: t.templateId?.description,
                status: t.status || 'pending',
                recurrence: t.templateId?.recurrence?.type || 'daily',
                metricsTarget: t.metricsTarget || t.templateId?.target,
                metricsCurrent: t.metricsCurrent || {},
                isAssigned: true,
                xpReward: t.templateId?.xpReward || 10
            })) : [];

            // Skip legacy tasks ideally, but keeping them for now if needed (read-only)
            const legacyTasks = await taskService.getTasks(childId, selectedDate, taskFrequency);
            const normalizedLegacy = Array.isArray(legacyTasks) ? legacyTasks.map(t => ({
                id: t._id,
                title: t.title,
                description: t.description,
                status: t.status || 'pending',
                recurrence: t.type || 'daily',
                metricsTarget: null,
                metricsCurrent: {},
                isAssigned: false,
                xpReward: t.xpReward || 10
            })) : [];

            setTasks([...normalizedAssigned, ...normalizedLegacy]);
        } catch (error) {
            console.error("Error loading tasks:", error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'active': return 'primary';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <IconCheck size={14} />;
            case 'active': return <IconClock size={14} />;
            case 'pending': return <IconHourglass size={14} />;
            default: return null;
        }
    };

    // Calculate percentage for a given metric
    const getProgressValue = (current, target) => {
        if (!target || target === 0) return 0;
        return Math.min((current / target) * 100, 100);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <IconTarget size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">Suivi des Tâches</h3>
                        <p className="text-xs text-gray-500">Gérez et suivez la progression</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
                    <div className="flex p-1 bg-gray-100 dark:bg-slate-900 rounded-lg">
                        <button
                            onClick={() => setTaskFrequency('daily')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${taskFrequency === 'daily'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Quotidien
                        </button>
                        <button
                            onClick={() => setTaskFrequency('monthly')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${taskFrequency === 'monthly'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Mensuel
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700">
                        <IconCalendar size={16} className="text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-none text-xs focus:outline-none text-gray-700 dark:text-gray-300 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Task Grid */}
            {tasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                        <Card
                            key={task.id}
                            className={`border transition-all hover:shadow-md ${task.status === 'completed'
                                    ? 'border-green-200 dark:border-green-900 bg-green-50/10'
                                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                }`}
                        >
                            <CardHeader className="flex justify-between items-start pb-0">
                                <div className="flex gap-2">
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color={getStatusColor(task.status)}
                                        startContent={getStatusIcon(task.status)}
                                        className="capitalize border-none pl-1"
                                    >
                                        {task.status === 'active' ? 'En cours' : task.status}
                                    </Chip>
                                    {task.recurrence === 'daily' && (
                                        <Chip size="sm" variant="light" color="secondary" startContent={<IconRepeat size={12} />} className="text-tiny px-0">
                                            Quotidien
                                        </Chip>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                                    <IconTrophy size={12} />
                                    <span className="text-xs font-bold">{task.xpReward} XP</span>
                                </div>
                            </CardHeader>

                            <CardBody className="py-4">
                                <h4 className={`font-bold text-lg mb-1 line-clamp-1 ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-white'}`}>
                                    {task.title}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 h-10">
                                    {task.description || "Aucune description fournie."}
                                </p>

                                <div className="space-y-4">
                                    {/* Metrics (Exercises) */}
                                    {task.metricsTarget?.exercises_submitted > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                                <span>Exercices</span>
                                                <span className="font-semibold">{task.metricsCurrent?.exercises_submitted || 0} / {task.metricsTarget.exercises_submitted}</span>
                                            </div>
                                            <Progress
                                                size="sm"
                                                value={getProgressValue(task.metricsCurrent?.exercises_submitted || 0, task.metricsTarget.exercises_submitted)}
                                                color={task.status === 'completed' ? "success" : "primary"}
                                                classNames={{
                                                    track: "bg-gray-100 dark:bg-slate-700",
                                                    indicator: task.status === 'completed' ? "bg-green-500" : "bg-blue-500"
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Metrics (Levels) */}
                                    {task.metricsTarget?.levels_completed > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                                <span>Niveaux</span>
                                                <span className="font-semibold">{task.metricsCurrent?.levels_completed || 0} / {task.metricsTarget.levels_completed}</span>
                                            </div>
                                            <Progress
                                                size="sm"
                                                value={getProgressValue(task.metricsCurrent?.levels_completed || 0, task.metricsTarget.levels_completed)}
                                                color="secondary"
                                            />
                                        </div>
                                    )}

                                    {/* Fallback if no target (e.g. manual/legacy task) */}
                                    {!task.metricsTarget && (
                                        <div className="p-2 bg-gray-50 dark:bg-slate-900 rounded text-center text-xs text-gray-400 italic">
                                            Tâche manuelle sans suivi automatique
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                    <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-full mb-3">
                        <IconTarget size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Aucune tâche trouvée pour cette date.</p>
                </div>
            )}
        </div>
    );
}

