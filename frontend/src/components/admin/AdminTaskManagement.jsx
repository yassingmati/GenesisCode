import React, { useState, useEffect } from 'react';
import {
    Card, CardBody, CardHeader,
    Button, Input,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Chip, Tooltip, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Select, SelectItem, User
} from "@nextui-org/react";
import {
    IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconCalendar, IconSearch
} from '@tabler/icons-react';
import { taskService } from '../../services/taskService';

export default function AdminTaskManagement() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [taskFrequency, setTaskFrequency] = useState('daily');
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        // Fetch users from localStorage 'users_db' or fallback to defaults
        const storedUsers = localStorage.getItem('users_db');
        if (storedUsers) {
            const allUsers = JSON.parse(storedUsers);
            const students = allUsers.filter(u => u.userType === 'student' || !u.userType);

            const mockChildren = localStorage.getItem('parent_children_mock');
            if (mockChildren) {
                const children = JSON.parse(mockChildren).map(c => ({
                    id: c.child._id,
                    name: `${c.child.firstName} ${c.child.lastName}`,
                    email: c.child.email,
                    role: 'student'
                }));

                children.forEach(child => {
                    if (!students.find(s => s.id === child.id)) {
                        students.push(child);
                    }
                });
            }

            setUsers(students.length > 0 ? students : [
                { id: 'user1', name: 'Jean Dupont', email: 'jean@example.com', role: 'student' },
                { id: 'user2', name: 'Marie Curie', email: 'marie@example.com', role: 'student' }
            ]);
        } else {
            setUsers([
                { id: 'user1', name: 'Jean Dupont', email: 'jean@example.com', role: 'student' },
                { id: 'user2', name: 'Marie Curie', email: 'marie@example.com', role: 'student' },
                { id: 'guest', name: 'Invité', email: 'guest@example.com', role: 'student' }
            ]);
        }
    }, []);

    useEffect(() => {
        if (selectedUser) {
            loadTasks();
        }
    }, [selectedUser, selectedDate, taskFrequency]);

    const loadTasks = async () => {
        try {
            // Fetch Assigned Tasks instead of legacy tasks
            const assignedTasks = await taskService.getChildTasks(selectedUser, selectedDate, selectedDate);

            // Normalize for display
            const normalizedTasks = Array.isArray(assignedTasks) ? assignedTasks.map(t => ({
                id: t._id, // AssignedTask ID
                title: t.templateId?.title || 'Tâche assignée',
                type: t.recurrenceType === 'monthly' ? 'monthly' : 'daily',
                status: t.status || 'pending',
                autoRenew: t.autoRenew
            })) : [];

            // Filter by frequency if needed (though the API call already scoped by date logic)
            // But 'monthly' tasks might show up in daily view if they overlap?
            // Let's filter by the UI switch
            const filteredJson = normalizedTasks.filter(t =>
                taskFrequency === 'daily' ? t.type !== 'monthly' : t.type === 'monthly'
            );

            setTasks(filteredJson);
        } catch (error) {
            console.error("Error loading tasks:", error);
            setTasks([]);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim() || !selectedUser) return;

        try {
            // 1. Create a Task Template (Invisible to user, acting as a definition)
            const templatePayload = {
                title: newTaskTitle,
                description: `Tâche ${taskFrequency === 'daily' ? 'journalière' : 'mensuelle'} créée par l'admin`,
                type: 'custom',
                recurrence: {
                    type: taskFrequency,
                    frequency: taskFrequency
                },
                target: {
                    exercises_submitted: 1 // Default target
                },
                xpReward: 10
            };

            const template = await taskService.createTaskTemplate(templatePayload);

            // 2. Assign the task
            const startDate = new Date(selectedDate);
            let endDate = new Date(selectedDate);

            if (taskFrequency === 'daily') {
                // Ensure end is end of day
                endDate.setHours(23, 59, 59, 999);
            } else {
                // For monthly, set to end of month
                endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
            }

            const assignmentPayload = {
                templateId: template._id,
                childIds: [selectedUser],
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                autoRenew: taskFrequency === 'daily' // Auto-renew only for daily tasks
            };

            await taskService.assignTasks(assignmentPayload);

            setNewTaskTitle('');
            onOpen(false);
            loadTasks();
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Erreur lors de l'ajout de la tâche");
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            try {
                await taskService.deleteAssignedTask(taskId);
                loadTasks();
            } catch (error) {
                console.error("Error deleting task:", error);
                alert("Erreur lors de la suppression");
            }
        }
    };

    return (
        <div className="space-y-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-800">Gestion Globale des Tâches</h2>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="w-full md:w-1/3">
                    <Select
                        label="Sélectionner un utilisateur"
                        placeholder="Choisir un élève"
                        selectedKeys={selectedUser ? [selectedUser] : []}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        {users.map((user) => (
                            <SelectItem key={user.id} textValue={user.name}>
                                <User
                                    name={user.name}
                                    description={user.email}
                                    avatarProps={{
                                        src: `https://i.pravatar.cc/150?u=${user.id}`
                                    }}
                                />
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <Chip
                            className="cursor-pointer"
                            color={taskFrequency === 'daily' ? "primary" : "default"}
                            variant={taskFrequency === 'daily' ? "solid" : "flat"}
                            onClick={() => setTaskFrequency('daily')}
                        >
                            Journalier
                        </Chip>
                        <Chip
                            className="cursor-pointer"
                            color={taskFrequency === 'monthly' ? "primary" : "default"}
                            variant={taskFrequency === 'monthly' ? "solid" : "flat"}
                            onClick={() => setTaskFrequency('monthly')}
                        >
                            Mensuel
                        </Chip>
                    </div>

                    <div className="flex items-center gap-2">
                        <IconCalendar size={20} className="text-gray-500" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {selectedUser && (
                <Card className="shadow-md">
                    <CardHeader className="flex justify-between items-center px-6 py-4">
                        <h3 className="text-xl font-bold text-gray-800">
                            {taskFrequency === 'daily' ? `Tâches du ${new Date(selectedDate).toLocaleDateString()}` : 'Objectifs Mensuels'}
                        </h3>
                        <Button
                            color="primary"
                            endContent={<IconPlus size={18} />}
                            onPress={onOpen}
                        >
                            Ajouter {taskFrequency === 'daily' ? 'une tâche' : 'un objectif'}
                        </Button>
                    </CardHeader>
                    <CardBody>
                        {tasks.length > 0 ? (
                            <Table aria-label="Table des tâches">
                                <TableHeader>
                                    <TableColumn>TITRE</TableColumn>
                                    <TableColumn>TYPE</TableColumn>
                                    <TableColumn>RENOUVELLEMENT</TableColumn>
                                    <TableColumn>STATUT</TableColumn>
                                    <TableColumn>ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {tasks.map((task) => (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">{task.title}</TableCell>
                                            <TableCell>
                                                <Chip size="sm" color={task.type === 'auto' ? "warning" : "secondary"} variant="flat">
                                                    {task.type === 'monthly' ? 'Mensuel' : 'Journalier'}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                {task.autoRenew ? (
                                                    <Chip size="sm" color="success" variant="flat">Oui</Chip>
                                                ) : (
                                                    <Chip size="sm" color="default" variant="flat">Non</Chip>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="sm"
                                                    color={task.status === 'completed' ? "success" : "default"}
                                                    variant="dot"
                                                >
                                                    {task.status === 'completed' ? 'Terminé' : 'En cours'}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Tooltip content="Supprimer">
                                                        <span
                                                            className="text-lg text-danger cursor-pointer active:opacity-50"
                                                            onClick={() => handleDeleteTask(task.id)}
                                                        >
                                                            <IconTrash size={18} />
                                                        </span>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Aucune tâche trouvée pour cette période.
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Add Task Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Ajouter {taskFrequency === 'daily' ? 'une tâche' : 'un objectif mensuel'}</ModalHeader>
                    <ModalBody>
                        <Input
                            autoFocus
                            label="Titre"
                            placeholder={taskFrequency === 'daily' ? "Ex: Réviser le chapitre 3" : "Ex: Compléter le module React"}
                            variant="bordered"
                            value={newTaskTitle}
                            onValueChange={setNewTaskTitle}
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
