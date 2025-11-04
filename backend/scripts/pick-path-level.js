// Pick first available path and its first level
require('dotenv').config();
const mongoose = require('mongoose');
const Path = require('../src/models/Path');
const Level = require('../src/models/Level');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/codegenesis';
    await mongoose.connect(uri);

    const path = await Path.findOne().populate('levels').lean();
    if (!path) throw new Error('No path found');
    const levelId = Array.isArray(path.levels) && path.levels.length ? String(path.levels[0]._id || path.levels[0]) : null;

    console.log(JSON.stringify({
      pathId: String(path._id),
      levelId
    }, null, 2));

    await mongoose.connection.close();
  } catch (e) {
    console.error(e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();









