const mongoose = require('mongoose');
const CategoryAccess = require('./src/models/CategoryAccess');
const Subscription = require('./src/models/Subscription');
const User = require('./src/models/User');
require('dotenv').config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
};

const migrateAccess = async () => {
    await connectDB();
    try {
        const accesses = await CategoryAccess.find({}).populate('user', 'email');
        console.log(`Found ${accesses.length} CategoryAccess records.`);
        const Plan = require('./src/models/Plan');
        const CategoryPlan = require('./src/models/CategoryPlan');

        for (const access of accesses) {
            if (!access.user) {
                console.log(`Skipping access ${access._id} - No user attached.`);
                continue;
            }

            console.log(`Processing Access: User=${access.user.email} | ID=${access._id}`);

            let planId = access.categoryPlan;
            let planModel = 'CategoryPlan';

            // DETECT PLAN TYPE
            // 1. If ID is String and exists in Plan collection -> Plan
            if (planId && typeof planId === 'string' && planId.length < 24) {
                // Likely a slug like 'plan-java'
                const p = await Plan.findById(planId);
                if (p) {
                    planModel = 'Plan';
                    console.log(`  > Linked to Global Plan: ${planId}`);
                }
            } else if (planId && typeof planId === 'string' && planId.length > 24 && !mongoose.Types.ObjectId.isValid(planId)) {
                // Long string ID (e.g. java_access_plan_...)
                const p = await Plan.findById(planId);
                if (p) {
                    planModel = 'Plan';
                    console.log(`  > Linked to Global Plan (Legacy String ID): ${planId}`);
                }
            }

            // 2. Fallback: If categoryPlan is ObjectId or missing, try resolve CategoryPlan
            if (planModel === 'CategoryPlan') {
                if (planId && mongoose.Types.ObjectId.isValid(planId)) {
                    // It's likely a valid reference
                } else {
                    // Try to resolve from Category
                    console.log(`  > Resolving plan from Category: ${access.category}`);
                    const catPlan = await CategoryPlan.findOne({ category: access.category });
                    if (catPlan) {
                        planId = catPlan._id;
                        console.log(`  > Resolved to CategoryPlan: ${planId}`);
                    } else {
                        console.log(`  > CRITICAL: No CategoryPlan found for category ${access.category}. Using fallback logic?`);
                        // Potentially create a placeholder plan? OR map to a "Free" plan if accessType is free?
                        if (access.accessType === 'free') {
                            // Maybe we don't need a plan per se, but Subscription requires one.
                            // Let's search if there is a "Free" plan in global plans?
                        }
                    }
                }
            }

            if (!planId) {
                console.log(`  > SKIPPING: Could not determine Plan ID.`);
                continue;
            }

            // Check if Subscription already exists
            const existingSub = await Subscription.findOne({
                user: access.user._id,
                plan: planId
            });

            if (existingSub) {
                console.log(`  > Subscription already exists.`);
                continue;
            }

            const newSub = new Subscription({
                user: access.user._id,
                plan: planId,
                planModel: planModel,
                status: access.status,
                currentPeriodStart: access.purchasedAt || access.createdAt,
                currentPeriodEnd: access.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                autoRenew: false,
                metadata: {
                    migratedFromCategoryAccess: access._id
                }
            });

            await newSub.save();
            console.log(`  > CREATED Subscription: ${newSub._id}`);
        }

    } catch (e) { console.error(e); }
    finally { mongoose.connection.close(); }
};

migrateAccess();
