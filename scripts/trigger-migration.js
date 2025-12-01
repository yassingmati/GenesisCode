/**
 * Script pour déclencher la migration des plans sur la production
 * Usage: node scripts/trigger-migration.js
 */

const API_BASE = 'https://codegenesis-backend.onrender.com';

async function triggerMigration() {
    try {
        console.log('🚀 Triggering migration on production...');

        // Call Migrate Endpoint with Secret Key
        console.log('🔄 Calling migrate-plans...');
        const response = await fetch(`${API_BASE}/api/admin/migrate-plans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ secretKey: 'migration-secret-123' })
        });

        const result = await response.json();
        console.log('📊 Migration Result:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

triggerMigration();
