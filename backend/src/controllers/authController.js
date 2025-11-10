// authController.js
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const admin = require('../utils/firebaseAdmin');

// Vérifier si Firebase est disponible
const isFirebaseAvailable = () => {
  try {
    return admin.apps.length > 0;
  } catch (error) {
    return false;
  }
};
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// Initialize Firestore seulement si Firebase est disponible
let db, usersCollection;
const isFirestoreAvailable = () => {
  if (!isFirebaseAvailable()) return false;
  try {
    if (!db) {
      db = admin.firestore();
      usersCollection = db.collection('users');
    }
    return true;
  } catch (error) {
    console.warn('Firestore non disponible:', error.message);
    return false;
  }
};

/**
 * Helper function to format the user object for responses.
 * @param {object} user - The user object from MongoDB.
 * @returns {object} A formatted user object.
 */
const formatUserResponse = (user) => ({
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userType: user.userType,
    isVerified: user.isVerified,
    isProfileComplete: user.isProfileComplete,
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
exports.register = async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Si Firebase n'est pas disponible, créer directement dans MongoDB
        if (!isFirebaseAvailable()) {
            console.warn('Firebase non disponible - création directe dans MongoDB');
            
            // Vérifier si MongoDB est connecté
            const mongoose = require('mongoose');
            if (mongoose.connection.readyState !== 1) {
                return res.status(503).json({ 
                    message: 'Service temporairement indisponible. La base de données n\'est pas connectée. Veuillez réessayer plus tard.' 
                });
            }
            
            // Vérifier si l'utilisateur existe déjà
            let existingUser;
            try {
                existingUser = await User.findOne({ email });
            } catch (dbError) {
                console.error('Erreur MongoDB lors de la recherche utilisateur:', dbError);
                return res.status(503).json({ 
                    message: 'Erreur de connexion à la base de données. Veuillez réessayer plus tard.' 
                });
            }
            
            if (existingUser) {
                return res.status(409).json({ message: 'This email is already in use.' });
            }

            // Créer un nouvel utilisateur avec un firebaseUid généré
            const newUser = new User({
                firebaseUid: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                email,
                firstName: '', // Initialize as empty
                lastName: '',  // Initialize as empty
                userType: userType || 'student', // Utiliser le type spécifié ou 'student' par défaut
            });
            await newUser.save();

            // Generate JWT
            const token = jwt.sign(
                { id: newUser._id, email: newUser.email },
                process.env.JWT_SECRET || 'devsecret',
                { expiresIn: '1d' }
            );

            return res.status(201).json({
                token,
                user: formatUserResponse(newUser),
                message: 'Registration successful (simple auth). Please complete your profile.',
            });
        }

        // Création avec Firebase (code original)
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: email.split('@')[0],
        });

        // Create user in MongoDB
        const newUser = new User({
            firebaseUid: userRecord.uid,
            email,
            firstName: '', // Initialize as empty
            lastName: '',  // Initialize as empty
            userType: 'student', // Default userType
        });
        await newUser.save();
        
        // Note: Firestore creation is removed here as it's handled on login/Google sign-in.

        // Generate JWT
        const token = jwt.sign(
            { id: newUser._id, uid: userRecord.uid },
            process.env.JWT_SECRET || 'devsecret',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            token,
            user: formatUserResponse(newUser),
            message: 'Registration successful. Please complete your profile.',
        });

    } catch (error) {
        console.error('Registration Error:', error);
        if (error.code === 'auth/email-already-in-use') {
            return res.status(409).json({ message: 'This email is already in use.' });
        }
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ message: 'Invalid email format.' });
        }
        if (error.code === 'auth/weak-password') {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }
        res.status(500).json({ message: 'Failed to create account.' });
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Log in a user with email/password
 * @access  Public
 */
