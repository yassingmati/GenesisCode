// src/services/userService.js
const User = require('../models/User');

class UserService {
    /**
     * Find a user by their Email
     * @param {string} email 
     * @returns {Promise<import('../models/User')|null>}
     */
    async findByEmail(email) {
        return User.findOne({ email });
    }

    /**
     * Find a user by email and include the local password hash (normally hidden)
     * @param {string} email 
     * @returns {Promise<import('../models/User')|null>}
     */
    async findByEmailWithPassword(email) {
        return User.findOne({ email }).select('+localPasswordHash');
    }

    /**
     * Find a user by their Firebase UID
     * @param {string} firebaseUid 
     * @returns {Promise<import('../models/User')|null>}
     */
    async findByFirebaseUid(firebaseUid) {
        return User.findOne({ firebaseUid });
    }

    /**
     * Find a user by their MongoDB ID
     * @param {string} id 
     * @returns {Promise<import('../models/User')|null>}
     */
    async findById(id) {
        return User.findById(id);
    }

    /**
     * Create a new user in MongoDB
     * @param {Object} userData 
     * @returns {Promise<import('../models/User')>}
     */
    async createUser(userData) {
        const {
            firebaseUid,
            email,
            firstName = '',
            lastName = '',
            userType = 'student',
            isVerified = false,
            isProfileComplete = false,
            passwordHash = null // Optional fallback password
        } = userData;

        // Check if user already exists
        const existing = await this.findByEmail(email);
        if (existing) {
            throw new Error('User with this email already exists');
        }

        const newUser = new User({
            firebaseUid,
            email,
            firstName,
            lastName,
            userType,
            isVerified,
            isProfileComplete
        });

        // Store local password hash if provided (we need to add this field to the model first, 
        // but we can store it temporarily or add it to the schema in the next step)
        if (passwordHash) {
            newUser.localPasswordHash = passwordHash;
        }

        return await newUser.save();
    }

    /**
     * Update user details
     * @param {string} userId 
     * @param {Object} updates 
     * @returns {Promise<import('../models/User')>}
     */
    async updateUser(userId, updates) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        Object.keys(updates).forEach(key => {
            // Prevent updating sensitive fields securely if needed, 
            // but for now we trust the controller/caller
            user[key] = updates[key];
        });

        // Auto update profile complete status if applicable
        if (updates.firstName || updates.lastName || updates.userType) {
            // Logic could be refined, but we stick to explicit updates for now to avoid side effects
        }

        return await user.save();
    }
}

module.exports = new UserService();
