// gen-admin-token.js
const jwt = require('jsonwebtoken');

const ADMIN_ID = '688378731279e796d925ae02'; // remplace par l'ObjectId (string) d'un admin existant
const secret = process.env.JWT_ADMIN_SECRET || 'TEST_JWT_SECRET';

const token = jwt.sign({ id: ADMIN_ID }, secret, { expiresIn: '7d' });
console.log('Admin token (use as Bearer):', token);
