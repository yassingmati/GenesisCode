const TaskTemplate = require('../models/TaskTemplate');
const mongoose = require('mongoose');

// @desc    Create a new task template
// @route   POST /api/admin/task-templates
// @access  Admin
exports.createTaskTemplate = async (req, res) => {
    try {
        console.log('📝 Creating task template, req.body:', req.body);
        console.log('📝 req.user:', req.user);
        console.log('📝 req.admin:', req.admin);

        const { title, description, recurrence, metrics, target, active } = req.body;

        // Vérifier la connexion MongoDB
        if (mongoose.connection.readyState !== 1) {
            console.error('❌ MongoDB not connected');
            return res.status(500).json({ message: 'Database connection error' });
        }

        // Normaliser le champ recurrence pour utiliser frequency
        let normalizedRecurrence = recurrence;
        if (recurrence && typeof recurrence === 'object') {
            // Si recurrence.type existe (ancien format), le convertir en frequency
            if (recurrence.type && !recurrence.frequency) {
                normalizedRecurrence = {
                    frequency: recurrence.type
                };
            } else if (!recurrence.frequency && typeof recurrence === 'string') {
                // Si recurrence est une string, la traiter comme frequency
                normalizedRecurrence = {
                    frequency: recurrence
                };
            }
        } else if (typeof recurrence === 'string') {
            // Si recurrence est directement une string (daily/monthly)
            normalizedRecurrence = {
                frequency: recurrence
            };
        }

        const taskTemplate = await TaskTemplate.create({
            title,
            description,
            recurrence: normalizedRecurrence,
            metrics,
            target,
            active
        });

        console.log('✅ Task template created:', taskTemplate._id);
        res.status(201).json(taskTemplate);
    } catch (error) {
        console.error('❌ Error creating task template:', error);
        res.status(400).json({
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get all task templates
// @route   GET /api/admin/task-templates
// @access  Admin
exports.getTaskTemplates = async (req, res) => {
    try {
        console.log('📋 Getting task templates');
        console.log('📋 req.user:', req.user ? { id: req.user.id, email: req.user.email, roles: req.user.roles } : 'null');
        console.log('📋 req.admin:', req.admin ? { id: req.admin.id, email: req.admin.email } : 'null');

        // Vérifier la connexion MongoDB
        const mongoState = mongoose.connection.readyState;
        console.log('📊 MongoDB connection state:', mongoState, '(1=connected)');
        if (mongoState !== 1) {
            console.error('❌ MongoDB not connected, state:', mongoState);
            return res.status(500).json({ message: 'Database connection error' });
        }

        // Vérifier que le modèle est bien chargé
        if (!TaskTemplate) {
            console.error('❌ TaskTemplate model not loaded');
            return res.status(500).json({ message: 'TaskTemplate model not available' });
        }

        // Vérifier que le modèle est enregistré dans Mongoose
        if (!mongoose.models.TaskTemplate) {
            console.error('❌ TaskTemplate model not registered in mongoose.models');
            return res.status(500).json({ message: 'TaskTemplate model not registered' });
        }

        console.log('✅ TaskTemplate model is loaded and registered');

        // Essayer de trouver les templates
        let templates;
        try {
            // Utiliser lean() pour éviter les problèmes de migration avec les anciens documents
            templates = await TaskTemplate.find({}).lean().sort({ createdAt: -1 });

            // Normaliser les templates pour s'assurer que recurrence.frequency existe
            templates = templates.map(template => {
                // Si recurrence est une string (ancien format ou erreur), le convertir en objet
                if (typeof template.recurrence === 'string') {
                    template.recurrence = { frequency: template.recurrence };
                }
                // Si recurrence est un objet mais sans frequency (ancien format avec type)
                else if (template.recurrence && typeof template.recurrence === 'object' && !template.recurrence.frequency) {
                    template.recurrence.frequency = template.recurrence.type || 'daily';
                }
                // Si recurrence n'existe pas
                else if (!template.recurrence) {
                    template.recurrence = { frequency: 'daily' };
                }
                return template;
            });

            console.log('✅ Found', templates.length, 'task templates');
        } catch (dbError) {
            console.error('❌ Database error in getTaskTemplates:', dbError);
            console.error('   Error name:', dbError.name);
            console.error('   Error message:', dbError.message);
            console.error('   Error stack:', dbError.stack);
            return res.status(500).json({
                message: 'Database error',
                error: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
                stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
            });
        }

        res.json(templates);
    } catch (error) {
        console.error('❌ Error in getTaskTemplates:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Update a task template
// @route   PUT /api/admin/task-templates/:id
// @access  Admin
exports.updateTaskTemplate = async (req, res) => {
    try {
        const template = await TaskTemplate.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Task template not found' });
        }

        // Normaliser le champ recurrence si présent
        let updateData = { ...req.body };
        if (updateData.recurrence && typeof updateData.recurrence === 'object') {
            if (updateData.recurrence.type && !updateData.recurrence.frequency) {
                updateData.recurrence = {
                    frequency: updateData.recurrence.type
                };
            }
        } else if (typeof updateData.recurrence === 'string') {
            updateData.recurrence = {
                frequency: updateData.recurrence
            };
        }

        const updatedTemplate = await TaskTemplate.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json(updatedTemplate);
    } catch (error) {
        console.error('❌ Error updating task template:', error);
        res.status(400).json({
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Delete (soft delete/deactivate) a task template
// @route   DELETE /api/admin/task-templates/:id
// @access  Admin
exports.deleteTaskTemplate = async (req, res) => {
    try {
        const template = await TaskTemplate.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Task template not found' });
        }

        // Soft delete by setting active to false
        template.active = false;
        await template.save();

        console.log('✅ Task template deactivated:', template._id);
        res.json({ message: 'Task template deactivated' });
    } catch (error) {
        console.error('❌ Error deleting task template:', error);
        res.status(500).json({
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
