require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Plan = require('../models/Plan');

const connectDB = async () => {
    try {
        const uri = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0";
        console.log(`Connecting to MongoDB at: ${uri.includes('localhost') || uri.includes('127.0.0.1') ? 'Localhost' : 'Atlas/Remote'} (${uri.substring(0, 15)}...)`);

        await mongoose.connect(uri);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const resetPlans = async () => {
    await connectDB();

    try {
        console.log('Deleting existing CATEGORY plans from Plan collection...');
        await Plan.deleteMany({ type: { $in: ['category', 'Category'] } });
        console.log('All existing category plans deleted.');

        console.log('Fetching categories...');
        // Fetch ALL categories (Specific + Classic) as requested
        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories.`);

        if (categories.length === 0) {
            console.log('No specific categories found. Exiting.');
            process.exit(0);
        }

        const plansToCreate = categories.map(category => {
            // Generate slug for ID
            const slug = category.name ? category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : category._id.toString();
            const planId = `plan-${slug}`;

            // Helper to safe-get translation
            const getTrans = (lang) => {
                if (category.translations && category.translations[lang] && category.translations[lang].name) {
                    return category.translations[lang].name;
                }
                return category.name;
            };

            const nameFr = getTrans('fr');
            const nameEn = getTrans('en');
            const nameAr = getTrans('ar');

            return {
                _id: planId,
                name: nameFr,
                description: `Accès complet aux cours de ${nameFr}`,
                priceMonthly: 30000, // 30 TND in millimes (assuming logic derived from 30)
                currency: 'TND',
                interval: 'month', // Or 'year', 'one_time' depending on Plan model usage. Service treats 'year' as 365 days. Defaulting to 'month'.
                active: true,
                type: 'Category',
                targetId: category._id,
                accessDuration: 365, // Legacy field support
                translations: {
                    fr: {
                        name: nameFr,
                        description: `Accès complet aux cours de ${nameFr}`
                    },
                    en: {
                        name: nameEn,
                        description: `Full access to ${nameEn} courses`
                    },
                    ar: {
                        name: nameAr,
                        description: `وصول كامل لدورات ${nameAr}`
                    }
                },
                features: [
                    'Accès illimité aux cours',
                    'Exercices interactifs',
                    'Suivi de progression',
                    'Support prioritaire'
                ]
            };
        });

        console.log('Creating new plans...');
        // console.log(JSON.stringify(plansToCreate, null, 2));
        await Plan.insertMany(plansToCreate);
        console.log(`Successfully created ${plansToCreate.length} new plans `);

    } catch (error) {
        console.error('Error resetting plans:', error);
    } finally {
        await mongoose.disconnect();
    }
};

resetPlans();
