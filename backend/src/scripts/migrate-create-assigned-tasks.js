const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const TaskTemplate = require('../models/TaskTemplate');
const AssignedTask = require('../models/AssignedTask');
const User = require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const migrate = async () => {
    await connectDB();

    try {
        console.log('Starting migration: Assigning tasks to students...');

        const templates = await TaskTemplate.find({ active: true });
        const students = await User.find({ userType: 'student' });

        console.log(`Found ${templates.length} active templates and ${students.length} students.`);

        let createdCount = 0;

        for (const tpl of templates) {
            // Determine period based on recurrence
            const now = new Date();
            let periodStart, periodEnd;

            if (tpl.recurrence.type === 'daily') {
                periodStart = new Date(now.setHours(0, 0, 0, 0));
                periodEnd = new Date(now.setHours(23, 59, 59, 999));
            } else if (tpl.recurrence.type === 'monthly') {
                periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
                periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            }

            for (const s of students) {
                // Check if already assigned
                const existing = await AssignedTask.findOne({
                    templateId: tpl._id,
                    childId: s._id,
                    periodStart: periodStart
                });

                if (!existing) {
                    await AssignedTask.create({
                        templateId: tpl._id,
                        childId: s._id,
                        periodStart,
                        periodEnd,
                        recurrenceType: tpl.recurrence.type,
                        metricsTarget: tpl.target,
                        status: 'pending'
                    });
                    createdCount++;
                }
            }
        }

        console.log(`Migration completed. Created ${createdCount} assigned tasks.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
