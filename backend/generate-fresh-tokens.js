// Générer des tokens frais pour les tests
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'devsecret';

const users = [
  {
    id: '68f255f939d55ec4ff20c936',
    email: 'yassine1.gmatii@gmail.com'
  },
  {
    id: '68f6460c74ab496c1885e395',
    email: 'test+1760970252689@example.com'
  }
];

console.log('🔑 GÉNÉRATION DE TOKENS FRAIS');
console.log('============================\n');

users.forEach((user, index) => {
  const payload = {
    id: user.id,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 heures
  };

  const token = jwt.sign(payload, secret);

  console.log(`Utilisateur ${index + 1}:`);
  console.log(`  ID: ${user.id}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Token: ${token}`);
  console.log();
});

console.log('✅ Tokens générés avec succès!');
