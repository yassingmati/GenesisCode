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
        const loadedTasks = await taskService.getTasks(selectedUser, selectedDate, taskFrequency);
        setTasks([...loadedTasks]);
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim() || !selectedUser) return;
        await taskService.addTask(selectedUser, selectedDate, newTaskTitle, taskFrequency);
        setNewTaskTitle('');
        onOpen(false);
        loadTasks();
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            await taskService.deleteTask(selectedUser, selectedDate, taskId);
            loadTasks();
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
                                    <TableColumn>STATUT</TableColumn>
                                    <TableColumn>ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {tasks.map((task) => (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">{task.title}</TableCell>
                                            <TableCell>
                                                <Chip size="sm" color={task.type === 'auto' ? "warning" : "secondary"} variant="flat">
                                                    {task.type === 'auto' ? 'Auto' : 'Manuel'}
                                                </Chip>
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
                                Aucune tâche pour cette période.
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Add Task Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Ajouter {taskFrequency === 'daily' ? 'une tâche manuelle' : 'un objectif mensuel'}</ModalHeader>
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
