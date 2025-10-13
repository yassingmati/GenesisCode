// src/utils/initKonnectPlans.js
require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

async function initKonnectPlans() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('🌱 Initialisation des plans Konnect...');

    // Supprimer les anciens plans
    await Plan.deleteMany({});
    console.log('🗑️ Anciens plans supprimés');

    // Plans de base
    const plans = [
      {
        _id: 'free',
        name: 'Gratuit',
        description: 'Accès aux premières leçons de chaque parcours',
        priceMonthly: 0,
        currency: 'TND',
        interval: null,
        features: [
          'Première leçon gratuite',
          'Accès limité',
          'Support communautaire'
        ],
        active: true
      },
      {
        _id: 'premium-debutant',
        name: 'Premium Débutant',
        description: 'Accès complet aux parcours débutant',
        priceMonthly: 1999, // 19.99 TND
        currency: 'TND',
        interval: 'month',
        features: [
          'Tous les parcours débutant',
          'Exercices illimités',
          'Support prioritaire',
          'Certificats'
        ],
        active: true
      },
      {
        _id: 'premium-avance',
        name: 'Premium Avancé',
        description: 'Accès complet aux parcours avancés',
        priceMonthly: 2999, // 29.99 TND
        currency: 'TND',
        interval: 'month',
        features: [
          'Tous les parcours avancés',
          'Projets pratiques',
          'Mentoring 1-1',
          'Certificats avancés'
        ],
        active: true
      },
      {
        _id: 'premium-global',
        name: 'Premium Global',
        description: 'Accès illimité à tous les parcours',
        priceMonthly: 4999, // 49.99 TND
        currency: 'TND',
        interval: 'month',
        features: [
          'Tous les parcours',
          'Toutes les langues',
          'Projets avancés',
          'Mentoring illimité',
          'Certificats premium'
        ],
        active: true
      },
      {
        _id: 'premium-annuel',
        name: 'Premium Annuel',
        description: 'Abonnement annuel avec réduction',
        priceMonthly: 3999, // 39.99 TND par mois
        currency: 'TND',
        interval: 'year',
        features: [
          'Tous les parcours',
          'Toutes les langues',
          'Projets avancés',
          'Mentoring illimité',
          'Certificats premium',
          'Économie de 20%'
        ],
        active: true
      }
    ];

    // Créer les plans
    for (const planData of plans) {
      await Plan.create(planData);
      console.log(`✅ Plan créé: ${planData.name}`);
    }

    console.log(`\n🎉 ${plans.length} plans Konnect initialisés avec succès !`);
    console.log('\n📋 Plans disponibles:');
    plans.forEach(plan => {
      const price = plan.priceMonthly === 0 ? 'Gratuit' : `${(plan.priceMonthly / 100).toFixed(2)} ${plan.currency}`;
      console.log(`  - ${plan.name}: ${price}`);
    });

    console.log('\n🔧 Configuration Konnect:');
    console.log(`  - API Key: ${process.env.KONNECT_API_KEY ? process.env.KONNECT_API_KEY.substring(0, 20) + '...' : 'NON DÉFINI'}`);
    console.log(`  - Base URL: ${process.env.KONNECT_BASE_URL || 'NON DÉFINI'}`);
    console.log(`  - Receiver Wallet: ${process.env.KONNECT_RECEIVER_WALLET_ID || 'NON DÉFINI'}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des plans:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

if (require.main === module) {
  initKonnectPlans();
}

module.exports = { initKonnectPlans };
