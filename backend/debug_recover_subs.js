const mongoose = require('mongoose');
const User = require('./src/models/User');
const Payment = require('./src/models/Payment');
const Subscription = require('./src/models/Subscription');
const Plan = require('./src/models/Plan');
const CategoryPlan = require('./src/models/CategoryPlan');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const recoverSubs = async () => {
    await connectDB();
    try {
        const email = 'yassine.gmatii@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found:', email);
            return;
        }

        console.log(`Found User: ${user._id} (${user.email})`);

        // Find all successful payments
        const payments = await Payment.find({
            user: user._id,
            status: 'completed'
        }).sort({ createdAt: -1 });

        console.log(`Found ${payments.length} successful payments.`);

        if (payments.length === 0) {
            console.log('No payments found to recover from.');
            return;
        }

        for (const payment of payments) {
            console.log(`Processing Payment: ${payment._id} | Date: ${payment.createdAt} | Amount: ${payment.amount}`);

            // Calculate period (assuming 1 month default if not specified/detectable?) 
            // Logic from paymentController: 30 days usually.
            const duration = 30 * 24 * 60 * 60 * 1000;
            const startDate = new Date(payment.createdAt);
            const endDate = new Date(startDate.getTime() + duration);

            const now = new Date();
            const isActive = endDate > now;

            console.log(`- Period: ${startDate.toISOString()} to ${endDate.toISOString()} | Active? ${isActive}`);

            // Check if subscription already exists for this payment logic?
            // Actually, since we cleared table, we just create new ones.
            // BUT we should avoid duplicates if we run this multiple times or if multiple payments map to "same" subscription concept.
            // Usually 1 subscription document per Plan usage.

            // HOWEVER, "Subscription" model usually tracks the CURRENT status.
            // So we should only create ONE subscription per "Plan Type" (or Plan ID).
            // Since we have multiple payments, the LATEST one for a given plan should determine the subscription state.

            // Let's identify the plan
            let planModelKey = 'Plan';
            let planId = payment.plan; // This is the ID stored in payment

            // Try to verify if it's a Plan or CategoryPlan if not explicit
            // The Payment model update added 'planModel'. Let's see if this payment has it.
            if (payment.planModel) {
                planModelKey = payment.planModel;
            } else {
                // infer? If we can find it in Plan collection...
                const p = await Plan.findById(planId);
                if (!p) {
                    // Check CategoryPlan
                    const cp = await CategoryPlan.findById(planId);
                    if (cp) planModelKey = 'CategoryPlan';
                }
            }

            // Check if we already recovered a subscription for this PlanID in this run
            const existingSub = await Subscription.findOne({
                user: user._id,
                plan: planId
            });

            if (existingSub) {
                console.log(`- Subscription already exists for Plan ${planId}. Skipping older payment.`);
                continue;
            }

            console.log(`- Creating Subscription for Plan ${planId} (${planModelKey})`);

            const newSub = new Subscription({
                user: user._id,
                plan: planId,
                planModel: planModelKey,
                status: isActive ? 'active' : 'canceled', // or 'past_due'? 'canceled' implies manual stop. 'active' if valid. if expired, maybe dont create or 'canceled'
                // If expired, let's set it to 'canceled' or 'past_due' just to have record? 
                // Or maybe just don't create if expired? The user wants to "recover" them.
                // Let's create it but mark as canceled/expired if old.
                status: isActive ? 'active' : 'canceled',
                currentPeriodStart: startDate,
                currentPeriodEnd: endDate,
                konnectPaymentId: payment.konnectPaymentId,
                konnectStatus: payment.konnectStatus,
                autoRenew: false // Default safe
            });

            await newSub.save();
            console.log(`-- RECOVERED SUBSCRIPTION: ${newSub._id} --`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

recoverSubs();
