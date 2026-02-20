const express = require('express');
const { getAccount, deposit, withdraw, transfer } = require('../controllers/accountController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/me', getAccount);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.post('/transfer', transfer);

module.exports = router;
