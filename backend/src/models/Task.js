const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['daily', 'monthly'],
        default: 'daily',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    date: {
        type: Date,
        default: Date.now
    },
    xpReward: {
        type: Number,
        default: 10
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Parent who created the task
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
taskSchema.index({ user: 1, date: 1, type: 1 });

module.exports = mongoose.model('Task', taskSchema);
