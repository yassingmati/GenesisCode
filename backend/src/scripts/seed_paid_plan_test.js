const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Config
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath, override: true });

const Category = require('../models/Category');
const CategoryPlan = require('../models/CategoryPlan');

const seedPaidPlan = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const uri = process.env.MONGODB_URI;
        console.log('URI:', uri ? uri.replace(/\/\/.*@/, '//***:***@') : 'UNDEFINED');

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected.');
        console.log('Host:', mongoose.connection.host);

        // Find a category
        const category = await Category.findOne();
        if (!category) {
            console.error('No category found!');
            process.exit(1);
        }
        console.log(`Found category: ${category._id} (${category.translations.fr.name})`);

        // Find or create plan
        let plan = await CategoryPlan.findOne({ category: category._id });

        if (!plan) {
            console.log('Creating new plan...');
            plan = new CategoryPlan({
                category: category._id,
                price: 1000, // 10 TND
                currency: 'TND',
                translations: {
                    fr: { name: 'Plan Payant Test', description: 'Plan de test pour paiement' },
                    en: { name: 'Paid Plan Test', description: 'Test plan for payment' },
                    ar: { name: 'Plan Payant Test', description: 'Plan de test pour paiement' }
                }
            });
        } else {
            console.log('Updating existing plan to PAID...');
            plan.price = 1000; // 10 TND
            plan.translations.fr.name = 'Plan Payant Test (Modifié)';
        }

        await plan.save();
        console.log('Plan saved successfully as PAID.');
        console.log(plan);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding plan:', error);
        process.exit(1);
    }
};

seedPaidPlan();
