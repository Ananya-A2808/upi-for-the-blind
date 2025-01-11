const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Registration validation
const registerValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];

router.post('/register', registerValidation, authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router; 