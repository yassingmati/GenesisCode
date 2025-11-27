// Script simplifié pour donner accès complet
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const CategoryAccess = require('./src/models/CategoryAccess');
const CategoryPlan = require('./src/models/CategoryPlan');

const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

async function grantFullAccess() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');

        const user = await User.findOne({ email: 'yassine.gmatii@gmail.com' });
        if (!user) {
            console.error('❌ User not found');
            process.exit(1);
        }
        console.log(`✅ User found: ${user.email} (ID: ${user._id})`);

        const categories = await Category.find({});
        console.log(`✅ Found ${categories.length} categories`);

        for (const category of categories) {
            const categoryName = category.translations?.fr?.name || 'Sans nom';
            console.log(`\n📂 Processing: ${categoryName}`);

            let categoryPlan = await CategoryPlan.findOne({ category: category._id });

            if (!categoryPlan) {
                categoryPlan = await CategoryPlan.create({
                    category: category._id,
                    translations: {
                        fr: { name: `Plan Admin - ${categoryName}`, description: 'Accès complet' },
                        en: { name: `Admin Plan - ${categoryName}`, description: 'Full access' },
                        ar: { name: `خطة - ${categoryName}`, description: 'وصول كامل' }
                    },
                    price: 0,
                    duration: null,
                    features: ['Accès complet'],
                    isActive: true
                });
                console.log(`  ✅ Created CategoryPlan`);
            }

            const existingAccess = await CategoryAccess.findOne({
                user: user._id,
                category: category._id
            });

            if (existingAccess) {
                existingAccess.status = 'active';
                existingAccess.accessType = 'admin';
                existingAccess.expiresAt = null;
                await existingAccess.save();
                console.log(`  ✅ Updated access`);
            } else {
                await CategoryAccess.create({
                    user: user._id,
                    category: category._id,
                    categoryPlan: categoryPlan._id,
                    status: 'active',
                    accessType: 'admin',
                    expiresAt: null,
                    purchasedAt: new Date()
                });
                console.log(`  ✅ Created access`);
            }
        }

        console.log('\n✅ Full access granted!');

        const totalAccess = await CategoryAccess.countDocuments({ user: user._id, status: 'active' });
        console.log(`\n📊 Summary: ${totalAccess} active access(es)`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected');
    }
}

grantFullAccess();
