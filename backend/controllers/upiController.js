const User = require('../models/User');
const Transaction = require('../models/Transaction');

const upiController = {
    // Transfer money
    async transfer(req, res) {
        try {
            const { receiverUpiId, amount, note } = req.body;
            const senderId = req.user.userId;

            // Input validation
            if (!receiverUpiId || !amount || amount <= 0) {
                return res.status(400).json({ 
                    message: 'Invalid transfer details' 
                });
            }

            // Find sender
            const sender = await User.findById(senderId);
            if (!sender) {
                return res.status(404).json({ message: 'Sender not found' });
            }

            // Find receiver
            const receiver = await User.findOne({ upiId: receiverUpiId });
            if (!receiver) {
                return res.status(404).json({ message: 'Receiver not found' });
            }

            // Check sufficient balance
            if (sender.balance < amount) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }

            // Create transaction
            const transaction = new Transaction({
                sender: senderId,
                receiver: receiver._id,
                amount: parseFloat(amount),
                note: note || 'UPI Transfer'
            });

            // Update balances
            sender.balance -= parseFloat(amount);
            receiver.balance += parseFloat(amount);

            // Save all changes
            await Promise.all([
                transaction.save(),
                sender.save(),
                receiver.save()
            ]);

            res.json({
                message: 'Transfer successful',
                transactionId: transaction._id,
                amount: transaction.amount
            });

        } catch (error) {
            console.error('Transfer error:', error);
            res.status(500).json({ message: 'Transfer failed' });
        }
    },

    // Get transactions
    async getTransactions(req, res) {
        try {
            const userId = req.user.userId;
            const limit = parseInt(req.query.limit) || 10;

            const transactions = await Transaction.find({
                $or: [{ sender: userId }, { receiver: userId }]
            })
            .populate('sender', 'name upiId')
            .populate('receiver', 'name upiId')
            .sort({ createdAt: -1 })
            .limit(limit);

            res.json(transactions);
        } catch (error) {
            console.error('Get transactions error:', error);
            res.status(500).json({ message: 'Failed to fetch transactions' });
        }
    },

    // Get balance
    async getBalance(req, res) {
        try {
            const userId = req.user.userId;
            const user = await User.findById(userId).select('balance');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ balance: user.balance });
        } catch (error) {
            console.error('Get balance error:', error);
            res.status(500).json({ message: 'Failed to fetch balance' });
        }
    },

    // Get user profile
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const user = await User.findById(userId).select('-password -otp -otpExpiry');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                name: user.name,
                email: user.email,
                upiId: user.upiId,
                balance: user.balance
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: 'Failed to fetch profile' });
        }
    },

    // Validate QR code
    async validateQR(req, res) {
        try {
            const { qrData } = req.body;
            
            // Basic QR validation
            if (!qrData || !qrData.upiId) {
                return res.status(400).json({ message: 'Invalid QR code' });
            }

            // Find receiver by UPI ID
            const receiver = await User.findOne({ upiId: qrData.upiId })
                .select('name upiId');

            if (!receiver) {
                return res.status(404).json({ message: 'Receiver not found' });
            }

            res.json({
                name: receiver.name,
                upiId: receiver.upiId,
                amount: qrData.amount || 0,
                note: qrData.note || ''
            });
        } catch (error) {
            console.error('Validate QR error:', error);
            res.status(500).json({ message: 'Failed to validate QR code' });
        }
    },

    // Process payment
    async processPayment(req, res) {
        try {
            const userId = req.user.userId;
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                name: user.name,
                upiId: user.upiId,
                balance: user.balance
            });
        } catch (error) {
            console.error('Process payment error:', error);
            res.status(500).json({ message: 'Failed to process payment' });
        }
    },

    // Get transaction history
    async getTransactionHistory(req, res) {
        try {
            const userId = req.user.userId;
            const transactions = await Transaction.find({
                $or: [{ sender: userId }, { receiver: userId }]
            })
            .populate('sender', 'name upiId')
            .populate('receiver', 'name upiId')
            .sort({ createdAt: -1 })
            .limit(20);

            res.json(transactions);
        } catch (error) {
            console.error('Get transaction history error:', error);
            res.status(500).json({ message: 'Failed to fetch transaction history' });
        }
    }
};

module.exports = upiController; 