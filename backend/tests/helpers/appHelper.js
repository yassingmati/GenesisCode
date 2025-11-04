const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

/**
 * Crée une instance Express pour les tests
 */
function createTestApp() {
  const app = express();
  
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  return app;
}

module.exports = { createTestApp };

