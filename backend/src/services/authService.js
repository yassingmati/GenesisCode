// src/services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Client pour vérifier les tokens Google
// Note: Le client ID n'est pas strictement nécessaire pour verifyIdToken si on ne filtre pas par aud pour l'instant,
// mais c'est mieux si on l'a. On le récupèrera des var d'env si dispo.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
    /**
     * Hash a password securely
     * @param {string} password 
     * @returns {Promise<string>}
     */
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    /**
     * Compare a plain password with a hash
     * @param {string} password 
     * @param {string} hash 
     * @returns {Promise<boolean>}
     */
    async comparePassword(password, hash) {
        if (!hash) return false;
        return bcrypt.compare(password, hash);
    }

    /**
     * Generate a JWT token for a user
     * @param {Object} user 
     * @returns {string} token
     */
    generateToken(user) {
        const payload = {
            id: user._id,
            email: user.email,
            uid: user.firebaseUid
        };

        return jwt.sign(
            payload,
            process.env.JWT_SECRET || 'devsecret',
            { expiresIn: '7d' }
        );
    }

    /**
     * Verify a Google ID Token securely
     * @param {string} idToken 
     * @returns {Promise<Object>} Payload containing email, sub, etc.
     * @throws {Error} If token is invalid or unsign
     */
    async verifyGoogleToken(idToken) {
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: idToken,
                // audience: process.env.GOOGLE_CLIENT_ID,  // Specify if available to prevent confusing tokens from other apps
            });
            const payload = ticket.getPayload();
            return payload;
        } catch (error) {
            console.error('Google Token Verification Failed:', error.message);
            throw new Error('Invalid Google Token');
        }
    }

    /**
     * Simple validation for email format
     * @param {string} email 
     * @returns {boolean}
     */
    validateEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
}

module.exports = new AuthService();
