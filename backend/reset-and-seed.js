// backend/reset-and-seed.js
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Path = require('./src/models/Path');
const Level = require('./src/models/Level');
const Exercise = require('./src/models/Exercise');
const CategoryPlan = require('./src/models/CategoryPlan');
const CategoryAccess = require('./src/models/CategoryAccess');
const CourseAccess = require('./src/models/CourseAccess');
const User = require('./src/models/User');

// MongoDB Atlas URI
const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

const USER_EMAIL = 'yassine.gmatii@gmail.com';

const CLASSIC_CATEGORIES = [
    { fr: 'Débutant', en: 'Beginner', ar: 'مبتدئ', order: 1 },
    { fr: 'Intermédiaire', en: 'Intermediate', ar: 'متوسط', order: 2 },
    { fr: 'Avancé', en: 'Advanced', ar: 'متقدم', order: 3 }
];

const SPECIAL_CATEGORIES = [
    { fr: 'Java', en: 'Java', ar: 'جافا', order: 4 },
    { fr: 'Java Avancé', en: 'Advanced Java', ar: 'جافا متقدم', order: 5 },
    { fr: 'Algorithmes', en: 'Algorithms', ar: 'خوارزميات', order: 6 },
    { fr: 'Python', en: 'Python', ar: 'بايثون', order: 7 },
    { fr: 'JavaScript', en: 'JavaScript', ar: 'جافا سكريبت', order: 8 },
    { fr: 'C++', en: 'C++', ar: 'سي بلس بلس', order: 9 }
];

async function resetAndSeed() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        // 1. Clear Database
        console.log('🗑️ Clearing database...');
        await Category.deleteMany({});
        await Path.deleteMany({});
        await Level.deleteMany({});
        await Exercise.deleteMany({});
        await CategoryPlan.deleteMany({});
        await CategoryAccess.deleteMany({});
        await CourseAccess.deleteMany({});
        console.log('✅ Database cleared');

        // 2. Find User
        const user = await User.findOne({ email: USER_EMAIL });
        if (!user) {
            console.error(`❌ User ${USER_EMAIL} not found. Please create the user first.`);
            process.exit(1);
        }
        console.log(`👤 Seeding for user: ${user.email}`);

        // 3. Create Categories
        const allCategoriesData = [
            ...CLASSIC_CATEGORIES.map(c => ({ ...c, type: 'classic' })),
            ...SPECIAL_CATEGORIES.map(c => ({ ...c, type: 'specific' }))
        ];

        for (const catData of allCategoriesData) {
            console.log(`\n📂 Creating Category: ${catData.fr}`);
            const category = await Category.create({
                translations: {
                    fr: { name: catData.fr, description: `Description pour ${catData.fr}` },
                    en: { name: catData.en, description: `Description for ${catData.en}` },
                    ar: { name: catData.ar, description: `وصف ${catData.ar}` }
                },
                type: catData.type,
                order: catData.order,
                isActive: true
            });

            // Create Default Plan
            const plan = await CategoryPlan.create({
                category: category._id,
                translations: {
                    fr: { name: `Plan ${catData.fr}`, description: 'Accès complet' },
                    en: { name: `${catData.en} Plan`, description: 'Full access' },
                    ar: { name: `خطة ${catData.ar}`, description: 'وصول كامل' }
                },
                price: 0,
                isActive: true,
                features: ['All Access']
            });

            // Grant Admin Access to Category
            await CategoryAccess.create({
                user: user._id,
                category: category._id,
                categoryPlan: plan._id,
                status: 'active',
                accessType: 'admin',
                purchasedAt: new Date()
            });

            // 4. Create Paths (2 per category)
            for (let p = 1; p <= 2; p++) {
                const path = await Path.create({
                    category: category._id,
                    translations: {
                        fr: { name: `Parcours ${p} - ${catData.fr}`, description: 'Description du parcours' },
                        en: { name: `Path ${p} - ${catData.en}`, description: 'Path description' },
                        ar: { name: `مسار ${p} - ${catData.ar}`, description: 'وصف المسار' }
                    },
                    order: p,
                    isActive: true
                });

                // Grant Access to Path
                await CourseAccess.create({
                    user: user._id,
                    path: path._id,
                    accessType: 'unlocked',
                    source: 'admin',
                    canView: true,
                    canInteract: true,
                    isActive: true
                });

                // 5. Create Levels (3 per path)
                for (let l = 1; l <= 3; l++) {
                    const level = await Level.create({
                        path: path._id,
                        translations: {
                            fr: { title: `Niveau ${l}`, description: 'Description du niveau', content: 'Contenu du niveau' },
                            en: { title: `Level ${l}`, description: 'Level description', content: 'Level content' },
                            ar: { title: `مستوى ${l}`, description: 'وصف المستوى', content: 'محتوى المستوى' }
                        },
                        order: l,
                        xpReward: 100,
                        isActive: true
                    });

                    // Grant Access to Level
                    await CourseAccess.create({
                        user: user._id,
                        path: path._id,
                        level: level._id,
                        accessType: 'unlocked',
                        source: 'admin',
                        canView: true,
                        canInteract: true,
                        isActive: true
                    });

                    // 6. Create Exercises (4 per level)
                    for (let e = 1; e <= 4; e++) {
                        // Mix exercise types: 1 ScratchBlocks, 1 QCM, 2 Code
                        let type = 'Code';
                        let content = {};

                        if (e === 1) {
                            type = 'ScratchBlocks';
                            content = {
                                problem: 'Créer un bloc qui avance',
                                initialBlocks: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
                                solutionBlocks: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="motion_move_steps" x="10" y="10"><field name="STEPS">10</field></block></xml>'
                            };
                        } else if (e === 2) {
                            type = 'QCM';
                            content = {
                                question: 'Quelle est la bonne réponse ?',
                                options: [
                                    { id: 'a', text: 'A' },
                                    { id: 'b', text: 'B' },
                                    { id: 'c', text: 'C' },
                                    { id: 'd', text: 'D' }
                                ],
                                correctAnswer: 0
                            };
                        } else {
                            type = 'Code';
                            content = {
                                description: 'Écrire une fonction simple',
                                initialCode: '// Votre code ici',
                                solutionCode: 'console.log("Hello");',
                                testCases: [{ input: '', output: 'Hello', hidden: false }]
                            };
                        }

                        await Exercise.create({
                            level: level._id,
                            type: type,
                            order: e,
                            translations: {
                                fr: {
                                    name: `Exercice ${e} (${type})`,
                                    question: `Question pour exercice ${e}`,
                                    explanation: 'Explication...'
                                },
                                en: {
                                    name: `Exercise ${e} (${type})`,
                                    question: `Question for exercise ${e}`,
                                    explanation: 'Explanation...'
                                },
                                ar: {
                                    name: `تمرين ${e} (${type})`,
                                    question: `سؤال للتمرين ${e}`,
                                    explanation: 'شرح...'
                                }
                            },
                            content: content,
                            xpReward: 50,
                            isActive: true
                        });
                    }
                }
            }
        }

        console.log('\n✅ Reset and Seeding Completed Successfully!');
        console.log('📊 Summary:');
        console.log(`- Categories: ${allCategoriesData.length}`);
        console.log(`- Paths: ${allCategoriesData.length * 2}`);
        console.log(`- Levels: ${allCategoriesData.length * 2 * 3}`);
        console.log(`- Exercises: ${allCategoriesData.length * 2 * 3 * 4}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected');
    }
}

resetAndSeed();
