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
if (isFirebaseAvailable()) {
  try {
    db = admin.firestore();
    usersCollection = db.collection('users');
  } catch (error) {
    console.warn('Firestore non disponible:', error.message);
  }
}

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

        // Find or create user in MongoDB
        let dbUser = await User.findOne({ firebaseUid: uid });

        if (!dbUser) {
            const firebaseUser = await admin.auth().getUser(uid);
            dbUser = new User({
                firebaseUid: uid,
                email: firebaseUser.email,
                userType: 'student', // Default role
            });
            await dbUser.save();
        }

        // Update last login in Firestore
        if (isFirebaseAvailable()) {
            await usersCollection.doc(uid).set({
                lastLogin: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
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

        if (!idToken) {
            return res.status(400).json({ message: 'Google ID token is missing.' });
        }

        // Verify Google ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name } = decodedToken;

        // Find or create user in MongoDB
        let dbUser = await User.findOne({ firebaseUid: uid });

        if (!dbUser) {
            dbUser = new User({
                firebaseUid: uid,
                email,
                firstName: name?.split(' ')[0] || '',
                lastName: name?.split(' ')[1] || '',
                userType: 'student',
                isProfileComplete: !!name, // Profile is complete if Google provided a name
                isVerified: true, // Email is verified by Google
            });
            await dbUser.save();
        }

        // Update Firestore
        await usersCollection.doc(uid).set({
            uid,
            email,
            fullName: name || email.split('@')[0],
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            authProvider: 'google',
        }, { merge: true });

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
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ message: 'Google token has expired.' });
        }
        if (error.code === 'auth/id-token-invalid') {
            return res.status(401).json({ message: 'Google token is invalid.' });
        }
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