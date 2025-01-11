const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/email');

const authController = {
    // Login handler
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Input validation
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            try {
                // Save OTP first
                await user.save();

                // Then send email
                await sendEmail(
                    email,
                    'Login OTP',
                    `Your OTP for login is: ${otp}\n\nThis code will expire in 10 minutes.`
                );

                res.json({ 
                    message: 'OTP sent to email',
                    email: email // Send back email for OTP verification
                });
            } catch (emailError) {
                // If email fails, remove OTP from user
                user.otp = undefined;
                user.otpExpiry = undefined;
                await user.save();

                console.error('Email sending error:', emailError);
                return res.status(500).json({ 
                    message: 'Failed to send OTP email. Please try again.',
                    error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Register handler
    async register(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const { name, email, password } = req.body;

            // Check if user exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            user = new User({
                name,
                email,
                password: hashedPassword
            });

            await user.save();
            res.json({ message: 'Registration successful' });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // OTP verification handler
    async verifyOTP(req, res) {
        try {
            const { email, otp } = req.body;

            // Input validation
            if (!email || !otp) {
                return res.status(400).json({ message: 'Email and OTP are required' });
            }

            // Find user
            const user = await User.findOne({ 
                email,
                otp,
                otpExpiry: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(401).json({ message: 'Invalid or expired OTP' });
            }

            // Clear OTP
            user.otp = undefined;
            user.otpExpiry = undefined;
            await user.save();

            // Generate JWT
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                token,
                userId: user._id,
                message: 'Login successful'
            });
        } catch (error) {
            console.error('OTP verification error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = authController; 