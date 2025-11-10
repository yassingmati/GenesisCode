// models/PasswordResetToken.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const passwordResetTokenSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    ref: 'User',
    index: true
  },
  token: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  expires: { 
    type: Date, 
    required: true,
    default: () => Date.now() + 3600 * 1000, // 1 heure
    index: { expireAfterSeconds: 0 } // TTL index pour supprimer automatiquement les tokens expirés
  },
  used: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index composé pour recherche rapide
passwordResetTokenSchema.index({ userId: 1, used: 1 });
passwordResetTokenSchema.index({ token: 1, used: 1 });

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

