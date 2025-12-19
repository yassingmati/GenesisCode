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
    // IMPORTANT: select('+password') est nécessaire car password a select:false dans le schéma
    const admin = await Admin.findOne({ email }).select('+password');
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

/**
 * MIGRATION TEMPORAIRE: Réinitialiser les plans depuis les catégories
 */
exports.migratePlans = async (req, res) => {
  try {
    const Category = require('../models/Category');
    const Plan = require('../models/Plan');

    // Sécurité temporaire
    if (req.body.secretKey !== 'migration-secret-123') {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    console.log('🗑️ Suppression des plans existants...');
    await Plan.deleteMany({});

    console.log('📋 Récupération des catégories...');
    const categories = await Category.find({});

    const newPlans = [];
    const DEFAULT_PRICE = 30000; // 30.00 TND
    const DEFAULT_CURRENCY = 'TND';

    function generateSlug(name) {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    for (const category of categories) {
      const nameFr = category.translations?.fr?.name || 'Catégorie Inconnue';
      const slug = generateSlug(nameFr);
      const planId = `plan-${slug}`;

      const plan = new Plan({
        _id: planId,
        name: nameFr,
        description: `Accès complet aux cours de ${nameFr}`,
        priceMonthly: DEFAULT_PRICE,
        currency: DEFAULT_CURRENCY,
        interval: 'month',
        features: [
          'Accès illimité aux cours',
          'Exercices interactifs',
          'Suivi de progression',
          'Support prioritaire'
        ],
        active: true,
        // Access Control
        type: 'category',
        targetId: category._id
      });

      newPlans.push(plan);
    }

    if (newPlans.length > 0) {
      await Plan.insertMany(newPlans);
    }

    res.json({
      success: true,
      message: `Migration terminée. ${newPlans.length} plans créés avec contrôle d'accès.`,
      plans: newPlans.map(p => ({ id: p._id, targetId: p.targetId }))
    });

  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Créer un code promo
 */
exports.createPromoCode = async (req, res) => {
  try {
    const PromoCode = require('../models/PromoCode');
    const { code, discountType, discountValue, expirationDate, maxUsage, active, applicablePlans } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const existing = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Ce code promo existe déjà' });
    }

    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      type: discountType,
      value: discountValue,
      expiresAt: expirationDate,
      maxUses: maxUsage,
      active: active !== undefined ? active : true,
      applicablePlans
    });

    res.status(201).json({ success: true, promo });
  } catch (err) {
    console.error('createPromoCode error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Récupérer tous les codes promo
 */
exports.getPromoCodes = async (req, res) => {
  try {
    const PromoCode = require('../models/PromoCode');
    const promoCodes = await PromoCode.find({}).sort({ createdAt: -1 });
    res.json({ success: true, promoCodes });
  } catch (err) {
    console.error('getPromoCodes error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Récupérer tous les utilisateurs
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('firstName lastName email roles isVerified avatar createdAt')
      .sort({ createdAt: -1 })
      .limit(100); // Limite pour éviter la surcharge

    res.json({ success: true, users });
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
