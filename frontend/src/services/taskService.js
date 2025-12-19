import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.REACT_APP_API_URL || 'https://codegenesis-backend.onrender.com/api';

const getAuthToken = async () => {
    // 1. Check for adminToken first (for admin routes)
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) return adminToken;

    // 2. Check for token in localStorage (set by AdminLogin)
    const localToken = localStorage.getItem('token');
    if (localToken) return localToken;

    // 3. Fallback to Firebase Auth
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
};

// --- New Advanced Task Management API ---

// Admin: Task Templates
export const getTaskTemplates = async () => {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/admin/task-templates`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createTaskTemplate = async (templateData) => {
    const token = await getAuthToken();
    const response = await axios.post(`${API_URL}/admin/task-templates`, templateData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateTaskTemplate = async (id, templateData) => {
    const token = await getAuthToken();
    const response = await axios.put(`${API_URL}/admin/task-templates/${id}`, templateData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteTaskTemplate = async (id) => {
    const token = await getAuthToken();
    const response = await axios.delete(`${API_URL}/admin/task-templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Admin: Assign Tasks
export const assignTasks = async (assignmentData) => {
    const token = await getAuthToken();
    const response = await axios.post(`${API_URL}/assigned-tasks/assign`, assignmentData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getAssignedTasks = async () => {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/assigned-tasks/all`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteAssignedTask = async (taskId) => {
    const token = await getAuthToken();
    const response = await axios.delete(`${API_URL}/assigned-tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Parent: Child Tasks
export const getChildTasks = async (childId, from, to) => {
    const token = await getAuthToken();
    let query = '';
    if (from && to) query = `?from=${from}&to=${to}`;

    const response = await axios.get(`${API_URL}/assigned-tasks/children/${childId}/tasks${query}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getChildProgress = async (childId) => {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/assigned-tasks/children/${childId}/progress`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};


// --- Legacy / Simple Task Management API (Restored for compatibility) ---
// These functions were used by AdminTaskManagement.jsx and TaskManagementWidget.jsx
// We map them to the new system or keep them as is if they used a different endpoint.
// Assuming they used a generic /api/tasks endpoint which I might have missed or overwritten.
// If the backend /api/tasks endpoint still exists (it was in taskRoutes.js), we can just call it.

export const getTasks = async (userId, date, type = 'daily') => {
    const token = await getAuthToken();
    // Use the existing /api/tasks endpoint if available, or map to new assigned tasks
    // Since I saw taskRoutes.js with getTasks, I assume it's still there.
    // However, the old signature might be different.
    // AdminTaskManagement calls: getTasks(selectedUser, selectedDate, taskFrequency)
    // TaskManagementWidget calls: getTasks(childId, selectedDate, taskFrequency)

    // Let's try to use the legacy endpoint if it exists
    try {
        const response = await axios.get(`${API_URL}/tasks`, {
            params: { userId, date, type },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.warn("Legacy getTasks failed, returning empty", error);
        return [];
    }
};

export const addTask = async (taskDataOrUserId, date, title, type) => {
    const token = await getAuthToken();
    // AdminTaskManagement calls: addTask(selectedUser, selectedDate, newTaskTitle, taskFrequency)
    // TaskManagementWidget calls: addTask({ userId, date, title, description, type, xpReward })

    let payload = {};
    if (typeof taskDataOrUserId === 'object') {
        payload = taskDataOrUserId;
    } else {
        payload = {
            user: taskDataOrUserId, // Map userId to user field expected by backend
            date,
            title,
            type
        };
    }

    const response = await axios.post(`${API_URL}/tasks`, payload, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteTask = async (userIdOrTaskId, date, taskId) => {
    const token = await getAuthToken();
    // AdminTaskManagement calls: deleteTask(selectedUser, selectedDate, taskId)
    // TaskManagementWidget calls: deleteTask(taskId)

    let idToDelete = taskId;
    if (!taskId) {
        idToDelete = userIdOrTaskId; // If only one arg passed
    }

    const response = await axios.delete(`${API_URL}/tasks/${idToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Export object for default import compatibility
export const taskService = {
    getTaskTemplates,
    createTaskTemplate,
    updateTaskTemplate,
    deleteTaskTemplate,
    assignTasks,
    getAssignedTasks,
    deleteAssignedTask,
    getAssignedTasks,
    deleteAssignedTask,
    getChildTasks,
    getChildProgress,
    getTasks,
    addTask,
    deleteTask
};

export default taskService;
