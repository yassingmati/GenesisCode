/**
 * Script pour réinitialiser les plans et en créer de nouveaux basés sur les catégories existantes.
 * Usage: node scripts/reset_plans_from_categories.js
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

// Modèles
const Category = require('../src/models/Category');
const Plan = require('../src/models/Plan');

// Configuration
const DEFAULT_PRICE = 30000; // 30.00 TND
const DEFAULT_CURRENCY = 'TND';

async function connectDB() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis';
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connecté à MongoDB');
    } catch (err) {
        console.error('❌ Erreur de connexion MongoDB:', err);
        process.exit(1);
    }
}

function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-z0-9]+/g, '-')     // Remplacer les caractères spéciaux par des tirets
        .replace(/^-+|-+$/g, '');        // Enlever les tirets au début et à la fin
}

async function resetPlans() {
    try {
        await connectDB();

        console.log('🗑️ Suppression des plans existants...');
        await Plan.deleteMany({});
        console.log('✅ Tous les plans ont été supprimés.');

        console.log('📋 Récupération des catégories...');
        const categories = await Category.find({});
        console.log(`✅ ${categories.length} catégories trouvées.`);

        const newPlans = [];

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
                active: true
            });

            newPlans.push(plan);
        }

        // Ajouter un plan gratuit global si nécessaire (optionnel, mais souvent utile)
        // newPlans.push(new Plan({
        //   _id: 'free',
        //   name: 'Gratuit',
        //   description: 'Accès limité pour découvrir la plateforme',
        //   priceMonthly: 0,
        //   currency: DEFAULT_CURRENCY,
        //   interval: 'month',
        //   features: ['Accès limité', 'Publicité'],
        //   active: true
        // }));

        if (newPlans.length > 0) {
            await Plan.insertMany(newPlans);
            console.log(`✅ ${newPlans.length} nouveaux plans créés avec succès.`);
            newPlans.forEach(p => console.log(`   - [${p._id}] ${p.name} (${p.priceMonthly / 100} ${p.currency})`));
        } else {
            console.log('⚠️ Aucune catégorie trouvée, aucun plan créé.');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation des plans:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Connexion fermée.');
    }
}

resetPlans();
