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
    const token = jwt.sign({ id: newAdmin._id }, secret, { expiresIn: '7d' });

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
    const token = jwt.sign({ id: admin._id }, secret, { expiresIn: '7d' });

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
  }
};

/**
 * Récupérer toutes les catégories (pour les dropdowns admin)
 */
exports.getAllCategories = async (req, res) => {
  try {
    const Category = require('../models/Category');
    const categories = await Category.find({}).sort({ order: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    console.error('getAllCategories error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * --- GESTION DES PLANS ---
 */

exports.getAllPlans = async (req, res) => {
  try {
    const Plan = require('../models/Plan');
    const plans = await Plan.find({}).sort({ createdAt: -1 });
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const Plan = require('../models/Plan');
    const {
      _id, name, priceMonthly, currency, type, targetId, interval,
      features, translations
    } = req.body;

    // Normalize type for refPath/Enum (Category, Path, global)
    let normalizedType = type;
    if (type && type.toLowerCase() === 'category') normalizedType = 'Category';
    if (type && type.toLowerCase() === 'path') normalizedType = 'Path';
    if (type && type.toLowerCase() === 'global') normalizedType = 'global';

    const existing = await Plan.findById(_id);
    if (existing) return res.status(400).json({ message: 'ID du plan déjà utilisé' });

    const newPlan = new Plan({
      _id,
      name,
      priceMonthly,
      currency,
      type: normalizedType,
      targetId,
      interval,
      features,
      translations
    });

    await newPlan.save();
    res.status(201).json({ success: true, plan: newPlan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const Plan = require('../models/Plan');
    const { id } = req.params;
    const updates = req.body;

    // Normalize type if present
    if (updates.type) {
      if (updates.type.toLowerCase() === 'category') updates.type = 'Category';
      if (updates.type.toLowerCase() === 'path') updates.type = 'Path';
      if (updates.type.toLowerCase() === 'global') updates.type = 'global';
    }

    // Prevent ID Update
    delete updates._id;

    const updatedPlan = await Plan.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedPlan) return res.status(404).json({ message: 'Plan introuvable' });

    res.json({ success: true, plan: updatedPlan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const Plan = require('../models/Plan');
    const { id } = req.params;

    const deleted = await Plan.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Plan introuvable' });

    res.json({ success: true, message: 'Plan supprimé' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * --- HISTORIQUE DES PAIEMENTS ---
 */
exports.getAllPayments = async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments();
    const payments = await Payment.find({})
      .populate('user', 'email firstName lastName')
      .populate('plan') // Polymorphic populate
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Normalize data for frontend
    const normalizedPayments = payments.map(p => {
      let planName = 'Plan Inconnu';
      let planType = 'unknown';

      if (p.plan) {
        if (p.planModel === 'CategoryPlan') {
          planName = p.plan.translations?.fr?.name || p.plan.translations?.en?.name || 'Plan Catégorie';
          planType = 'CategoryPlan';
        } else {
          planName = p.plan.name || 'Plan Global';
          planType = 'Plan';
        }
      }

      // Return a plain object structure matching frontend expectations
      return {
        _id: p._id,
        konnectPaymentId: p.konnectPaymentId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        user: p.user,
        plan: {
          _id: p.plan?._id,
          name: planName,
          type: planType
        }
      };
    });

    res.json({
      success: true,
      payments: normalizedPayments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('getAllPayments error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * --- GESTION UTILISATEURS AVANCÉE ---
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roles } = req.body; // e.g., ['admin', 'student']

    const user = await User.findByIdAndUpdate(id, { roles }, { new: true });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'Utilisateur supprimé définitivement' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * --- DASHBOARD STATS ---
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const User = require('../models/User');
    const Payment = require('../models/Payment');
    const Category = require('../models/Category');
    const Path = require('../models/Path');
    const Level = require('../models/Level');

    const [
      totalUsers,
      totalStudents,
      totalParents,
      totalCategories,
      totalPaths,
      totalLevels,
      levelsWithContent,
      payments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ userType: 'student' }),
      User.countDocuments({ userType: 'parent' }),
      Category.countDocuments(),
      Path.countDocuments(),
      Level.countDocuments(),
      Level.find({}).select('pdfs videos'),
      Payment.find({ status: 'completed' })
    ]);

    // Calculate content (pdfs/videos)
    let totalPDFs = 0;
    let totalVideos = 0;

    levelsWithContent.forEach(level => {
      // Logic: If pdfs.fr is a string (path), counts as 1.
      // We assume if one language exists, the resource exists.
      // Or we can count all language variants. Let's count "resources" (so if avail in 3 langs, maybe just 1 resource? or 3?)
      // User likely wants "Combien de PDF j'ai uploadé".
      // Let's count non-empty paths in any language for now as separate files if they are distinct,
      // but usually the schema is { fr: 'path', en: 'path' }.
      // Let's count "Active Content Items".
      if (level.pdfs?.fr || level.pdfs?.en || level.pdfs?.ar) totalPDFs++;
      if (level.videos?.fr || level.videos?.en || level.videos?.ar) totalVideos++;
    });

    // Revenue calc
    const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0) / 1000; // Convert millimes to TND

    res.json({
      users: {
        total: totalUsers,
        students: totalStudents,
        parents: totalParents
      },
      content: {
        categories: totalCategories,
        paths: totalPaths,
        levels: totalLevels,
        pdfs: totalPDFs,
        videos: totalVideos
      },
      payments: totalRevenue.toFixed(2),
      // Legacy support if frontend expects flat structure initially (we will update frontend immediately though)
      // totalCourses below is actually Categories count as placeholder in previous version
      courses: totalCategories
    });
  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * --- GESTION ACCÈS CATÉGORIES (SUBSCRIPTIONS) ---
 */
exports.getAllCategoryAccesses = async (req, res) => {
  try {
    const CategoryAccess = require('../models/CategoryAccess');
    const User = require('../models/User'); // Ensure User model is available

    const { page = 1, limit = 50, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    // Si recherche par email ou nom utilisateur
    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      // On cherche les accès appartenant à ces users
      query.user = { $in: users.map(u => u._id) };
    }

    const total = await CategoryAccess.countDocuments(query);
    const accesses = await CategoryAccess.find(query)
      .populate('user', 'email firstName lastName')
      .populate('category') // To get translations
      .populate('categoryPlan', 'name priceMonthly currency') // Optional if we want plan details
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    // Normalize for frontend
    const normalizedAccesses = accesses.map(acc => {
      const accObj = acc.toObject();

      // Flatten category name
      let categoryName = 'Unknown Category';
      if (acc.category && acc.category.translations) {
        categoryName = acc.category.translations.fr?.name || acc.category.translations.en?.name || 'Category';
      }

      return {
        ...accObj,
        categoryName,
        user: acc.user
      };
    });

    res.json({
      success: true,
      accesses: normalizedAccesses,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('getAllCategoryAccesses error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * ADMIN: Créer un CategoryAccess manuellement
 */
exports.createCategoryAccess = async (req, res) => {
  try {
    const CategoryAccess = require('../models/CategoryAccess');
    const { userId, categoryId, categoryPlan, accessType, status, expiresAt } = req.body;

    if (!userId || !categoryId || !accessType) {
      return res.status(400).json({
        success: false,
        message: 'userId, categoryId et accessType sont requis'
      });
    }

    // Check if access already exists
    const existing = await CategoryAccess.findOne({
      user: userId,
      category: categoryId,
      status: 'active'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Un accès actif existe déjà pour cet utilisateur et cette catégorie'
      });
    }

    const accessData = {
      user: userId,
      category: categoryId,
      categoryPlan: categoryPlan || 'manual-access',
      accessType: accessType || 'admin',
      status: status || 'active',
      purchasedAt: new Date()
    };

    // Set expiration if provided
    if (expiresAt) {
      accessData.expiresAt = new Date(expiresAt);
    }

    const newAccess = await CategoryAccess.create(accessData);

    // Populate for response
    const populatedAccess = await CategoryAccess.findById(newAccess._id)
      .populate('user', 'email firstName lastName')
      .populate('category');

    res.status(201).json({
      success: true,
      message: 'Accès créé avec succès',
      access: populatedAccess
    });
  } catch (err) {
    console.error('createCategoryAccess error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * ADMIN: Mettre à jour un CategoryAccess
 */
exports.updateCategoryAccess = async (req, res) => {
  try {
    const CategoryAccess = require('../models/CategoryAccess');
    const { id } = req.params;
    const { status, expiresAt, accessType } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (expiresAt) updateData.expiresAt = new Date(expiresAt);
    if (accessType) updateData.accessType = accessType;

    const updatedAccess = await CategoryAccess.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('user', 'email firstName lastName')
      .populate('category');

    if (!updatedAccess) {
      return res.status(404).json({
        success: false,
        message: 'Accès introuvable'
      });
    }

    res.json({
      success: true,
      message: 'Accès mis à jour',
      access: updatedAccess
    });
  } catch (err) {
    console.error('updateCategoryAccess error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * ADMIN: Supprimer un CategoryAccess
 */
exports.deleteCategoryAccess = async (req, res) => {
  try {
    const CategoryAccess = require('../models/CategoryAccess');
    const { id } = req.params;

    const deletedAccess = await CategoryAccess.findByIdAndDelete(id);

    if (!deletedAccess) {
      return res.status(404).json({
        success: false,
        message: 'Accès introuvable'
      });
    }

    res.json({
      success: true,
      message: 'Accès supprimé définitivement'
    });
  } catch (err) {
    console.error('deleteCategoryAccess error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
