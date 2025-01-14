const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // For face images

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'blind_upi'
});

// Test database connection
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to database successfully');
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shreelakshmisomshekar@gmail.com',
    pass: 'hgxi wkbt hfvz vbro'
  }
});

// Test email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email setup error:', error);
  } else {
    console.log('Email server is ready');
  }
});

// Simple email sending function
async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: '"Blind UPI" <shreelakshmisomshekar@gmail.com>',
      to: to,
      subject: subject,
      text: text
    });
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

// Signup API
app.post('/api/signup', async (req, res) => {
  try {
    console.log('Received signup data:', req.body);
    const { name, email, initial_balance } = req.body;
    
    // Basic validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Valid name is required' });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    if (initial_balance === undefined || initial_balance === null || isNaN(initial_balance)) {
      return res.status(400).json({ message: 'Valid initial balance is required' });
    }

    const balance = parseFloat(initial_balance);
    
    // Create user
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, balance) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), balance]
    );

    console.log('User created:', result.insertId);

    // Send welcome email
    await sendEmail(
      email,
      'Welcome to Blind UPI',
      `Welcome ${name}!\nYour account has been created with a balance of ₹${balance}`
    );

    res.json({ 
      message: 'Signup successful!',
      userId: result.insertId 
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed: ' + error.message });
  }
});

