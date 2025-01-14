const initiate = async (req, res) => {
    try {
        const { receiverPhone, amount, type } = req.body;
        const senderId = req.user.id;

        // Get receiver
        const [receivers] = await global.db.execute(
            'SELECT id FROM users WHERE phone = ?',
            [receiverPhone]
        );

        if (receivers.length === 0) {
            return res.status(400).json({ message: 'Receiver not found' });
        }

        // Create transaction
        const [result] = await global.db.execute(
            'INSERT INTO transactions (sender_id, receiver_id, amount, transaction_type) VALUES (?, ?, ?, ?)',
            [senderId, receivers[0].id, amount, type]
        );

        res.json({ 
            message: 'Transaction initiated',
            transactionId: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const confirm = async (req, res) => {
    try {
        const { transactionId } = req.body;
        const userId = req.user.id;

        // Update transaction status
        await global.db.execute(
            'UPDATE transactions SET status = ? WHERE id = ? AND sender_id = ?',
            ['completed', transactionId, userId]
        );

        res.json({ message: 'Transaction completed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const [transactions] = await global.db.execute(
            `SELECT t.*, 
                    s.name as sender_name, s.phone as sender_phone,
                    r.name as receiver_name, r.phone as receiver_phone
             FROM transactions t
             JOIN users s ON t.sender_id = s.id
             JOIN users r ON t.receiver_id = r.id
             WHERE t.sender_id = ? OR t.receiver_id = ?
             ORDER BY t.created_at DESC`,
            [userId, userId]
        );

        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    initiate,
    confirm,
    getHistory
}; 