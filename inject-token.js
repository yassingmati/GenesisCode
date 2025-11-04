// Script pour injecter le token dans le frontend
// À exécuter dans la console du navigateur (F12)

console.log('🔧 Injection du token d\'authentification...');

// Token JWT valide pour l'utilisateur test
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjY0NjBjNzRhYjQ5NmMxODg1ZTM5NSIsImVtYWlsIjoidGVzdCsxNzYwOTcwMjUyNjg5QGV4YW1wbGUuY29tIiwiaWF0IjoxNzYwOTcwNzQzLCJleHAiOjE3NjEwNTcxNDN9.nMQQHJzi83Qo96JawayWPbVFRWDjl88ucEkTKa-1ZlU';

// Données utilisateur
const userData = {
  id: '68f6460c74ab496c1885e395',
  email: 'test+1760970252689@example.com',
  userType: 'student',
  name: 'Test User'
};

// Injecter dans localStorage
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(userData));

console.log('✅ Token et données utilisateur injectés avec succès !');
console.log('🔄 Rechargez la page pour voir les changements.');

// Vérifier l'injection
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Test d'une requête API
fetch('http://localhost:5000/api/courses/paths/68f258d68ffd13c2ba35e4b2/levels', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('🧪 Test API - Status:', response.status);
  if (response.ok) {
    console.log('✅ L\'API fonctionne correctement avec le token !');
  } else {
    console.log('❌ Problème avec l\'API');
  }
})
.catch(error => {
  console.log('❌ Erreur API:', error);
});

console.log('📋 Instructions:');
console.log('1. Rechargez la page (F5)');
console.log('2. Les erreurs 401 devraient disparaître');
console.log('3. Le contenu ne devrait plus afficher "Contenu Verrouillé"');
