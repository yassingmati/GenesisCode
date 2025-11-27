const cron = require('node-cron');
const AssignedTask = require('../models/AssignedTask');

console.log('📅 Task Renewal Cron Job initialized');

// Run every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] 🔄 Starting daily task renewal...');

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find all tasks with autoRenew = true and whose period has ended
        const tasksToRenew = await AssignedTask.find({
            autoRenew: true,
            periodEnd: { $lt: today }
        }).populate('templateId');

        console.log(`[Cron] Found ${tasksToRenew.length} tasks to renew`);

        const newTasks = [];

        for (const task of tasksToRenew) {
            // Create a new instance for today
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);

            newTasks.push({
                templateId: task.templateId._id,
                childId: task.childId,
                periodStart: today,
                periodEnd: tomorrow,
                recurrenceType: task.recurrenceType,
                metricsTarget: task.metricsTarget,
                metricsCurrent: {
                    exercises_submitted: 0,
                    levels_completed: 0,
                    hours_spent: 0
                },
                status: 'pending',
                autoRenew: true,
                createdBy: task.createdBy
            });
        }

        if (newTasks.length > 0) {
            await AssignedTask.insertMany(newTasks);
            console.log(`[Cron] ✅ ${newTasks.length} tasks renewed successfully`);
        } else {
            console.log('[Cron] No tasks to renew');
        }
    } catch (error) {
        console.error('[Cron] ❌ Error during task renewal:', error);
    }
});

// Also provide a manual trigger function for testing
exports.triggerRenewal = async () => {
    console.log('[Manual] Triggering task renewal...');

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tasksToRenew = await AssignedTask.find({
            autoRenew: true,
            periodEnd: { $lt: today }
        }).populate('templateId');

        console.log(`[Manual] Found ${tasksToRenew.length} tasks to renew`);

        const newTasks = [];

        for (const task of tasksToRenew) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);

            newTasks.push({
                templateId: task.templateId._id,
                childId: task.childId,
                periodStart: today,
                periodEnd: tomorrow,
                recurrenceType: task.recurrenceType,
                metricsTarget: task.metricsTarget,
                metricsCurrent: {
                    exercises_submitted: 0,
                    levels_completed: 0,
                    hours_spent: 0
                },
                status: 'pending',
                autoRenew: true,
                createdBy: task.createdBy
            });
        }

        if (newTasks.length > 0) {
            await AssignedTask.insertMany(newTasks);
            console.log(`[Manual] ✅ ${newTasks.length} tasks renewed`);
            return { success: true, count: newTasks.length };
        }

        return { success: true, count: 0 };
    } catch (error) {
        console.error('[Manual] ❌ Error:', error);
        return { success: false, error: error.message };
    }
};
