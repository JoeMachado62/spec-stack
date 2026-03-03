const jwt = require('jsonwebtoken');
const { User } = require('../models');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const register = async (req, res) => {
    try {
        const { email, password, name, business_type } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required.' });
        }

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const user = await User.create({
            email,
            password_hash: password,
            name,
            business_type: business_type || null
        });

        const token = jwt.sign(
            { userId: user.user_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            token,
            user: user.toSafeJSON()
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to create account.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const valid = await user.validatePassword(password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Increment session count for progressive vocabulary exposure
        await user.update({ session_count: user.session_count + 1 });

        const token = jwt.sign(
            { userId: user.user_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            token,
            user: user.toSafeJSON()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to log in.' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ user: user.toSafeJSON() });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to retrieve profile.' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const { name, business_type, vocabulary_level } = req.body;
        if (name) user.name = name;
        if (business_type) user.business_type = business_type;
        if (vocabulary_level) user.vocabulary_level = vocabulary_level;

        await user.save();
        res.json({ user: user.toSafeJSON() });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
};

const storeApiKeys = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const { claude_key, openai_key } = req.body;
        const apiKeys = { ...user.api_keys };
        if (claude_key) apiKeys.claude = claude_key;
        if (openai_key) apiKeys.openai = openai_key;

        await user.update({ api_keys: apiKeys });
        res.json({ message: 'API keys stored securely.' });
    } catch (error) {
        console.error('Store API keys error:', error);
        res.status(500).json({ error: 'Failed to store API keys.' });
    }
};

module.exports = { register, login, getProfile, updateProfile, storeApiKeys };
