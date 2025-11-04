// models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false  // password ne sera pas retourné par défaut
  }
}, { timestamps: true });

// Hash le mot de passe avant de sauvegarder
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Méthode pour comparer le mot de passe
adminSchema.methods.comparePassword = async function (candidate) {
  try {
    // Si password a select:false, dans certains cas il faut récupérer explicitement le champ
    let hash = this.password;
    if (!hash) {
      const adminWithPassword = await mongoose.model('Admin').findById(this._id).select('+password');
      if (!adminWithPassword || !adminWithPassword.password) {
        throw new Error('Mot de passe non trouvé pour cet admin');
      }
      hash = adminWithPassword.password;
    }
    return await bcrypt.compare(candidate, hash);
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

module.exports = mongoose.model('Admin', adminSchema);
