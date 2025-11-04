const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    // Accept both MONGODB_URI and MONGO_URI for compatibility across server and scripts
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
});

module.exports = connectDB;