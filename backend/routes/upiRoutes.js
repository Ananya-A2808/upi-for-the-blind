const express = require('express');
const router = express.Router();
const upiController = require('../controllers/upiController');
const auth = require('../middleware/auth');

// Debug route
router.get('/test', (req, res) => {
    res.json({ message: 'UPI routes are working' });
});

// Protected routes
router.use(auth);

// Transfer money
router.post('/transfer', async (req, res) => {
    console.log('Transfer request received:', req.body);
    await upiController.transfer(req, res);
});

// Get balance
router.get('/balance', async (req, res) => {
    console.log('Balance request received');
    await upiController.getBalance(req, res);
});

// Get transactions
router.get('/transactions', async (req, res) => {
    console.log('Transactions request received');
    await upiController.getTransactions(req, res);
});

module.exports = router; 