// backend/scripts/access-smoke-test.js
// Usage:
//   node scripts/access-smoke-test.js --user <userId> --path <pathId> [--level <levelId>] [--exercise <exerciseId>]
// Requires DB connection env to be configured as in the app.

const mongoose = require('mongoose');
const AccessControlService = require('../src/services/accessControlService');
const connectDB = require('../src/config/database');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const val = args[i + 1];
    if (!key || !val) continue;
    if (key === '--user') out.userId = val;
    if (key === '--path') out.pathId = val;
    if (key === '--level') out.levelId = val;
    if (key === '--exercise') out.exerciseId = val;
  }
  return out;
}

async function main() {
  const { userId, pathId, levelId, exerciseId } = parseArgs();
  if (!userId || !pathId) {
    console.error('Missing required args. Example: node scripts/access-smoke-test.js --user <userId> --path <pathId> [--level <levelId>] [--exercise <exerciseId>]');
    process.exit(1);
  }

  try {
    await connectDB();

    const result = await AccessControlService.checkUserAccess(userId, pathId, levelId || null, exerciseId || null);
    console.log(JSON.stringify({
      ok: true,
      input: { userId, pathId, levelId: levelId || null, exerciseId: exerciseId || null },
      result
    }, null, 2));

    await mongoose.connection.close();
  } catch (err) {
    console.error('Smoke test failed:', err);
    try { await mongoose.connection.close(); } catch (_) {}
    process.exit(2);
  }
}

main();


