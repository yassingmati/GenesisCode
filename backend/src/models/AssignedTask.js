const mongoose = require('mongoose');

const assignedTaskSchema = new mongoose.Schema({
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaskTemplate',
        required: true
    },
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    periodStart: {
        type: Date,
        required: true
    },
    periodEnd: {
        type: Date,
        required: true
    },
    recurrenceType: {
        type: String,
        enum: ['daily', 'monthly'],
        required: true
    },
    metricsCurrent: {
        exercises_submitted: { type: Number, default: 0 },
        levels_completed: { type: Number, default: 0 },
        hours_spent: { type: Number, default: 0 }
    },
    metricsTarget: {
        exercises_submitted: { type: Number, default: 0 },
        levels_completed: { type: Number, default: 0 },
        hours_spent: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'failed'],
        default: 'pending'
    },
    completedAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    autoRenew: {
        type: Boolean,
        default: false,
        description: 'If true, the task automatically renews daily until deleted'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
assignedTaskSchema.index({ childId: 1, periodStart: 1, periodEnd: 1 });
assignedTaskSchema.index({ templateId: 1 });
assignedTaskSchema.index({ status: 1 });

module.exports = mongoose.model('AssignedTask', assignedTaskSchema);
