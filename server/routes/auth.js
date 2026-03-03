const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { register, login, getProfile, updateProfile, storeApiKeys } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/api-keys', authenticate, storeApiKeys);

module.exports = router;
