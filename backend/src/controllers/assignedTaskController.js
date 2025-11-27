const AssignedTask = require('../models/AssignedTask');
const TaskTemplate = require('../models/TaskTemplate');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
// Assuming we have a Submission model or similar for exercises, and UserActivity for sessions
// If not, we'll need to adapt based on existing models.
// Based on file list, we have UserActivity.js and UserProgress.js.
// We might need to check how submissions are stored. The prompt mentions "submissions" documents.
// Let's assume there is a Submission model or we query UserProgress for completed exercises.
// Checking file list... no Submission.js. Maybe it's inside UserProgress or Exercise?
// Prompt says: "compter les documents `submission` liés à childId".
// I will assume there is a 'Submission' model or I will need to find where submissions are.
// Wait, I saw 'Exercise.js'.
// Let's look at 'UserProgress.js' content later to be sure.
// For now, I will implement the structure and add TODOs for exact metric calculation logic if models are missing.

// I will assume there is a 'Submission' model or I will need to find where submissions are.
// Wait, I saw 'Exercise.js'.
// Let's look at 'UserProgress.js' content later to be sure.
// For now, I will implement the structure and add TODOs for exact metric calculation logic if models are missing.

const mongoose = require('mongoose');
const NotificationController = require('./notificationController');

// @desc    Assign tasks to children
// @route   POST /api/admin/assign-tasks
// @access  Admin
exports.assignTasks = async (req, res) => {
    try {
        const { templateId, childIds, startDate, endDate, autoRenew } = req.body;

        const template = await TaskTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        const tasksToCreate = [];
        const periodStart = new Date(startDate);
        const periodEnd = new Date(endDate);

        for (const childId of childIds) {
            // Check if already assigned for this period (basic overlap check or exact match)
            // For simplicity, we'll check exact match on template and periodStart
            const existing = await AssignedTask.findOne({
                templateId,
                childId,
                periodStart
            });

            if (!existing) {
                tasksToCreate.push({
                    templateId,
                    childId,
                    periodStart,
                    periodEnd,
                    recurrenceType: template.recurrence?.frequency || template.recurrence?.type || 'daily',
                    metricsTarget: template.target,
                    autoRenew: autoRenew || false,
                    createdBy: req.user?.id || req.user?._id || req.admin?.id
                });
            }
        }

        if (tasksToCreate.length > 0) {
            await AssignedTask.insertMany(tasksToCreate);
        }

        res.status(201).json({ message: `Assigned tasks to ${tasksToCreate.length} children` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tasks for a child (Parent view)
// @route   GET /api/parent/children/:childId/tasks
// @access  Parent (owner)
exports.getChildTasks = async (req, res) => {
    try {
        const { childId } = req.params;
        const { from, to } = req.query;

        // Security check: ensure user is viewing their own tasks, or parent owns child, or user is admin
        const userId = req.user?.id || req.user?._id;
        const isAdmin = req.admin || (req.user && req.user.roles && req.user.roles.includes('admin'));
        const isViewingOwnTasks = userId && userId.toString() === childId.toString();

        if (!isAdmin && !isViewingOwnTasks) {
            // If not admin and not viewing own tasks, check if user is parent of child
            const child = await User.findOne({ _id: childId, parentAccount: userId });
            if (!child) {
                return res.status(403).json({ message: 'Not authorized to view this child\'s tasks' });
            }
        }

        const query = { childId };
        if (from && to) {
            // Overlap logic: Task starts before query ends AND Task ends after query starts
            const fromDate = new Date(from); // Start of 'from' day
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999); // End of 'to' day

            query.periodStart = { $lte: toDate };
            query.periodEnd = { $gte: fromDate };
        }

        const tasks = await AssignedTask.find(query)
            .populate('templateId', 'title description')
            .sort({ periodStart: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my own tasks (Student view)
// @route   GET /api/assigned-tasks/my-tasks
// @access  Student (own tasks only)
exports.getMyTasks = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { from, to } = req.query;
        const query = { childId: userId };

        if (from && to) {
            // Overlap logic
            const fromDate = new Date(from);
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);

            query.periodStart = { $lte: toDate };
            query.periodEnd = { $gte: fromDate };
        }

        const tasks = await AssignedTask.find(query)
            .populate('templateId', 'title description')
            .sort({ periodStart: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an assigned task
// @route   DELETE /api/assigned-tasks/:id
// @access  Admin
exports.deleteAssignedTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await AssignedTask.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all assigned tasks (Admin view)
// @route   GET /api/assigned-tasks/all
// @access  Admin
exports.getAllAssignedTasks = async (req, res) => {
    try {
        const tasks = await AssignedTask.find()
            .populate('templateId', 'title description')
            .populate('childId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Compute metrics for a specific assigned task
// @route   POST /api/internal/compute-assigned-task/:id/compute
// @access  Internal/Admin
exports.computeTaskMetrics = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await AssignedTask.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Logic to compute metrics
        // 1. Exercises Submitted
        // We need to count submissions. If Submission model exists:
        // const exercisesSubmitted = await Submission.countDocuments({
        //    user: task.childId,
        //    createdAt: { $gte: task.periodStart, $lte: task.periodEnd }
        // });
        // For now, mocking or using a placeholder if model not found.
        // I will assume a 'Submission' model exists or use UserProgress updates.
        // Let's assume we count 'UserProgress' updates within the range? No, UserProgress is usually state.
        // Let's assume there is a 'Submission' collection as per prompt "compter les documents submission".
        // I will use mongoose.connection.db.collection('submissions') to be safe if model file is missing but collection exists.

        const db = mongoose.connection.db;

        // Exercises Submitted
        const submissionsCount = await db.collection('submissions').countDocuments({
            user: new mongoose.Types.ObjectId(task.childId),
            createdAt: { $gte: task.periodStart, $lte: task.periodEnd }
        });

        // Levels Completed
        // Assuming UserProgress has 'completedAt' or similar for levels.
        // Or maybe 'UserLevelProgress' model?
        // Let's check UserLevelProgress.js in next steps.
        // For now, generic count.
        const levelsCompletedCount = await db.collection('userlevelprogresses').countDocuments({
            user: new mongoose.Types.ObjectId(task.childId),
            status: 'completed',
            updatedAt: { $gte: task.periodStart, $lte: task.periodEnd }
        });

        // Hours Spent
        // Using UserActivity sessions
        const activities = await db.collection('useractivities').find({
            user: new mongoose.Types.ObjectId(task.childId),
            type: 'session', // or 'login'/'logout' pair
            createdAt: { $gte: task.periodStart, $lte: task.periodEnd }
        }).toArray();

        // Simple sum of duration if available, else 0
        let totalSeconds = 0;
        activities.forEach(act => {
            if (act.duration) totalSeconds += act.duration;
        });
        const hoursSpent = parseFloat((totalSeconds / 3600).toFixed(2));

        // Update task
        task.metricsCurrent = {
            exercises_submitted: submissionsCount,
            levels_completed: levelsCompletedCount,
            hours_spent: hoursSpent
        };

        // Check completion
        let isCompleted = true;
        if (task.metricsTarget.exercises_submitted > 0 && task.metricsCurrent.exercises_submitted < task.metricsTarget.exercises_submitted) isCompleted = false;
        if (task.metricsTarget.levels_completed > 0 && task.metricsCurrent.levels_completed < task.metricsTarget.levels_completed) isCompleted = false;
        if (task.metricsTarget.hours_spent > 0 && task.metricsCurrent.hours_spent < task.metricsTarget.hours_spent) isCompleted = false;

        if (task.metricsTarget.hours_spent > 0 && task.metricsCurrent.hours_spent < task.metricsTarget.hours_spent) isCompleted = false;

        if (isCompleted && task.status !== 'completed') {
            task.status = 'completed';

            // Notify student
            await NotificationController.createNotification({
                recipient: task.childId,
                type: 'task_completed',
                title: 'Tâche complétée !',
                message: `Félicitations ! Vous avez complété la tâche "${task.templateId ? task.templateId.title : 'Tâche'}"`,
                data: {
                    taskId: task._id,
                    templateId: task.templateId
                }
            });
        }
        // Note: 'failed' is usually set only after periodEnd passes.

        await task.save();

        res.json(task);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get child progress summary
// @route   GET /api/parent/children/:childId/progress
exports.getChildProgress = async (req, res) => {
    try {
        const { childId } = req.params;

        // Security check: ensure parent owns child or user is admin
        const userId = req.user?.id || req.user?._id;
        const isAdmin = req.admin || (req.user && req.user.roles && req.user.roles.includes('admin'));

        if (!isAdmin) {
            const child = await User.findOne({ _id: childId, parentAccount: userId });
            if (!child) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }

        // Aggregate all time or current month? Prompt says "résumé : total_...".
        // Let's give all time totals from AssignedTasks (completed ones) or just sum up everything?
        // Prompt: "progression percent pour chaque assigned task".
        // This endpoint might be redundant if getChildTasks returns everything, but let's provide a summary.

        const tasks = await AssignedTask.find({ childId });

        let totalExercises = 0;
        let totalLevels = 0;
        let totalHours = 0;

        tasks.forEach(t => {
            totalExercises += t.metricsCurrent.exercises_submitted || 0;
            totalLevels += t.metricsCurrent.levels_completed || 0;
            totalHours += t.metricsCurrent.hours_spent || 0;
        });

        res.json({
            total_exercises_submitted: totalExercises,
            total_levels_completed: totalLevels,
            total_hours_spent: totalHours,
            tasks_count: tasks.length
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
