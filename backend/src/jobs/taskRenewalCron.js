const cron = require('node-cron');
const AssignedTask = require('../models/AssignedTask');

console.log('📅 Task Renewal Cron Job initialized');

/**
 * Core logic to renew daily tasks
 * Can be called by cron or manually on startup
 */
const renewDailyTasks = async (source = 'Auto') => {
    console.log(`[${source}] 🔄 Starting daily task renewal check...`);

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Definition of "Today's End" (23:59:59.999)
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // Find all tasks with autoRenew = true and whose period has ended BEFORE today
        // (i.e., tasks from yesterday or earlier that need renewal for today)
        const tasksToRenew = await AssignedTask.find({
            autoRenew: true,
            periodEnd: { $lt: today }
        }).populate('templateId');

        if (tasksToRenew.length === 0) {
            console.log(`[${source}] No expired auto-renewable tasks found.`);
            return { success: true, count: 0 };
        }

        console.log(`[${source}] Found ${tasksToRenew.length} candidates for renewal`);

        const newTasks = [];
        const processedKeys = new Set();

        for (const task of tasksToRenew) {
            // Unique key for idempotency: templateId + childId + periodStart(today)
            const uniqueKey = `${task.templateId._id}-${task.childId}-${today.toISOString()}`;

            if (processedKeys.has(uniqueKey)) continue;
            processedKeys.add(uniqueKey);

            // Double check database for idempotency (in case cron ran twice or manual trigger)
            const existingForToday = await AssignedTask.findOne({
                templateId: task.templateId._id,
                childId: task.childId,
                periodStart: { $gte: today, $lte: todayEnd }
            });

            if (existingForToday) {
                // console.log(`[${source}] Task already exists for today: ${task.templateId.title} (Child: ${task.childId})`);
                continue;
            }

            newTasks.push({
                templateId: task.templateId._id,
                childId: task.childId,
                periodStart: today,
                periodEnd: todayEnd,
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
            console.log(`[${source}] ✅ ${newTasks.length} tasks renewed successfully for ${today.toLocaleDateString()}`);
            return { success: true, count: newTasks.length };
        } else {
            console.log(`[${source}] All candidates already have tasks for today.`);
            return { success: true, count: 0 };
        }
    } catch (error) {
        console.error(`[${source}] ❌ Error during task renewal:`, error);
        return { success: false, error: error.message };
    }
};

// Run immediately on server start to catch up if server was off at midnight
renewDailyTasks('Startup');

// Run every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
    await renewDailyTasks('Cron');
});

// Export for manual testing or external triggers
exports.renewDailyTasks = renewDailyTasks;
exports.triggerRenewal = () => renewDailyTasks('Manual');
