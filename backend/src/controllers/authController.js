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
const sendVerificationEmail = require('../utils/emailService');

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
                        userType: 'student', // Default role
                    });
                    await dbUser.save();
                } catch (createError) {
                    // If user creation fails due to duplicate key, try to find by email again
                    if (createError.code === 11000) {
                        console.warn('Duplicate key error during user creation, retrying find by email');
                        dbUser = await User.findOne({ email });
                        if (!dbUser) {
                            throw createError; // Re-throw if still not found
                        }
                    } else {
                        throw createError; // Re-throw other errors
                    }
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
};

/**
 * @route   POST /api/auth/login/google
 * @desc    Log in with Google
 * @access  Public
 */
exports.loginWithGoogle = async (req, res) => {
    try {
        const { idToken } = req.body;

        console.log('🔵 Authentification Google - Token reçu:', idToken ? idToken.substring(0, 50) + '...' : 'AUCUN');

        if (!idToken) {
            return res.status(400).json({ message: 'Google ID token is missing.' });
        }

        let uid, email, name;

        // Si Firebase Admin est disponible, vérifier le token
        if (isFirebaseAvailable()) {
            try {
                console.log('🔵 Vérification token avec Firebase Admin...');
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                uid = decodedToken.uid;
                email = decodedToken.email;
                name = decodedToken.name;
                console.log('✅ Token vérifié avec Firebase Admin:', { uid, email, name });
            } catch (verifyError) {
                console.error('❌ Erreur vérification token Google:', verifyError);
                if (verifyError.code === 'auth/id-token-expired') {
                    return res.status(401).json({ message: 'Google token has expired.' });
                }
                if (verifyError.code === 'auth/id-token-invalid') {
                    return res.status(401).json({ message: 'Google token is invalid.' });
                }
                // Si la vérification échoue, essayer le fallback
                console.warn('⚠️ Vérification Firebase échouée, utilisation du fallback...');
                throw verifyError;
            }
        }
        
        // Fallback: décoder le token JWT sans vérification Firebase
        // Utilisé si Firebase Admin n'est pas disponible ou si la vérification échoue
        if (!uid || !email) {
            console.warn('⚠️ Firebase Admin non disponible ou vérification échouée - décodage token Google sans vérification');
            try {
                // Vérifier que le token a le bon format (3 parties séparées par des points)
                const tokenParts = idToken.split('.');
                if (tokenParts.length !== 3) {
                    throw new Error('Token invalide: format incorrect (doit avoir 3 parties)');
                }
                
                // Décoder le token JWT (sans vérification de signature)
                const base64Url = tokenParts[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
                const decoded = JSON.parse(jsonPayload);
                
                console.log('✅ Token Google décodé (fallback):', {
                    hasSub: !!decoded.sub,
                    hasEmail: !!decoded.email,
                    hasName: !!decoded.name,
                    email: decoded.email,
                    allKeys: Object.keys(decoded)
                });
                
                // Firebase Auth token contient généralement: sub, email, name, picture, etc.
                uid = decoded.sub || decoded.user_id || decoded.uid || decoded.firebase?.identities?.email?.[0] || `google-${Date.now()}`;
                email = decoded.email || decoded.email_address || decoded.firebase?.email;
                name = decoded.name || decoded.display_name || decoded.full_name || decoded.firebase?.displayName;
            } catch (decodeError) {
                console.error('❌ Erreur décodage token Google:', decodeError);
                console.error('   Token reçu:', idToken.substring(0, 50) + '...');
                console.error('   Stack:', decodeError.stack);
                return res.status(401).json({ 
                    message: 'Google token is invalid or malformed.',
                    error: decodeError.message 
                });
            }
        }

        // Vérifier que l'email est présent
        if (!email) {
            return res.status(400).json({ message: 'Email not found in Google token.' });
        }

        // Find or create user in MongoDB
        let dbUser = await User.findOne({ firebaseUid: uid });
        
        // Si pas trouvé par firebaseUid, chercher par email
        if (!dbUser) {
            dbUser = await User.findOne({ email });
        }

        if (!dbUser) {
            // Créer un nouvel utilisateur
            dbUser = new User({
                firebaseUid: uid,
                email,
                firstName: name?.split(' ')[0] || '',
                lastName: name?.split(' ').slice(1).join(' ') || '',
                userType: 'student',
                isProfileComplete: !!name, // Profile is complete if Google provided a name
                isVerified: true, // Email is verified by Google
            });
            await dbUser.save();
        } else {
            // Mettre à jour firebaseUid si différent
            if (dbUser.firebaseUid !== uid) {
                dbUser.firebaseUid = uid;
                await dbUser.save();
            }
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
            message: 'Google login successful.',
        });

    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(401).json({ message: 'Google authentication failed.', error: error.message });
    }
};

/**
 * @route   POST /api/auth/send-verification
 * @desc    Send verification email
 * @access  Private
 */
exports.sendVerificationEmail = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified.' });
        }

        // Generate a verification token
        const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1h' });
        
        // Send the email
        await sendVerificationEmail(user.email, verificationToken);
        
        res.json({ message: 'Verification email sent.' });

    } catch (error) {
        console.error('Email Sending Error:', error);
        res.status(500).json({ message: 'Failed to send verification email.' });
    }
};

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify email via token
 * @access  Public
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (user.isVerified) return res.status(400).json({ message: 'Email already verified.' });

        user.isVerified = true;
        await user.save();

        // Redirect to a success page on the front-end
        return res.redirect(`${process.env.CLIENT_URL}/verified-success`);
    } catch (error) {
        console.error('Email Verification Error:', error);
        if (error.name === 'TokenExpiredError') return res.status(401).send('Verification link has expired.');
        if (error.name === 'JsonWebTokenError') return res.status(401).send('Invalid verification link.');
        res.status(500).send('Error during email verification.');
    }
};

/**
 * @route   PUT /api/profile/complete
 * @desc    Complete user profile
 * @access  Private
 */
exports.completeProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, userType } = req.body;
        const userId = req.user.id;

        // Validate fields
        if (!firstName || !lastName || !userType) {
            return res.status(400).json({ message: 'First name, last name, and user type are required.' });
        }
        if (!['student', 'parent'].includes(userType)) {
            return res.status(400).json({ message: 'Invalid user type.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update profile
        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;
        user.userType = userType;
        user.isProfileComplete = true;
        await user.save();

        res.json({
            message: 'Profile completed successfully.',
            user: formatUserResponse(user)
        });

    } catch (error) {
        console.error('Profile Completion Error:', error);
        res.status(500).json({ message: 'Error updating profile.' });
    }
};

/**
 * @route   GET /api/profile
 * @desc    Get user profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-firebaseUid -__v');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(formatUserResponse(user));

    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};