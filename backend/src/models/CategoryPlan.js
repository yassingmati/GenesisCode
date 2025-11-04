// src/models/CategoryPlan.js
const mongoose = require('mongoose');

const categoryPlanSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    unique: true
  },
  
  // Informations de prix
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'TND',
    required: true
  },
  
  // Type de paiement
  paymentType: {
    type: String,
    enum: ['one_time', 'monthly', 'yearly'],
    default: 'one_time'
  },
  
  // Durée d'accès (en jours) pour les paiements uniques
  accessDuration: {
    type: Number,
    default: 365 // 1 an par défaut
  },
  
  // Statut du plan
  active: {
    type: Boolean,
    default: true
  },
  
  // Description multilingue
  translations: {
    fr: {
      name: { type: String, required: true },
      description: { type: String, default: '' }
    },
    en: {
      name: { type: String, required: true },
      description: { type: String, default: '' }
    },
    ar: {
      name: { type: String, required: true },
      description: { type: String, default: '' }
    }
  },
  
  // Fonctionnalités incluses
  features: [{
    type: String
  }],
  
  // Ordre d'affichage
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
categoryPlanSchema.index({ category: 1, active: 1 });
categoryPlanSchema.index({ active: 1, order: 1 });

// Méthodes statiques
categoryPlanSchema.statics.findByCategory = function(categoryId) {
  return this.findOne({ category: categoryId, active: true }).populate('category');
};

categoryPlanSchema.statics.findAllActive = function() {
  return this.find({ active: true }).populate('category').sort({ order: 1 });
};

// Méthodes d'instance
categoryPlanSchema.methods.getLocalizedInfo = function(language = 'fr') {
  const translation = this.translations[language] || this.translations.fr;
  return {
    id: this._id,
    category: this.category,
    price: this.price,
    currency: this.currency,
    paymentType: this.paymentType,
    accessDuration: this.accessDuration,
    name: translation.name,
    description: translation.description,
    features: this.features,
    order: this.order
  };
};

module.exports = mongoose.model('CategoryPlan', categoryPlanSchema);







