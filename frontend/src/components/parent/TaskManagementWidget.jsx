import React, { useState, useEffect } from 'react';
import {
    Card, CardBody, CardHeader,
    Button, Input, Textarea,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Chip, Tooltip, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter
} from "@nextui-org/react";
import {
    IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconCalendar
} from '@tabler/icons-react';
import { taskService } from '../../services/taskService';

export default function TaskManagementWidget({ childId }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskXp, setNewTaskXp] = useState(10);
    const [taskFrequency, setTaskFrequency] = useState('daily'); // 'daily' or 'monthly'
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (childId) {
            loadTasks();
        }
    }, [childId, selectedDate, taskFrequency]);

    const loadTasks = async () => {
        try {
            // Fetch assigned tasks (new system)
            const assignedTasks = await taskService.getChildTasks(childId, selectedDate, selectedDate);

            // Normalize for display
            const normalizedTasks = Array.isArray(assignedTasks) ? assignedTasks.map(t => ({
                id: t._id,
                title: t.templateId?.title || 'Tâche assignée',
                description: t.templateId?.description,
                status: t.status || 'pending',
                recurrence: t.templateId?.recurrence?.type || 'daily',
                metricsTarget: t.metricsTarget || t.templateId?.target,
                metricsCurrent: t.metricsCurrent || {}
            })) : [];

            setTasks(normalizedTasks);
        } catch (error) {
            console.error("Error loading tasks:", error);
            setTasks([]);
        }
    };

    const handleAddTask = async () => {
        // ... (Keep existing logic for manual tasks if needed, or disable it)
        // For now, let's keep it but warn that it might not be fully supported in new view
        if (!newTaskTitle.trim()) return;

        try {
            await taskService.addTask({
                userId: childId,
                date: selectedDate,
                title: newTaskTitle,
                description: newTaskDescription,
                type: taskFrequency,
                xpReward: parseInt(newTaskXp) || 10
            });

            setNewTaskTitle('');
            setNewTaskDescription('');
            setNewTaskXp(10);
            onOpen(false);
            loadTasks(); // This might need to fetch legacy tasks too if we want to support both
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Erreur lors de l'ajout de la tâche");
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            try {
                // Check if it's an assigned task (cannot delete assigned tasks here easily, usually done via unassign)
                // But let's assume we can delete for now
                await taskService.deleteTask(taskId);
                loadTasks();
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        }
    };

    const renderProgress = (task) => {
        if (!task.metricsTarget) return '-';

        const parts = [];
        if (task.metricsTarget.exercises_submitted) {
            parts.push(
                <div key="ex" className="text-xs">
                    Exos: <b>{task.metricsCurrent?.exercises_submitted || 0}</b>/{task.metricsTarget.exercises_submitted}
                </div>
            );
        }
        if (task.metricsTarget.levels_completed) {
            parts.push(
                <div key="lvl" className="text-xs">
                    Lvls: <b>{task.metricsCurrent?.levels_completed || 0}</b>/{task.metricsTarget.levels_completed}
                </div>
            );
        }
        if (task.metricsTarget.hours_spent) {
            parts.push(
                <div key="hrs" className="text-xs">
                    Temps: <b>{Math.round((task.metricsCurrent?.hours_spent || 0) * 60)}</b>/{Math.round(task.metricsTarget.hours_spent * 60)}m
                </div>
            );
        }

        return parts.length > 0 ? <div className="flex flex-col gap-1">{parts}</div> : '-';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <div className="flex gap-2">
                    <Chip
                        className="cursor-pointer"
                        color={taskFrequency === 'daily' ? "primary" : "default"}
                        variant={taskFrequency === 'daily' ? "solid" : "flat"}
                        onClick={() => setTaskFrequency('daily')}
                    >
                        Tâches du Jour
                    </Chip>
                    {/* Monthly view might need adjustment for date range */}
                </div>

                <div className="flex items-center gap-2">
                    <IconCalendar size={20} className="text-gray-500" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <Card className="shadow-md">
                <CardHeader className="flex justify-between items-center px-6 py-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        Suivi des Tâches - {new Date(selectedDate).toLocaleDateString()}
                    </h3>
                    {/* Disable manual add for now to focus on assigned tasks */}
                    {/* <Button ... >Ajouter</Button> */}
                </CardHeader>
                <CardBody>
                    {tasks.length > 0 ? (
                        <Table aria-label="Table des tâches">
                            <TableHeader>
                                <TableColumn>TITRE</TableColumn>
                                <TableColumn>TYPE</TableColumn>
                                <TableColumn>PROGRESSION</TableColumn>
                                <TableColumn>STATUT</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {tasks.map((task) => (
                                    <TableRow key={task.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                {task.title}
                                                {task.description && <div className="text-xs text-gray-500">{task.description}</div>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="flat" color={task.recurrence === 'daily' ? "primary" : "secondary"}>
                                                {task.recurrence === 'daily' ? 'Quotidien' : 'Mensuel'}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            {renderProgress(task)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                color={
                                                    task.status === 'completed' ? "success" :
                                                        task.status === 'active' ? "primary" : "warning"
                                                }
                                                variant="dot"
                                            >
                                                {task.status === 'completed' ? 'Terminé' :
                                                    task.status === 'active' ? 'En cours' : 'En attente'}
                                            </Chip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Aucune tâche assignée pour cette date.
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Add Task Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Ajouter {taskFrequency === 'daily' ? 'une tâche manuelle' : 'un objectif mensuel'}</ModalHeader>
                    <ModalBody>
                        <Input
                            autoFocus
                            label="Titre"
                            placeholder={taskFrequency === 'daily' ? "Ex: Faire les devoirs de maths" : "Ex: Finir le module Python"}
                            variant="bordered"
                            value={newTaskTitle}
                            onValueChange={setNewTaskTitle}
                        />
                        <Textarea
                            label="Description"
                            placeholder="Détails supplémentaires..."
                            variant="bordered"
                            value={newTaskDescription}
                            onValueChange={setNewTaskDescription}
                        />
                        <Input
                            type="number"
                            label="Récompense XP"
                            placeholder="10"
                            variant="bordered"
                            value={newTaskXp.toString()}
                            onValueChange={(v) => setNewTaskXp(parseInt(v) || 0)}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="flat" onPress={onClose}>
                            Annuler
                        </Button>
                        <Button color="primary" onPress={handleAddTask}>
                            Ajouter
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