// Start login process
app.post('/api/login/start', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Login attempt for:', email);

    // Find user
    const [users] = await db.promise().query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp, 'for user:', users[0].id);

    // Save OTP
    await db.promise().query(
      'INSERT INTO otps (user_id, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))',
      [users[0].id, otp]
    );

    console.log('OTP saved to database');

    // Send OTP
    await sendEmail(
      email,
      'Login OTP',
      `Your OTP for Blind UPI login is: ${otp}`
    );

    console.log('OTP email sent');

    res.json({
      message: 'OTP sent successfully',
      userId: users[0].id
    });

  } catch (error) {
    console.error('Login start failed:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify login
app.post('/api/login/verify', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    console.log('Verifying OTP:', { userId, otp });

    // Check OTP
    const [otpRecord] = await db.promise().query(
      'SELECT * FROM otps WHERE user_id = ? AND otp = ? AND used = FALSE',
      [userId, otp]
    );

    console.log('OTP Record found:', otpRecord);

    if (otpRecord.length === 0) {
      console.log('No valid OTP found');
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark OTP as used
    await db.promise().query(
      'UPDATE otps SET used = TRUE WHERE id = ?',
      [otpRecord[0].id]
    );

    console.log('OTP marked as used');

    // Create token
    const token = jwt.sign(
      { userId: userId },
      'secret123',
      { expiresIn: '24h' }
    );

    console.log('Token created');

    res.json({
      message: 'Login successful',
      token: token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get user balance
app.get('/api/user-balance', authenticateToken, async (req, res) => {
  try {
    const [user] = await db.promise().query(
      'SELECT balance FROM users WHERE id = ?',
      [req.user.userId]
    );

    res.json({ balance: user[0].balance });
  } catch (error) {
    console.error('Balance fetch failed:', error);
    res.status(500).json({ message: 'Failed to get balance' });
  }
});

// Get all users except current user
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.promise().query(
      'SELECT id, name, email FROM users WHERE id != ?',
      [req.user.userId]
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// Transfer money
app.post('/api/transfer', authenticateToken, async (req, res) => {
  try {
    const { receiverEmail, amount } = req.body;
    const senderId = req.user.userId;

    // Get sender's balance
    const [sender] = await db.promise().query(
      'SELECT balance FROM users WHERE id = ?',
      [senderId]
    );

    if (!sender[0] || sender[0].balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Get receiver
    const [receiver] = await db.promise().query(
      'SELECT id FROM users WHERE email = ?',
      [receiverEmail]
    );

    if (!receiver[0]) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Perform transfer
    await db.promise().beginTransaction();
    try {
      // Deduct from sender
      await db.promise().query(
        'UPDATE users SET balance = balance - ? WHERE id = ?',
        [amount, senderId]
      );

      // Add to receiver
      await db.promise().query(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [amount, receiver[0].id]
      );

      await db.promise().commit();
      res.json({ message: 'Transfer successful' });
    } catch (err) {
      await db.promise().rollback();
      throw err;
    }
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Transfer failed' });
  }
});

// Initiate transfer
app.post('/api/transfer/initiate', authenticateToken, async (req, res) => {
  try {
    const { receiverEmail, amount } = req.body;
    const senderId = req.user.userId;

    // Check sender's balance
    const [sender] = await db.promise().query(
      'SELECT * FROM users WHERE id = ?',
      [senderId]
    );

    if (!sender[0] || sender[0].balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check receiver
    const [receiver] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [receiverEmail]
    );

    if (!receiver[0]) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP and transaction details
    await db.promise().query(
      'INSERT INTO otps (user_id, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))',
      [senderId, otp]
    );

    // Store pending transaction
    const [result] = await db.promise().query(
      'INSERT INTO pending_transactions (sender_id, receiver_id, amount, otp_id) VALUES (?, ?, ?, LAST_INSERT_ID())',
      [senderId, receiver[0].id, amount]
    );

    // Send OTP email
    await sendEmail(
      sender[0].email,
      'Transaction OTP',
      `Your OTP for sending ₹${amount} to ${receiverEmail} is: ${otp}\nThis OTP will expire in 5 minutes.`
    );

    res.json({ 
      message: 'OTP sent for verification',
      transactionId: result.insertId
    });

  } catch (error) {
    console.error('Transfer initiation error:', error);
    res.status(500).json({ message: 'Failed to initiate transfer' });
  }
});

// Complete transfer with OTP
app.post('/api/transfer/complete', authenticateToken, async (req, res) => {
  try {
    const { transactionId, otp } = req.body;
    const senderId = req.user.userId;

    // Verify OTP
    const [otpRecord] = await db.promise().query(
      'SELECT * FROM otps WHERE user_id = ? AND otp = ? AND used = FALSE AND expires_at > NOW()',
      [senderId, otp]
    );

    if (otpRecord.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Get transaction details
    const [transaction] = await db.promise().query(
      'SELECT * FROM pending_transactions WHERE id = ? AND sender_id = ? AND completed = FALSE',
      [transactionId, senderId]
    );

    if (transaction.length === 0) {
      return res.status(400).json({ message: 'Invalid transaction' });
    }

    // Start transaction
    await db.promise().beginTransaction();

    try {
      // Update balances
      await db.promise().query(
        'UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?',
        [transaction[0].amount, senderId, transaction[0].amount]
      );

      await db.promise().query(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [transaction[0].amount, transaction[0].receiver_id]
      );

      // Mark OTP as used
      await db.promise().query(
        'UPDATE otps SET used = TRUE WHERE id = ?',
        [otpRecord[0].id]
      );

      // Mark transaction as completed
      await db.promise().query(
        'UPDATE pending_transactions SET completed = TRUE WHERE id = ?',
        [transactionId]
      );

      // Get receiver's email for notification
      const [receiver] = await db.promise().query(
        'SELECT email, name FROM users WHERE id = ?',
        [transaction[0].receiver_id]
      );

      // Send confirmation emails
      await sendEmail(
        sender[0].email,
        'Transfer Successful',
        `You have successfully sent ₹${transaction[0].amount} to ${receiver[0].email}`
      );

      await sendEmail(
        receiver[0].email,
        'Money Received',
        `You have received ₹${transaction[0].amount} from ${sender[0].email}`
      );

      await db.promise().commit();
      res.json({ message: 'Transfer completed successfully' });
    } catch (err) {
      await db.promise().rollback();
      throw err;
    }
  } catch (error) {
    console.error('Transfer completion error:', error);
    res.status(500).json({ message: 'Transfer failed' });
  }
});

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'secret123', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
}); 