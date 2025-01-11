const User = require('../models/User');
const Transaction = require('../models/Transaction');

const upiController = {
    // Transfer money
    async transfer(req, res) {
        try {
            console.log('Transfer request body:', req.body);
            const { receiverUpiId, amount, description } = req.body;
            const senderId = req.user.userId;

            // Input validation
            if (!receiverUpiId || !amount) {
                return res.status(400).json({ 
                    message: 'Receiver UPI ID and amount are required' 
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
                return res.status(404).json({ message: 'Receiver UPI ID not found' });
            }

            // Check if sender has sufficient balance
            if (sender.balance < amount) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }

            // Create and save transaction
            const transaction = new Transaction({
                sender: senderId,
                receiver: receiver._id,
                amount: parseFloat(amount),
                description: description || 'Transfer'
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
                transaction: {
                    id: transaction._id,
                    amount: transaction.amount,
                    description: transaction.description,
                    timestamp: transaction.createdAt
                }
            });

        } catch (error) {
            console.error('Transfer error:', error);
            res.status(500).json({ message: 'Transfer failed', error: error.message });
        }
    },

    // Get transactions
    async getTransactions(req, res) {
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
            console.error('Get transactions error:', error);
            res.status(500).json({ message: 'Failed to fetch transactions' });
        }
    },

    // Get balance
    async getBalance(req, res) {
        try {
            const userId = req.user.userId;
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ balance: user.balance });
        } catch (error) {
            console.error('Get balance error:', error);
            res.status(500).json({ message: 'Failed to fetch balance' });
        }
    }
};

module.exports = upiController; 