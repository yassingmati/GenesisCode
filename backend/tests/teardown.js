module.exports = async () => {
  // Nettoyage global après tous les tests
  // Mongoose et MongoDB Memory Server sont déjà nettoyés dans setup.js
  console.log('✅ Global teardown completed');
};

