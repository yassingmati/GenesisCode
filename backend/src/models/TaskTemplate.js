const mongoose = require('mongoose');

const taskTemplateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    ownerRole: {
        type: String,
        default: 'admin'
    },
    recurrence: {
        frequency: {
            type: String,
            enum: ['daily', 'monthly'],
            default: 'daily'
        }
    },
    metrics: [{
        type: String,
        enum: ['exercises_submitted', 'levels_completed', 'hours_spent']
    }],
    target: {
        exercises_submitted: { type: Number, default: 0 },
        levels_completed: { type: Number, default: 0 },
        hours_spent: { type: Number, default: 0 }
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Middleware pre-save pour normaliser recurrence (migration depuis l'ancien format)
taskTemplateSchema.pre('save', function(next) {
    // Si recurrence existe mais pas frequency, utiliser 'daily' par défaut
    if (this.recurrence && !this.recurrence.frequency) {
        this.recurrence.frequency = 'daily';
    }
    // S'assurer que recurrence existe
    if (!this.recurrence) {
        this.recurrence = { frequency: 'daily' };
    }
    next();
});


module.exports = mongoose.model('TaskTemplate', taskTemplateSchema);
