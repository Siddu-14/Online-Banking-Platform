const { categorizeTransactions } = require('./categorizer');
const { analyzeAccountActivity } = require('./fraudDetector');
const { generateResponse } = require('./chatbot');
const { predictSpending } = require('./predictor');

module.exports = {
    categorizeTransactions,
    analyzeAccountActivity,
    generateResponse,
    predictSpending,
};
