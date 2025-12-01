// controllers/adminAuthController.js
const Admin = require('../models/Admin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'devsecret';
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

/**
 * Récupérer tous les comptes admin qui ont accès au panel admin
 * Inclut:
 * - Les admins du modèle Admin
 * - Les utilisateurs User avec le rôle 'admin'
 */
exports.listAdmins = async (req, res) => {
  try {
    // Récupérer les admins du modèle Admin
    const adminAccounts = await Admin.find({})
      .select('email createdAt updatedAt')
      .lean()
      .exec();

    // Récupérer les utilisateurs avec le rôle admin
    const userAdmins = await User.find({ roles: 'admin' })
      .select('email firstName lastName roles isVerified isProfileComplete createdAt updatedAt')
      .lean()
      .exec();

    // Formater les admins du modèle Admin
    const formattedAdminAccounts = adminAccounts.map(admin => ({
      id: admin._id,
      email: admin.email,
      type: 'admin',
      source: 'Admin',
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    }));

    // Formater les utilisateurs avec rôle admin
    const formattedUserAdmins = userAdmins.map(user => ({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      type: 'user',
      source: 'User',
      roles: user.roles,
      isVerified: user.isVerified,
      isProfileComplete: user.isProfileComplete,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    // Combiner les deux listes
    const allAdmins = [
      ...formattedAdminAccounts,
      ...formattedUserAdmins
    ];

    // Trier par date de création (plus récent en premier)
    allAdmins.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      total: allAdmins.length,
      admins: allAdmins,
      summary: {
        adminAccounts: formattedAdminAccounts.length,
        userAdmins: formattedUserAdmins.length
      }
    });
  } catch (err) {
    console.error('listAdmins error:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération des admins' });
  }
};

/**
 * Récupérer un admin spécifique par ID
 */
exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    // Essayer d'abord dans le modèle Admin
    let admin = await Admin.findById(id)
      .select('email createdAt updatedAt')
      .lean()
      .exec();

    if (admin) {
      return res.json({
        success: true,
        admin: {
          id: admin._id,
          email: admin.email,
          type: 'admin',
          source: 'Admin',
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt
        }
      });
    }

    // Sinon, chercher dans User avec rôle admin
    const user = await User.findById(id)
      .select('email firstName lastName roles isVerified isProfileComplete createdAt updatedAt')
      .lean()
      .exec();

    if (user && user.roles && user.roles.includes('admin')) {
      return res.json({
        success: true,
        admin: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          type: 'user',
          source: 'User',
          roles: user.roles,
          isVerified: user.isVerified,
          isProfileComplete: user.isProfileComplete,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }

    return res.status(404).json({ message: 'Admin introuvable' });
  } catch (err) {
    console.error('getAdminById error:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'admin' });
  }
};