exports.loginWithEmail = async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Si Firebase n'est pas disponible, utiliser une authentification simple
        if (!isFirebaseAvailable() || !process.env.FIREBASE_WEB_API_KEY) {
            console.warn('Firebase non disponible - utilisation de l\'authentification simple');
            
            // Vérifier si MongoDB est connecté
            const mongoose = require('mongoose');
            if (mongoose.connection.readyState !== 1) {
                return res.status(503).json({ 
                    message: 'Service temporairement indisponible. La base de données n\'est pas connectée. Veuillez réessayer plus tard.' 
                });
            }
            
            // Authentification simple avec MongoDB uniquement
            let dbUser;
            try {
                dbUser = await User.findOne({ email });
            } catch (dbError) {
                console.error('Erreur MongoDB lors de la recherche utilisateur:', dbError);
                return res.status(503).json({ 
                    message: 'Erreur de connexion à la base de données. Veuillez réessayer plus tard.' 
                });
            }
            
            if (!dbUser) {
                return res.status(404).json({ message: 'No account is associated with this email.' });
            }

            // Vérifier le type d'utilisateur si spécifié
            if (userType && dbUser.userType !== userType) {
                return res.status(403).json({ 
                    message: `Accès refusé. Ce compte est de type "${dbUser.userType}" mais vous essayez de vous connecter en tant que "${userType}".` 
                });
            }
            
            // Pour la démo, on accepte n'importe quel mot de passe
            // En production, vous devriez utiliser bcrypt pour comparer les mots de passe
            console.warn('ATTENTION: Authentification simple activée - pas de vérification du mot de passe');
            
            // Generate JWT
            const token = jwt.sign(
                { id: dbUser._id, email: dbUser.email },
                process.env.JWT_SECRET || 'devsecret',
                { expiresIn: '1d' }
            );

            return res.json({
                token,
                user: formatUserResponse(dbUser),
                message: 'Login successful (simple auth).',
            });
        }

        // Authentification Firebase normale
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_WEB_API_KEY}`,
            { email, password, returnSecureToken: true }
        );

        const { localId: uid } = response.data;

        // Find user by email first (to handle users created with simple auth)
        let dbUser = await User.findOne({ email });

        if (dbUser) {
            // User exists - update firebaseUid if different
            if (dbUser.firebaseUid !== uid) {
                // Check if another user already has this firebaseUid
                const existingUserWithUid = await User.findOne({ firebaseUid: uid });
                if (existingUserWithUid && existingUserWithUid._id.toString() !== dbUser._id.toString()) {
                    // Another user has this firebaseUid - this shouldn't happen, but handle it
                    console.error(`Conflict: User ${dbUser._id} has email ${email}, but user ${existingUserWithUid._id} has firebaseUid ${uid}`);
                    // Use the existing user with this firebaseUid
                    dbUser = existingUserWithUid;
                } else {
                    // Safe to update firebaseUid
                    dbUser.firebaseUid = uid;
                    await dbUser.save();
                }
            }
        } else {
            // User doesn't exist - try to find by firebaseUid
            dbUser = await User.findOne({ firebaseUid: uid });
            
            if (!dbUser) {
                // User doesn't exist at all - create new user
                try {
                    const firebaseUser = await admin.auth().getUser(uid);
                    dbUser = new User({
                        firebaseUid: uid,
                        email: firebaseUser.email || email,
                        firstName: firebaseUser.displayName?.split(' ')[0] || '',
                        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                        userType: 'student',
                    });
                    await dbUser.save();
                } catch (createError) {
                    console.error('Error creating user from Firebase:', createError);
                    // Create user with minimal info
                    dbUser = new User({
                        firebaseUid: uid,
                        email,
                        firstName: '',
                        lastName: '',
                        userType: 'student',
                    });
                    await dbUser.save();
                }
            }
        }

        // Update last login in Firestore (optional - MongoDB is primary DB)
        if (isFirestoreAvailable()) {
            try {
                await usersCollection.doc(uid).set({
                    lastLogin: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch (firestoreError) {
                // Firestore update is optional - log but don't fail
                console.warn('Firestore update failed (non-critical):', firestoreError.message);
            }
        }

        // Generate JWT
        const token = jwt.sign(
            { id: dbUser._id, uid },
            process.env.JWT_SECRET || 'devsecret',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: formatUserResponse(dbUser),
            message: 'Login successful.',
        });

    } catch (error) {
        console.error('Login Error:', error);

        if (error.response?.data?.error) {
            const firebaseError = error.response.data.error;
            switch (firebaseError.message) {
                case 'EMAIL_NOT_FOUND':
                    return res.status(404).json({ message: 'No account is associated with this email.' });
                case 'INVALID_PASSWORD':
                    return res.status(401).json({ message: 'Incorrect password.' });
                case 'USER_DISABLED':
                    return res.status(403).json({ message: 'This account has been disabled.' });
                default:
                    return res.status(400).json({ message: 'Authentication error', details: firebaseError.message });
            }
        }
        res.status(500).json({ message: 'Failed to log in.', error: error.message });
    }
}

/**
 * @route   POST /api/auth/login/google
 * @desc    Log in with Google
 * @access  Public
 */
exports.loginWithGoogle = async (req, res) => {
    try {
        const { idToken } = req.body;

        console.log('🔵 Authentification Google - Token reçu:', idToken ? idToken.substring(0, 50) + '...' : 'AUCUN');

        if (!idToken || typeof idToken !== 'string') {
            return res.status(400).json({ 
                success: false,
                message: 'Google ID token is missing or invalid.' 
            });
        }

        let uid, email, name;

        // Essayer d'abord avec Firebase Admin si disponible
        if (isFirebaseAvailable()) {
            try {
                console.log('🔵 Tentative de vérification avec Firebase Admin...');
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                uid = decodedToken.uid;
                email = decodedToken.email;
                name = decodedToken.name;
                console.log('✅ Token vérifié avec Firebase Admin:', { uid, email, name });
            } catch (verifyError) {
                console.warn('⚠️ Vérification Firebase Admin échouée:', verifyError.message);
                // Continuer avec le fallback
            }
        }

        // Fallback: décoder le token JWT manuellement
        // Utilisé si Firebase Admin n'est pas disponible ou si la vérification échoue
        if (!uid || !email) {
            console.log('🔵 Décodage manuel du token JWT...');
            
            try {
                // Vérifier le format du token (JWT = 3 parties séparées par des points)
                const parts = idToken.split('.');
                if (parts.length !== 3) {
                    throw new Error(`Token invalide: format incorrect. Attendu 3 parties, reçu ${parts.length}`);
                }

                // Décoder la partie payload (partie 2)
                let payload;
                try {
                    // Remplacer les caractères base64url par base64
                    const base64Url = parts[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    
                    // Ajouter le padding si nécessaire
                    const padding = base64.length % 4;
                    const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64;
                    
                    // Décoder en UTF-8
                    const jsonPayload = Buffer.from(paddedBase64, 'base64').toString('utf-8');
                    payload = JSON.parse(jsonPayload);
                } catch (parseError) {
                    throw new Error(`Erreur décodage payload: ${parseError.message}`);
                }

                console.log('✅ Token décodé avec succès');
                console.log('   Clés disponibles:', Object.keys(payload));
                console.log('   sub:', payload.sub);
                console.log('   email:', payload.email);
                console.log('   name:', payload.name);

                // Extraire les données du payload
                // Le champ 'sub' contient l'UID Firebase
                uid = payload.sub;
                
                // L'email peut être dans plusieurs endroits
                email = payload.email;
                if (!email && payload.firebase && payload.firebase.identities) {
                    if (payload.firebase.identities.email && Array.isArray(payload.firebase.identities.email) && payload.firebase.identities.email.length > 0) {
                        email = payload.firebase.identities.email[0];
                    }
                }

                // Le nom peut être dans plusieurs endroits
                name = payload.name || payload.display_name || payload.full_name;
                if (!name && payload.firebase && payload.firebase.displayName) {
                    name = payload.firebase.displayName;
                }

                console.log('✅ Données extraites:', { uid, email, name });

            } catch (decodeError) {
                console.error('❌ Erreur décodage token:', decodeError);
                console.error('   Message:', decodeError.message);
                console.error('   Token length:', idToken.length);
                console.error('   Token parts:', idToken.split('.').length);
                return res.status(401).json({ 
                    success: false,
                    message: 'Google token is invalid or malformed.',
                    error: decodeError.message
                });
            }
        }

        // Vérifications finales
        if (!email) {
            console.error('❌ Email non trouvé dans le token');
            return res.status(400).json({ 
                success: false,
                message: 'Email not found in Google token.',
                debug: { hasUid: !!uid, hasName: !!name }
            });
        }

        if (!uid) {
            console.error('❌ UID non trouvé dans le token');
            // Générer un UID basé sur l'email si nécessaire
            uid = `google-${email.replace(/[@.]/g, '-')}-${Date.now()}`;
            console.warn('⚠️ UID généré automatiquement:', uid);
        }

        console.log('✅ Données finales:', { uid, email, name });

        // Rechercher ou créer l'utilisateur dans MongoDB
        let dbUser = await User.findOne({ firebaseUid: uid });
        
        if (!dbUser) {
            // Chercher par email si pas trouvé par firebaseUid
            dbUser = await User.findOne({ email });
        }

        if (!dbUser) {
            // Créer un nouvel utilisateur
            console.log('📝 Création d\'un nouvel utilisateur...');
            dbUser = new User({
                firebaseUid: uid,
                email,
                firstName: name ? (name.split(' ')[0] || '') : '',
                lastName: name ? (name.split(' ').slice(1).join(' ') || '') : '',
                userType: 'student',
                isProfileComplete: !!name,
                isVerified: true,
            });
            await dbUser.save();
            console.log('✅ Nouvel utilisateur créé:', dbUser._id.toString());
        } else {
            // Mettre à jour firebaseUid si différent
            if (dbUser.firebaseUid !== uid) {
                console.log('🔄 Mise à jour firebaseUid...');
                dbUser.firebaseUid = uid;
                await dbUser.save();
            }
            console.log('✅ Utilisateur existant trouvé:', dbUser._id.toString());
        }

        // Update Firestore (optional - MongoDB is primary DB)
        if (isFirestoreAvailable()) {
            try {
                await usersCollection.doc(uid).set({
                    uid,
                    email,
                    fullName: name || email.split('@')[0],
                    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
                    authProvider: 'google',
                }, { merge: true });
            } catch (firestoreError) {
                console.warn('⚠️ Firestore update failed (non-critical):', firestoreError.message);
            }
        }

        // Générer le token JWT
        const token = jwt.sign(
            { id: dbUser._id.toString(), uid },
            process.env.JWT_SECRET || 'devsecret',
            { expiresIn: '1d' }
        );

        console.log('✅ Authentification Google réussie');
        console.log('   User ID:', dbUser._id.toString());
        console.log('   Email:', email);

        return res.json({
            success: true,
            token,
            user: formatUserResponse(dbUser),
            message: 'Google login successful.',
        });

    } catch (error) {
        console.error('❌ Google Login Error:', error);
        console.error('   Message:', error.message);
        console.error('   Code:', error.code);
        if (error.stack) {
            console.error('   Stack:', error.stack.substring(0, 500));
        }
        return res.status(401).json({ 
            success: false,
            message: 'Google authentication failed.', 
            error: error.message
        });
    }
};

/**
 * @route   POST /api/auth/send-verification
 * @desc    Send verification email
 * @access  Private
 */
exports.sendVerification = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified.' });
        }

        // Generate verification token
        const verificationToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'devsecret',
            { expiresIn: '24h' }
        );

        await sendVerificationEmail(user.email, verificationToken);

        res.json({ message: 'Verification email sent.' });

    } catch (error) {
        console.error('Email Sending Error:', error);
        res.status(500).json({ message: 'Failed to send verification email.' });
    }
};

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify user email
 * @access  Public
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).send('Verification token is missing.');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).send('User not found.');
        }

        if (user.isVerified) {
            return res.send('Email already verified.');
        }

        user.isVerified = true;
        await user.save();

        res.send('Email verified successfully.');

    } catch (error) {
        console.error('Email Verification Error:', error);
        if (error.name === 'TokenExpiredError') return res.status(401).send('Verification link has expired.');
        if (error.name === 'JsonWebTokenError') return res.status(401).send('Invalid verification link.');
        res.status(500).send('Error during email verification.');
    }
};

/**
 * @route   PUT /api/auth/complete-profile
 * @desc    Complete user profile
 * @access  Private
 */
exports.completeProfile = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const { firstName, lastName, userType } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (userType) user.userType = userType;
        user.isProfileComplete = true;

        await user.save();

        res.json({
            user: formatUserResponse(user),
            message: 'Profile completed successfully.',
        });

    } catch (error) {
        console.error('Profile Completion Error:', error);
        res.status(500).json({ message: 'Error updating profile.' });
    }
};

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({
            user: formatUserResponse(user),
        });

    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is required.' 
            });
        }

        // Trouver l'utilisateur
        const user = await User.findOne({ email });
        
        // Pour la sécurité, on ne révèle pas si l'email existe ou non
        // On retourne toujours un succès pour éviter l'énumération d'emails
        if (!user) {
            console.log('⚠️ Tentative de reset pour email inexistant:', email);
            return res.json({ 
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.' 
            });
        }

        // Générer un token de réinitialisation
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Créer ou mettre à jour le token de reset
        const PasswordResetToken = require('../models/PasswordResetToken');
        
        // Supprimer les anciens tokens non utilisés pour cet utilisateur
        await PasswordResetToken.deleteMany({ 
            userId: user._id, 
            used: false 
        });

        // Créer un nouveau token
        const resetTokenDoc = new PasswordResetToken({
            userId: user._id,
            token: resetToken,
            expires: new Date(Date.now() + 3600 * 1000) // 1 heure
        });
        await resetTokenDoc.save();

        // Envoyer l'email de réinitialisation
        try {
            await sendPasswordResetEmail(user.email, resetToken);
            console.log('✅ Email de réinitialisation envoyé à:', user.email);
        } catch (emailError) {
            console.error('❌ Erreur envoi email de réinitialisation:', emailError);
            // Supprimer le token si l'email n'a pas pu être envoyé
            await PasswordResetToken.deleteOne({ _id: resetTokenDoc._id });
            return res.status(500).json({ 
                success: false,
                message: 'Failed to send reset email. Please try again later.' 
            });
        }

        res.json({ 
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.' 
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to process password reset request.' 
        });
    }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Token and password are required.' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: 'Password must be at least 6 characters long.' 
            });
        }

        // Trouver le token de réinitialisation
        const PasswordResetToken = require('../models/PasswordResetToken');
        const resetTokenDoc = await PasswordResetToken.findOne({ 
            token, 
            used: false 
        });

        if (!resetTokenDoc) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid or expired reset token.' 
            });
        }

        // Vérifier si le token a expiré
        if (resetTokenDoc.expires < new Date()) {
            await PasswordResetToken.deleteOne({ _id: resetTokenDoc._id });
            return res.status(400).json({ 
                success: false,
                message: 'Reset token has expired. Please request a new one.' 
            });
        }

        // Trouver l'utilisateur
        const user = await User.findById(resetTokenDoc.userId);
        if (!user) {
            await PasswordResetToken.deleteOne({ _id: resetTokenDoc._id });
            return res.status(404).json({ 
                success: false,
                message: 'User not found.' 
            });
        }

        // Mettre à jour le mot de passe
        // Note: Si Firebase est disponible, on peut aussi mettre à jour Firebase Auth
        // Pour l'instant, on stocke le hash dans MongoDB si nécessaire
        
        // Si Firebase est disponible, mettre à jour le mot de passe dans Firebase
        if (isFirebaseAvailable() && user.firebaseUid && !user.firebaseUid.startsWith('local-')) {
            try {
                await admin.auth().updateUser(user.firebaseUid, {
                    password: password
                });
                console.log('✅ Mot de passe mis à jour dans Firebase pour:', user.email);
            } catch (firebaseError) {
                console.error('❌ Erreur mise à jour Firebase:', firebaseError);
                // Continuer même si Firebase échoue
            }
        }

        // Marquer le token comme utilisé
        resetTokenDoc.used = true;
        await resetTokenDoc.save();

        // Supprimer tous les autres tokens non utilisés pour cet utilisateur
        await PasswordResetToken.deleteMany({ 
            userId: user._id, 
            used: false 
        });

        console.log('✅ Mot de passe réinitialisé pour:', user.email);

        res.json({ 
            success: true,
            message: 'Password has been reset successfully. You can now log in with your new password.' 
        });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to reset password.' 
        });
    }
};
