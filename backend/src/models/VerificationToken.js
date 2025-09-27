// models/VerificationToken.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const verificationTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  token:   { type: String, required: true },
  expires: { type: Date, default: () => Date.now() + 3600 * 1000 } // 1h
});

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);
