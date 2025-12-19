const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch'); // Assuming node-fetch is available or using built-in fetch in newer node

const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath, override: true });

const run = async () => {
    try {
        // 1. Connect to DB
        console.log('--- DB Connection ---');
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log('Connected to:', mongoose.connection.name);

        // 2. Fetch DB Plans
        const collectionName = 'plans';
        console.log(`\n--- DB Data (${collectionName}) ---`);
        const dbPlans = await mongoose.connection.db.collection(collectionName).find({ type: 'category', active: true }).toArray();
        console.log(`DB Count: ${dbPlans.length}`);
        dbPlans.forEach(p => console.log(`[DB] ID: ${p._id} | Name: ${p.name} | Price: ${p.priceMonthly}`));

        // 3. Fetch API Plans
        console.log('\n--- API Data ---');
        try {
            const response = await fetch('http://localhost:5000/api/category-payments/plans');
            const data = await response.json();

            if (data.success) {
                console.log(`API Count: ${data.plans.length}`);
                data.plans.forEach(p => console.log(`[API] ID: ${p.id} | Name: ${p.name} | Price: ${p.price}`));

                // Comparison
                console.log('\n--- Comparison ---');
                if (dbPlans.length === data.plans.length) {
                    console.log('✅ Counts Match');
                } else {
                    console.error('❌ Counts Mismatch');
                }

                // Check first item match
                if (dbPlans.length > 0 && data.plans.length > 0) {
                    const dbFirst = dbPlans.find(d => d._id === data.plans[0].id);
                    if (dbFirst) {
                        console.log(`✅ Plan '${dbFirst._id}' found in both.`);
                    } else {
                        console.error(`❌ Plan '${data.plans[0].id}' from API not found in DB dump!`);
                    }
                }

            } else {
                console.error('API Error:', data);
            }
        } catch (e) {
            console.error('Failed to fetch API:', e.message);
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
run();
