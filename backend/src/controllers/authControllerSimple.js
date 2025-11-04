// authControllerSimple.js - Version simplifiée sans Firebase
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'This email is already in use.' });
        }

        // Créer un nouvel utilisateur
        const newUser = new User({
            firebaseUid: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            email,
            firstName: '', // Initialize as empty
            lastName: '',  // Initialize as empty
            userType: 'student', // Default userType
        });
        await newUser.save();

        // Generate JWT
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
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
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Trouver l'utilisateur dans MongoDB
        const dbUser = await User.findOne({ email });
        
        if (!dbUser) {
            return res.status(404).json({ message: 'No account is associated with this email.' });
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

        res.json({
            token,
            user: formatUserResponse(dbUser),
            message: 'Login successful.',
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Failed to log in.', error: error.message });
    }
};

/**
 * @route   POST /api/auth/login/google
 * @desc    Log in with Google (simplified)
 * @access  Public
 */
exports.loginWithGoogle = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: 'Google ID token is missing.' });
        }

        // Pour la démo, on simule une authentification Google
        console.warn('ATTENTION: Authentification Google simplifiée - pas de vérification du token');
        
        // Créer ou trouver un utilisateur de test
        let dbUser = await User.findOne({ email: 'google-test@example.com' });

        if (!dbUser) {
            dbUser = new User({
                firebaseUid: `google-${Date.now()}`,
                email: 'google-test@example.com',
                firstName: 'Google',
                lastName: 'User',
                userType: 'student',
                isProfileComplete: true,
                isVerified: true,
            });
            await dbUser.save();
        }

        // Generate JWT
        const token = jwt.sign(
            { id: dbUser._id, email: dbUser.email },
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
 * @desc    Send verification email (simplified)
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

        // Pour la démo, on simule l'envoi d'email
        console.log(`Simulation: Email de vérification envoyé à ${user.email}`);
        
        res.json({ message: 'Verification email sent (simulated).' });

    } catch (error) {
        console.error('Email Sending Error:', error);
        res.status(500).json({ message: 'Failed to send verification email.' });
    }
};

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify email via token (simplified)
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
