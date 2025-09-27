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
  // si password a select:false, dans certains cas il faut récupérer explicitement le champ
  const hash = this.password || (await mongoose.model('Admin').findById(this._id).select('+password')).password;
  return bcrypt.compare(candidate, hash);
};

module.exports = mongoose.model('Admin', adminSchema);
