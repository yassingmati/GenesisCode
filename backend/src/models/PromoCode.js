const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed_amount'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'TND'
    },
    maxUses: {
        type: Number,
        default: null // null = illimité
    },
    usedCount: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        default: null
    },
    active: {
        type: Boolean,
        default: true
    },
    applicablePlans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan'
    }] // Si vide, applicable à tous les plans
}, {
    timestamps: true
});

// Méthode pour vérifier la validité
promoCodeSchema.methods.isValid = function () {
    if (!this.active) return false;
    if (this.expiresAt && new Date() > this.expiresAt) return false;
    if (this.maxUses !== null && this.usedCount >= this.maxUses) return false;
    return true;
};

module.exports = mongoose.model('PromoCode', promoCodeSchema);
