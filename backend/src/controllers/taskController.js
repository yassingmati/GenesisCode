const Task = require('../models/Task');
const User = require('../models/User');

// Get tasks for a user
exports.getTasks = async (req, res) => {
    try {
        const { userId, date, type } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const query = { user: userId };
        if (type) query.type = type;

        let queryDate = new Date();
        if (date) queryDate = new Date(date);

        // Date ranges
        const startOfDay = new Date(queryDate); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(queryDate); endOfDay.setHours(23, 59, 59, 999);

        if (type === 'daily' || !type) {
            query.date = { $gte: startOfDay, $lte: endOfDay };
        } else if (type === 'monthly') {
            const startOfMonth = new Date(queryDate.getFullYear(), queryDate.getMonth(), 1);
            const endOfMonth = new Date(queryDate.getFullYear(), queryDate.getMonth() + 1, 0, 23, 59, 59, 999);
            query.date = { $gte: startOfMonth, $lte: endOfMonth };
        }

        let tasks = await Task.find(query).sort({ createdAt: -1 });

        // --- Auto-Renewal Logic (Lazy) ---
        // If requesting TODAY's daily tasks and none exist, check yesterday/previous days
        const isToday = new Date().toDateString() === queryDate.toDateString();
        if ((type === 'daily' || !type) && tasks.length === 0 && isToday) {
            // Find the most recent daily tasks for this user
            const lastTasks = await Task.find({
                user: userId,
                type: 'daily',
                date: { $lt: startOfDay } // Strictly before today
            })
                .sort({ date: -1 })
                .limit(20); // Limit to avoid processing too many

            if (lastTasks.length > 0) {
                // Get the date of the most recent task found
                const lastDate = lastTasks[0].date;
                const tasksToRenew = lastTasks.filter(t =>
                    t.date.toDateString() === lastDate.toDateString()
                );

                // Clone them for today
                const newTasks = await Promise.all(tasksToRenew.map(async (oldTask) => {
                    const newTask = new Task({
                        user: userId,
                        title: oldTask.title,
                        description: oldTask.description,
                        type: 'daily',
                        date: new Date(), // Set to NOW
                        xpReward: oldTask.xpReward,
                        createdBy: oldTask.createdBy,
                        status: 'pending' // Reset status
                    });
                    return await newTask.save();
                }));

                tasks = newTasks; // Return the newly created tasks
            }
        }

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const { userId, title, description, type, date, xpReward } = req.body;
        const createdBy = req.user?.id || req.user?._id || req.admin?.id; // Parent/Admin ID from auth middleware

        if (!userId || !title) {
            return res.status(400).json({ message: 'User ID and Title are required' });
        }

        const newTask = new Task({
            user: userId,
            title,
            description,
            type: type || 'daily',
            date: date || new Date(),
            xpReward: xpReward || 10,
            createdBy,
            status: 'pending'
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
};

// Update a task
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const task = await Task.findByIdAndUpdate(id, updates, { new: true });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
};
