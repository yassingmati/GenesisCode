// Firebase Functions entry point for Express backend
const functions = require('firebase-functions');
const express = require('express');

// Import the Express app from the Firebase-compatible index
const app = require('../src/index-firebase');

// Create a Firebase Function that serves the Express app
// The function will be available at: https://<region>-<project-id>.cloudfunctions.net/api
// 
// Note: For custom domain, you can use Firebase Hosting rewrites to map /api/* to this function
exports.api = functions
  .region('us-central1') // Change to your preferred region
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB' // Increase if needed (128MB, 256MB, 512MB, 1GB, 2GB, 4GB, 8GB)
  })
  .https.onRequest(app);
