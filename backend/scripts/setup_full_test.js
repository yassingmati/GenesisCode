require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

// Models (Adjust paths as necessary)
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Plan = require('../src/models/Plan'); // Assuming a Plan model exists, or CategoryPlan
const Subscription = require('../src/models/Subscription');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yassinegmatii:yassinegmatii@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        // 1. Setup Data
        const childEmail = 'enfant_test@codegenesis.com';
        const parentEmail = 'parent_test@codegenesis.com';
        const password = 'Password123!';

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Find Categories
        console.log('Finding categories...');
        const pythonCat = await Category.findOne({
            $or: [
                { 'translations.fr.name': /python/i },
                { name: /python/i },
                { slug: /python/i }
            ]
        });
        const javaCat = await Category.findOne({
            $or: [
                { 'translations.fr.name': /java/i },
                { name: /java/i },
                { slug: /java/i }
            ]
        });

        if (!pythonCat) console.error('⚠️ Category Python not found!');
        else console.log(`found Python: ${pythonCat._id}`);

        if (!javaCat) console.error('⚠️ Category Java not found!');
        else console.log(`found Java: ${javaCat._id}`);

        // 3. Find Plans for these categories
        // Trying to find plans linked to these categories. 
        // Note: Field might be 'category' or 'targetId' depending on schema version.
        // We'll search for any plan active for these categories.

        let pythonPlan = null;
        let javaPlan = null;

        if (javaCat) {
            // Updated query to match Plan schema
            javaPlan = await Plan.findOne({
                $or: [{ targetId: javaCat._id }, { targetId: String(javaCat._id) }],
                active: true
            });

            if (!javaPlan) {
                console.log('⚠️ No active plan found for Java. Creating one...');
                javaPlan = await Plan.create({
                    _id: `plan_java_monthly_${uuidv4()}`,
                    name: 'Java Mensuel',
                    description: 'Abonnement mensuel Java',
                    priceMonthly: 30000,
                    currency: 'TND',
                    interval: 'month',
                    active: true,
                    type: 'Category',
                    targetId: javaCat._id,
                    translations: {
                        fr: { name: 'Java Mensuel', description: 'Accès au parcours Java' },
                        en: { name: 'Java Monthly', description: 'Access to Java path' },
                        ar: { name: 'جافا شهري', description: 'الوصول إلى مسار جافا' }
                    }
                });
                console.log(`Created Java Plan: ${javaPlan._id}`);
            } else {
                console.log(`Found Java Plan: ${javaPlan.name || javaPlan._id}`);
            }
        }

        if (pythonCat) {
            pythonPlan = await Plan.findOne({
                $or: [{ targetId: pythonCat._id }, { targetId: String(pythonCat._id) }],
                active: true
            });

            if (!pythonPlan) {
                console.log('⚠️ No active plan found for Python. Creating one...');
                pythonPlan = await Plan.create({
                    _id: `plan_python_monthly_${uuidv4()}`,
                    name: 'Python Mensuel',
                    description: 'Abonnement mensuel Python',
                    priceMonthly: 30000,
                    currency: 'TND',
                    interval: 'month',
                    active: true,
                    type: 'Category',
                    targetId: pythonCat._id,
                    translations: {
                        fr: { name: 'Python Mensuel', description: 'Accès au parcours Python' },
                        en: { name: 'Python Monthly', description: 'Access to Python path' },
                        ar: { name: 'بايثون شهري', description: 'الوصول إلى مسار بايثون' }
                    }
                });
                console.log(`Created Python Plan: ${pythonPlan._id}`);
            } else {
                console.log(`Found Python Plan: ${pythonPlan.name || pythonPlan._id}`);
            }
        }

        // 4. Create Parent User
        console.log('Creating/Updating Parent User...');
        let parentIdx = { firebaseUid: `test-parent-${Date.now()}` };
        // Check if exists to keep stable UID if possible, or just upsert by email
        const existingParent = await User.findOne({ email: parentEmail });
        if (existingParent) parentIdx.firebaseUid = existingParent.firebaseUid;

        const parentUpdate = {
            email: parentEmail,
            password: hashedPassword, // Note: Auth usually handled by Firebase, but we set hash for completeness if local auth used
            firstName: 'Parent',
            lastName: 'Test',
            userType: 'parent',
            isVerified: true,
            isProfileComplete: true,
            firebaseUid: existingParent ? existingParent.firebaseUid : uuidv4()
        };

        const parent = await User.findOneAndUpdate(
            { email: parentEmail },
            { $set: parentUpdate },
            { upsert: true, new: true }
        );
        console.log(`Parent created: ${parent._id}`);

        // 5. Create Child User
        console.log('Creating/Updating Child User...');

        const childUpdate = {
            email: childEmail,
            // password: hashedPassword, // Schema doesn't satisfy password usually if firebase, but we won't error
            firstName: 'Enfant',
            lastName: 'Test',
            userType: 'student',
            isVerified: true,
            isProfileComplete: true,
            parentAccount: parent._id, // Link to parent
            firebaseUid: existingParent ? existingParent.firebaseUid + '_child' : uuidv4() // Dummy UID
        };

        // Note: We need a unique firebaseUid.
        if (await User.findOne({ email: childEmail })) {
            const existingChild = await User.findOne({ email: childEmail });
            childUpdate.firebaseUid = existingChild.firebaseUid;
        }

        const child = await User.findOneAndUpdate(
            { email: childEmail },
            { $set: childUpdate },
            { upsert: true, new: true }
        );
        console.log(`Child created: ${child._id}`);

        // Update Parent to have child in some way? 
        // Schema shows `parentAccount` on Child. Does Parent have `children`?
        // Checking schema in previous step, User.js didn't show `children` array explicitly, 
        // but often logic implies query by `parentAccount`. 
        // We'll leave it as the `parentAccount` field on child is the source of truth usually.

        // 6. Create Subscriptions
        console.log('Creating Subscriptions...');

        const createSub = async (plan, cat, name) => {
            if (!plan && !cat) return;

            // Create a subscription
            const subData = {
                user: child._id,
                // If no plan object, we might need a dummy ID or skip. 
                // But user requested subscription. We will force create one if plan exists.
                plan: plan ? (plan.slug || plan._id) : (cat ? cat._id : null), // Fallback
                status: 'active',
                currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                grantedAccess: cat ? [{
                    path: null, // If category based, maybe path is null or we find path?
                    level: null,
                    grantedAt: new Date()
                }] : []
            };

            // We need a valid 'plan' string/ref.
            if (plan) {
                await Subscription.findOneAndUpdate(
                    { user: child._id, plan: subData.plan },
                    { $set: subData },
                    { upsert: true }
                );
                console.log(`Granted Subscription for ${name}`);
            } else {
                console.log(`Skipping subscription for ${name} (No Plan found)`);
            }
        };

        await createSub(pythonPlan, pythonCat, 'Python');
        await createSub(javaPlan, javaCat, 'Java');


        // 7. Output Credentials
        console.log('\n================================================');
        console.log('              SETUP COMPLETE');
        console.log('================================================');
        console.log(`Child: ${childEmail} / ${password}`);
        console.log(`Parent: ${parentEmail} / ${password}`);
        console.log(`Admin Link: https://codegenesis-platform.web.app/admin/dashboard (or local)`);
        console.log('================================================\n');

    } catch (error) {
        console.error('Error in setup:', error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
