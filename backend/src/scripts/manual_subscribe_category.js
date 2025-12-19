const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const CategoryAccess = require('../models/CategoryAccess');
const bcrypt = require('bcryptjs'); // For password hashing
require('dotenv').config();

const subscribeUser = async () => {
    try {
        console.log('🔌 Connexion à MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB');

        const categoryName = 'Java';

        // 1. Trouver l'utilisateur par ID explicite (depuis screenshot)
        const targetUserId = '6930162314493869c67628d7';
        const targetEmail = 'genesiscodee@gmail.com';

        console.log(`🔍 Vérification de l'existence de l'utilisateur ${targetUserId}...`);
        let user = await User.findById(targetUserId);

        if (user) {
            console.log(`✅ Utilisateur ID ${targetUserId} trouvé: ${user.email}`);
        } else {
            console.log(`⚠️ Utilisateur ID ${targetUserId} NON trouvé.`);

            // Check for conflict
            const conflictingUser = await User.findOne({ email: targetEmail });
            if (conflictingUser) {
                console.log(`⚠️ Conflit: L'email ${targetEmail} existe déjà avec l'ID ${conflictingUser._id}. Suppression...`);
                await User.findByIdAndDelete(conflictingUser._id);
                console.log(`🗑️ Utilisateur conflictuel supprimé.`);
            }

            console.log(`🔨 Création de l'utilisateur avec l'ID forcé ${targetUserId}...`);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            user = new User({
                _id: targetUserId, // FORCE THE ID
                username: 'GenesisCode',
                email: targetEmail,
                firstName: 'Genesis',
                lastName: 'Code',
                password: hashedPassword,
                role: 'student',
                userType: 'student',
                isVerified: true,
                firebaseUid: `vxRlIm7p5uQUaOcO6xBe0pGdcJR2` // Use UID from screenshot
            });
            await user.save();
            console.log(`✅ Utilisateur créé avec succès: ${user.email} (${user._id})`);
        }

        // 2. Trouver la catégorie via translations
        const regex = new RegExp(`^${categoryName}$`, 'i');
        const category = await Category.findOne({
            $or: [
                { 'translations.en.name': { $regex: regex } },
                { 'translations.fr.name': { $regex: regex } }
            ]
        });

        if (!category) {
            console.error(`❌ Catégorie non trouvée: ${categoryName}`);
            process.exit(1);
        }
        const foundName = category.translations?.en?.name || category.translations?.fr?.name || 'Inconnue';
        console.log(`📚 Catégorie trouvée: ${foundName} (${category._id})`);

        // 3. Upsert du plan spécifique 'plan-java' demandé par l'utilisateur
        const planId = 'plan-java';
        const categoryId = '6924480bc5bbbad53eb05cfe'; // ID from user request

        // Upsert the plan to match user requirements exactly
        let plan = await Plan.findByIdAndUpdate(
            planId,
            {
                $set: {
                    name: 'Java',
                    description: 'Accès complet aux cours de Java',
                    priceMonthly: 30000, // 30 TND = 30000 millimes
                    currency: 'TND',
                    interval: 'year', // Assuming one-time is handled as yearly or check model behavior
                    type: 'Category',
                    targetId: categoryId,
                    active: true,
                    features: [
                        "Accès illimité aux cours",
                        "Exercices interactifs",
                        "Suivi de progression",
                        "Support prioritaire"
                    ],
                    accessDuration: 30 // As per request
                }
            },
            { upsert: true, new: true, runValidators: true }
        );
        console.log(`💳 Plan 'plan-java' configuré/mis à jour: ${plan.name} (${plan._id})`);

        // 4. Créer ou Mettre à jour l'abonnement
        const subscription = await Subscription.findOneAndUpdate(
            { user: user._id, plan: plan._id, status: 'active' },
            {
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 an d'accès
                autoRenew: false,
                paymentMethod: 'manual_admin',
                amount: plan.priceMonthly || 30000,
                currency: plan.currency || 'TND',
                features: plan.features || []
            },
            { upsert: true, new: true }
        );
        console.log(`✅ Abonnement actif (ID: ${subscription._id}) pour le plan ${plan._id}`);

        // 5. Mettre à jour CategoryAccess
        const access = await CategoryAccess.findOneAndUpdate(
            { user: user._id, category: categoryId }, // Ensure we use the exact category ID linked to the plan
            {
                $set: {
                    hasAccess: true,
                    accessType: 'paid',
                    expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Force valid future date
                    lastUpdated: new Date()
                }
            },
            { upsert: true, new: true }
        );
        console.log(`✅ CategoryAccess validé pour ${categoryName} (ID: ${categoryId}) jusqu'au ${access.expiresAt}`);

        console.log('🎉 Abonnement réussi ! Vous pouvez vous connecter avec:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: password123`);
        console.log(`   Password: password123`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
};

subscribeUser();
