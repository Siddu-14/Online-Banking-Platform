const express = require('express');
const { getTransactions, getTransactionStats } = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getTransactions);
router.get('/stats', getTransactionStats);

module.exports = router;
