const express = require('express');
const router = express.Router();
const { initiate, confirm, getHistory } = require('../controllers/transactionController');
const auth = require('../middleware/auth');

router.post('/initiate', auth, initiate);
router.post('/confirm', auth, confirm);
router.get('/history', auth, getHistory);

module.exports = router; 