const mongoose = require('mongoose');
const TaskTemplate = require('../models/TaskTemplate');
const AssignedTask = require('../models/AssignedTask');
require('dotenv').config();

const cleanTemplates = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        const uri = process.argv[2] || process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('✅ Connected');

        // The safe list of titles we want to KEEP
        const keepTitles = [
            'Compléter 2 Niveaux',
            'Compléter 5 Exercices',
            'Apprendre pendant 1 heure'
        ];

        console.log('🔍 Identifying templates to remove...');

        // Find all templates NOT in the keep list
        const toDelete = await TaskTemplate.find({
            title: { $nin: keepTitles }
        });

        console.log(`found ${toDelete.length} templates to delete.`);

        if (toDelete.length > 0) {
            const idsToDelete = toDelete.map(t => t._id);

            // 1. Delete the templates
            const deleteResult = await TaskTemplate.deleteMany({
                _id: { $in: idsToDelete }
            });
            console.log(`✅ Deleted ${deleteResult.deletedCount} task templates.`);

            // 2. Delete assigned tasks associated with these deleted templates
            const assignedDeleteResult = await AssignedTask.deleteMany({
                templateId: { $in: idsToDelete }
            });
            console.log(`✅ Deleted ${assignedDeleteResult.deletedCount} assigned tasks linked to deleted templates.`);
        } else {
            console.log('✨ No templates to delete. Clean set found.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

cleanTemplates();
