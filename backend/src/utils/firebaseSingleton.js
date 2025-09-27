const admin = require('firebase-admin');

class FirebaseAdmin {
  static instance = null;
  
  static getInstance() {
    if (!FirebaseAdmin.instance) {
      try {
        // Vérifier si Firebase est déjà initialisé
        if (admin.apps.length > 0) {
          FirebaseAdmin.instance = admin.app();
          console.log('♻️ Reusing existing Firebase app');
          return FirebaseAdmin.instance;
        }
        
        // Vérifier les variables d'environnement
        if (!process.env.FIREBASE_PROJECT_ID || 
            !process.env.FIREBASE_CLIENT_EMAIL || 
            !process.env.FIREBASE_PRIVATE_KEY) {
          throw new Error('Firebase environment variables are missing!');
        }

        // Corriger les sauts de ligne dans la clé privée
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

        const serviceAccount = {
          type: 'service_account',
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: privateKey,
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
        };

        FirebaseAdmin.instance = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
        
        console.log('🔥 Firebase Admin initialized successfully');
      } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        throw error;
      }
    }
    return FirebaseAdmin.instance;
  }
}

module.exports = FirebaseAdmin;