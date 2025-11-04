// Créer un token JWT valide pour l'utilisateur
const jwt = require('jsonwebtoken');

const userId = '68f255f939d55ec4ff20c936';
const userEmail = 'yassine1.gmatii@gmail.com';
const secret = process.env.JWT_SECRET || 'devsecret';

// Créer le payload
const payload = {
  id: userId,
  email: userEmail,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 heures
};

// Générer le token
const token = jwt.sign(payload, secret);

console.log('🔑 Token JWT créé pour l\'utilisateur:');
console.log('=====================================');
console.log(`User ID: ${userId}`);
console.log(`Email: ${userEmail}`);
console.log(`Token: ${token}`);
console.log('\n📋 Instructions:');
console.log('1. Copier ce token');
console.log('2. L\'injecter dans le localStorage du navigateur');
console.log('3. Recharger la page');
console.log('\n💻 Script d\'injection:');
console.log(`localStorage.setItem('token', '${token}');`);
console.log(`localStorage.setItem('user', JSON.stringify({id: '${userId}', email: '${userEmail}'}));`);
console.log('location.reload();');
