const express = require('express');
const { getCategorization, getFraudAlerts, chat, getPredictions, getInsights } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/categorize', getCategorization);
router.get('/fraud-alerts', getFraudAlerts);
router.post('/chat', chat);
router.get('/predictions', getPredictions);
router.get('/insights', getInsights);

module.exports = router;
