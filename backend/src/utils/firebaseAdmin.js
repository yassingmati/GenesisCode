    // backend/src/utils/firebaseAdmin.js
    const admin = require('firebase-admin');

    // Solution avec variables d'environnement
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    const normalizedPrivateKey = rawPrivateKey
      ? rawPrivateKey.replace(/\\n/g, '\n')
      : '';

    const firebaseConfig = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: normalizedPrivateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: "googleapis.com"
    };

try {
if (!admin.apps.length) {
    // Vérifier si toutes les variables Firebase sont définies
    const requiredVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY_ID', 
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_CLIENT_ID',
        'FIREBASE_CLIENT_X509_CERT_URL'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.warn('Variables Firebase manquantes:', missingVars.join(', '));
        console.warn('Firebase Admin sera désactivé - certaines fonctionnalités ne fonctionneront pas');
    } else if (normalizedPrivateKey) {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig)
        });
        console.log('Firebase Admin initialisé avec succès via .env');
    } else {
        console.warn('Clé privée Firebase manquante - Firebase Admin désactivé');
    }
}
} catch (error) {
console.error('Erreur d\'initialisation Firebase Admin', error);
console.warn('Firebase Admin sera désactivé - certaines fonctionnalités ne fonctionneront pas');
}

    module.exports = admin;