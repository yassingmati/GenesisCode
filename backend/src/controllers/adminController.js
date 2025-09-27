// controllers/adminAuthController.js
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_ADMIN_SECRET or JWT_SECRET is not defined');
  }
  return secret;
};

exports.register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const newAdmin = new Admin({ email, password });
    await newAdmin.save();

    const secret = getJwtSecret();
    const token = jwt.sign({ id: newAdmin._id }, secret, { expiresIn: '1d' });

    // Optionnel : envoyer cookie sécurisé
    // res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });

    res.status(201).json({
      token,
      admin: { id: newAdmin._id, email: newAdmin.email }
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Email invalide' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const secret = getJwtSecret();
    const token = jwt.sign({ id: admin._id }, secret, { expiresIn: '1d' });

    // Optionnel : envoyer cookie sécurisé
    // res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });

    res.json({ token, admin: { id: admin._id, email: admin.email } });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
