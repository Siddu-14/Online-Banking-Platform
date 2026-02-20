const { PrismaClient } = require('@prisma/client');
const { categorizeTransactions, analyzeAccountActivity, generateResponse, predictSpending } = require('../services/ai');

const prisma = new PrismaClient();

// Helper: get account + recent transactions for a user
async function getUserData(userId) {
    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) return null;

    const transactions = await prisma.transaction.findMany({
        where: {
            OR: [{ fromAccountId: account.id }, { toAccountId: account.id }],
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });

    // Normalize type relative to user
    const normalized = transactions.map((txn) => ({
        ...txn,
        type: txn.type === 'TRANSFER' && txn.toAccountId === account.id ? 'DEPOSIT' : txn.type,
    }));

    return { account, transactions: normalized };
}

// GET /api/ai/categorize
async function getCategorization(req, res) {
    try {
        const data = await getUserData(req.user.id);
        if (!data) return res.status(404).json({ message: 'Account not found' });

        const result = categorizeTransactions(data.transactions);
        res.json(result);
    } catch (error) {
        console.error('AI Categorization error:', error);
        res.status(500).json({ message: 'Failed to categorize transactions' });
    }
}

// GET /api/ai/fraud-alerts
async function getFraudAlerts(req, res) {
    try {
        const data = await getUserData(req.user.id);
        if (!data) return res.status(404).json({ message: 'Account not found' });

        const result = analyzeAccountActivity(data.transactions, data.account);
        res.json(result);
    } catch (error) {
        console.error('AI Fraud detection error:', error);
        res.status(500).json({ message: 'Failed to analyze transactions' });
    }
}

// POST /api/ai/chat
async function chat(req, res) {
    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ message: 'Message is required' });
        }

        const data = await getUserData(req.user.id);

        // Build stats for context
        let stats = null;
        if (data) {
            let totalIncome = 0, totalExpense = 0;
            data.transactions.forEach((txn) => {
                if (txn.type === 'DEPOSIT') totalIncome += txn.amount;
                else totalExpense += txn.amount;
            });
            stats = { totalIncome, totalExpense };
        }

        const context = {
            account: data?.account,
            recentTransactions: data?.transactions?.slice(0, 10),
            stats,
        };

        const result = generateResponse(message, context);
        res.json(result);
    } catch (error) {
        console.error('AI Chat error:', error);
        res.status(500).json({ message: 'Chatbot failed to respond' });
    }
}

// GET /api/ai/predictions
async function getPredictions(req, res) {
    try {
        const data = await getUserData(req.user.id);
        if (!data) return res.status(404).json({ message: 'Account not found' });

        const result = predictSpending(data.transactions, data.account);
        res.json(result);
    } catch (error) {
        console.error('AI Prediction error:', error);
        res.status(500).json({ message: 'Failed to generate predictions' });
    }
}

// GET /api/ai/insights — combined dashboard data
async function getInsights(req, res) {
    try {
        const data = await getUserData(req.user.id);
        if (!data) return res.status(404).json({ message: 'Account not found' });

        const [categorization, fraudAnalysis, predictions] = await Promise.all([
            Promise.resolve(categorizeTransactions(data.transactions)),
            Promise.resolve(analyzeAccountActivity(data.transactions, data.account)),
            Promise.resolve(predictSpending(data.transactions, data.account)),
        ]);

        res.json({
            categorization,
            fraudAnalysis,
            predictions,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('AI Insights error:', error);
        res.status(500).json({ message: 'Failed to generate AI insights' });
    }
}

module.exports = { getCategorization, getFraudAlerts, chat, getPredictions, getInsights };
