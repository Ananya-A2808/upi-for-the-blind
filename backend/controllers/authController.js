const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, sendSMS } = require('../utils/smsUtil');

const register = async (req, res) => {
    try {
        const { name, phone, password } = req.body;

        // Check if user exists
        const [existingUsers] = await global.db.execute(
            'SELECT * FROM users WHERE phone = ?',
            [phone]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const [result] = await global.db.execute(
            'INSERT INTO users (name, phone, password) VALUES (?, ?, ?)',
            [name, phone, hashedPassword]
        );

        // Generate OTP
        const otp = generateOTP();
        await global.db.execute(
            'INSERT INTO otp_logs (user_id, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
            [result.insertId, otp]
        );

        // Send OTP
        await sendSMS(phone, `Your OTP is: ${otp}`);

        res.status(201).json({ message: 'Registration successful, please verify OTP' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Check user exists
        const [users] = await global.db.execute(
            'SELECT * FROM users WHERE phone = ?',
            [phone]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate OTP
        const otp = generateOTP();
        await global.db.execute(
            'INSERT INTO otp_logs (user_id, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
            [user.id, otp]
        );

        // Send OTP
        await sendSMS(phone, `Your OTP is: ${otp}`);

        res.json({ message: 'OTP sent for verification' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        // Get user
        const [users] = await global.db.execute(
            'SELECT * FROM users WHERE phone = ?',
            [phone]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const user = users[0];

        // Verify OTP
        const [otpRecords] = await global.db.execute(
            'SELECT * FROM otp_logs WHERE user_id = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [user.id, otp]
        );

        if (otpRecords.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, phone: user.phone },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    verifyOTP
}; 