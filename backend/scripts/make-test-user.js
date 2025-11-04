// Create a minimal test user and print its id and JWT
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/codegenesis';
    await mongoose.connect(uri);

    const email = process.env.TEST_EMAIL || `test+${Date.now()}@example.com`;
    const user = await User.create({
      firebaseUid: `local_${Date.now()}`,
      email,
      userType: 'student',
      isVerified: true,
      isProfileComplete: true,
      roles: []
    });

    const secret = process.env.JWT_SECRET || 'devsecret';
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });

    console.log(JSON.stringify({
      userId: String(user._id),
      email: user.email,
      token
    }, null, 2));

    await mongoose.connection.close();
  } catch (e) {
    console.error(e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();







