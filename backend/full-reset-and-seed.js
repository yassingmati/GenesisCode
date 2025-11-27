// backend/full-reset-and-seed.js
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Path = require('./src/models/Path');
const Level = require('./src/models/Level');
const Exercise = require('./src/models/Exercise');
const CategoryPlan = require('./src/models/CategoryPlan');
const CategoryAccess = require('./src/models/CategoryAccess');
const CourseAccess = require('./src/models/CourseAccess');
const User = require('./src/models/User');

// MongoDB Atlas URI (same as reset-and-seed.js)
const MONGODB_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

const USER_EMAIL = 'yassine.gmatii@gmail.com';

const CLASSIC_CATEGORIES = [
    { fr: 'Débutant', en: 'Beginner', ar: 'مبتدئ', order: 1 },
    { fr: 'Intermédiaire', en: 'Intermediate', ar: 'متوسط', order: 2 },
    { fr: 'Avancé', en: 'Advanced', ar: 'متقدم', order: 3 }
];

const SPECIAL_CATEGORIES = [
    { fr: 'Java', en: 'Java', ar: 'جافا', order: 4 },
    { fr: 'Python', en: 'Python', ar: 'بايثون', order: 5 },
    { fr: 'JavaScript', en: 'JavaScript', ar: 'جافا سكريبت', order: 6 }
];

async function fullResetAndSeed() {
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

                    // 6. Create Exercises (Rich Data) and link to level
                    const createdExercises = await createRichExercises(level._id, l);

                    // Link exercises to level
                    level.exercises = createdExercises.map(ex => ex._id);
                    await level.save();
                }
            }
        }

        console.log('\n✅ Full Reset and Seeding Completed Successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected');
    }
}

async function createRichExercises(levelId, levelIndex) {
    const exercises = [
        // 1. Scratch Exercise (Blockly)
        {
            type: 'Scratch',
            translations: {
                fr: { name: 'Initiation Scratch', question: 'Créez un programme qui fait avancer le chat de 10 pas.', explanation: 'Utilisez le bloc "avancer de 10 pas".' },
                en: { name: 'Scratch Intro', question: 'Create a program that moves the cat 10 steps.', explanation: 'Use the "move 10 steps" block.' },
                ar: { name: 'مقدمة سكراتش', question: 'أنشئ برنامجًا يحرك القط 10 خطوات.', explanation: 'استخدم كتلة "تحرك 10 خطوات".' }
            },
            initialXml: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
            solutions: ['<xml xmlns="https://developers.google.com/blockly/xml"><block type="motion_movesteps" x="10" y="10"><field name="STEPS">10</field></block></xml>'],
            points: 10,
            difficulty: 'easy'
        },
        // 2. ScratchBlocks Exercise (Custom UI)
        {
            type: 'ScratchBlocks',
            translations: {
                fr: { name: 'Logique de Blocs', question: 'Assemblez les blocs pour créer une boucle.', explanation: 'La boucle répète les actions à l\'intérieur.' },
                en: { name: 'Block Logic', question: 'Assemble blocks to create a loop.', explanation: 'The loop repeats actions inside.' },
                ar: { name: 'منطق الكتل', question: 'جمع الكتل لإنشاء حلقة.', explanation: 'الحلقة تكرر الإجراءات بداخلها.' }
            },
            scratchBlocks: [
                { text: 'Répéter 10 fois', category: 'control' },
                { text: 'Avancer de 10', category: 'motion' },
                { text: 'Attendre 1 seconde', category: 'control' }
            ],
            solutions: [
                { text: 'Répéter 10 fois', category: 'control' },
                { text: 'Avancer de 10', category: 'motion' }
            ],
            points: 15,
            difficulty: 'medium'
        },
        // 3. QCM Exercise
        {
            type: 'QCM',
            translations: {
                fr: { name: 'Quiz JavaScript', question: 'Quel mot-clé déclare une constante ?', explanation: 'const est utilisé pour les constantes.' },
                en: { name: 'JavaScript Quiz', question: 'Which keyword declares a constant?', explanation: 'const is used for constants.' },
                ar: { name: 'اختبار جافا سكريبت', question: 'ما هي الكلمة المفتاحية لتعريف ثابت؟', explanation: 'const تستخدم للثوابت.' }
            },
            options: [
                { id: 'opt1', text: 'var' },
                { id: 'opt2', text: 'let' },
                { id: 'opt3', text: 'const' },
                { id: 'opt4', text: 'fixed' }
            ],
            solutions: [2], // Index of correct answer
            points: 5,
            difficulty: 'easy'
        },
        // 4. Code Exercise
        {
            type: 'Code',
            translations: {
                fr: { name: 'Fonction Somme', question: 'Écrivez une fonction "sum" qui additionne deux nombres.', explanation: 'Retournez a + b.' },
                en: { name: 'Sum Function', question: 'Write a function "sum" that adds two numbers.', explanation: 'Return a + b.' },
                ar: { name: 'دالة الجمع', question: 'اكتب دالة "sum" تجمع رقمين.', explanation: 'أرجع a + b.' }
            },
            language: 'javascript',
            codeSnippet: '// Écrivez votre fonction ici\nfunction sum(a, b) {\n  \n}',
            testCases: [
                { input: 'sum(2, 3)', expected: '5', points: 5, public: true },
                { input: 'sum(10, -2)', expected: '8', points: 5, public: true },
                { input: 'sum(0, 0)', expected: '0', points: 5, public: false }
            ],
            solutions: ['function sum(a, b) { return a + b; }'],
            points: 20,
            difficulty: 'hard'
        }
    ];

    const createdExercises = [];
    for (let i = 0; i < exercises.length; i++) {
        const exercise = await Exercise.create({
            level: levelId,
            order: i + 1,
            isActive: true,
            ...exercises[i]
        });
        createdExercises.push(exercise);
    }

    return createdExercises;
}

fullResetAndSeed();
