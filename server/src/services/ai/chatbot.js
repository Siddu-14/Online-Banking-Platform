/**
 * AI Chatbot — Intent-based NLP with pattern matching.
 * Handles banking queries using keyword extraction and generates
 * natural-language responses with live account data.
 */

const INTENTS = {
    greeting: {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'howdy', 'greetings', 'sup', 'yo'],
        responses: [
            "Hello! 👋 I'm NexusBot, your AI banking assistant. How can I help you today?",
            "Hi there! Welcome to NexusBank support. What can I do for you?",
            "Hey! I'm here to help with your banking needs. Ask me anything!",
        ],
    },
    balance: {
        patterns: ['balance', 'how much money', 'account balance', 'my balance', 'available balance', 'funds', 'how much do i have', 'check balance', 'money left'],
        responses: ['DYNAMIC_BALANCE'],
    },
    transactions: {
        patterns: ['recent transactions', 'last transactions', 'transaction history', 'show transactions', 'spending history', 'what did i spend', 'recent activity'],
        responses: ['DYNAMIC_TRANSACTIONS'],
    },
    spending: {
        patterns: ['spending', 'how much spent', 'expenses', 'spending summary', 'expense report', 'money spent', 'spending analysis', 'where is my money going'],
        responses: ['DYNAMIC_SPENDING'],
    },
    transfer: {
        patterns: ['transfer money', 'send money', 'how to transfer', 'make a transfer', 'pay someone', 'send funds'],
        responses: [
            "To transfer money:\n1. Go to the **Transfer** page\n2. Enter the recipient's account number\n3. Enter the amount and description\n4. Click **Send Money**\n\nMake sure you have sufficient balance! 💸",
        ],
    },
    deposit: {
        patterns: ['deposit', 'add money', 'deposit money', 'how to deposit', 'add funds', 'put money'],
        responses: [
            "To deposit money:\n1. Go to the **Deposit** page\n2. Select a quick amount or enter a custom amount\n3. Add an optional description\n4. Click **Deposit**\n\nYour balance will update instantly! 💰",
        ],
    },
    fraud: {
        patterns: ['fraud', 'suspicious', 'unauthorized', 'scam', 'hacked', 'stolen', 'security', 'fraud alert', 'suspicious activity'],
        responses: [
            "🔒 For security concerns:\n• Check the **AI Insights** page for fraud alerts\n• Review your recent transactions immediately\n• If you see unauthorized transactions, change your password\n• Contact support if you believe your account is compromised\n\nYour account is protected by our AI fraud detection system.",
        ],
    },
    help: {
        patterns: ['help', 'what can you do', 'commands', 'options', 'features', 'assist', 'support', 'guide'],
        responses: [
            "I can help you with:\n\n💰 **Balance** — Check your account balance\n📊 **Spending** — View spending analysis\n📜 **Transactions** — See recent transactions\n💸 **Transfer** — Guide you through transfers\n🏦 **Deposit** — Help with deposits\n🔒 **Security** — Fraud & security info\n📈 **Predictions** — Spending forecasts\n\nJust ask me anything!",
        ],
    },
    predictions: {
        patterns: ['predict', 'forecast', 'future spending', 'will i spend', 'prediction', 'next month', 'budget', 'savings'],
        responses: ['DYNAMIC_PREDICTION'],
    },
    goodbye: {
        patterns: ['bye', 'goodbye', 'see you', 'thanks', 'thank you', 'exit', 'quit', 'close'],
        responses: [
            "Goodbye! 👋 Feel free to come back anytime you need help. Have a great day!",
            "Thanks for chatting! Your banking is in good hands. See you soon! 🏦",
        ],
    },
};

/**
 * Classify user message intent using keyword matching.
 * Returns { intent, confidence }
 */
function classifyIntent(message) {
    const lower = message.toLowerCase().trim();
    let bestIntent = 'unknown';
    let bestScore = 0;

    for (const [intent, { patterns }] of Object.entries(INTENTS)) {
        let score = 0;
        for (const pattern of patterns) {
            if (lower.includes(pattern)) {
                score += pattern.split(' ').length * 3; // Multi-word matches score higher
            }
        }
        // Exact match bonus
        if (patterns.includes(lower)) {
            score += 10;
        }

        if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
        }
    }

    const confidence = bestScore > 0 ? Math.min(0.98, 0.4 + bestScore * 0.06) : 0.1;

    return { intent: bestIntent, confidence: parseFloat(confidence.toFixed(2)) };
}

/**
 * Generate a chatbot response given user message and account context.
 * @param {string} message - User's message
 * @param {Object} context - { account, recentTransactions, stats }
 * @returns {{ response, intent, confidence, suggestions }}
 */
function generateResponse(message, context = {}) {
    const { intent, confidence } = classifyIntent(message);
    const { account, recentTransactions, stats } = context;

    let response = '';
    let suggestions = [];

    if (intent === 'unknown' || confidence < 0.3) {
        response =
            "I'm not sure I understand that. Could you try rephrasing? You can ask me about your **balance**, **transactions**, **spending**, **transfers**, or type **help** to see all options.";
        suggestions = ['Check balance', 'Recent transactions', 'Help'];
        return { response, intent: 'unknown', confidence, suggestions };
    }

    const intentData = INTENTS[intent];
    const templateResponse = intentData.responses[Math.floor(Math.random() * intentData.responses.length)];

    // Handle dynamic responses that need account context
    switch (templateResponse) {
        case 'DYNAMIC_BALANCE':
            if (account) {
                const bal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(account.balance);
                response = `💰 Your current balance is **${bal}**.\n\nAccount: \`${account.accountNumber}\`\n\nWould you like to see your recent transactions or make a deposit?`;
                suggestions = ['Recent transactions', 'Deposit', 'Transfer'];
            } else {
                response = "I couldn't fetch your balance right now. Please check the Dashboard for the latest info.";
            }
            break;

        case 'DYNAMIC_TRANSACTIONS':
            if (recentTransactions && recentTransactions.length > 0) {
                const txnList = recentTransactions.slice(0, 5).map((t) => {
                    const sign = t.type === 'DEPOSIT' ? '+' : '-';
                    const amt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(t.amount);
                    return `• ${t.type} ${sign}${amt} — ${t.description || 'No description'}`;
                }).join('\n');
                response = `📜 **Recent Transactions:**\n\n${txnList}\n\n_Showing last ${Math.min(5, recentTransactions.length)} transactions._`;
                suggestions = ['Spending analysis', 'Check balance'];
            } else {
                response = "No recent transactions found. Make a deposit to get started!";
                suggestions = ['How to deposit', 'Help'];
            }
            break;

        case 'DYNAMIC_SPENDING':
            if (stats) {
                const inc = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.totalIncome || 0);
                const exp = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.totalExpense || 0);
                const net = (stats.totalIncome || 0) - (stats.totalExpense || 0);
                const netFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(net));
                response = `📊 **30-Day Spending Summary:**\n\n• Income: **${inc}**\n• Expenses: **${exp}**\n• Net: **${net >= 0 ? '+' : '-'}${netFmt}**\n\n${net >= 0 ? '✅ You\'re saving well!' : '⚠️ Your expenses exceed your income. Consider budgeting.'}`;
                suggestions = ['Predictions', 'Recent transactions'];
            } else {
                response = "I don't have enough data for a spending summary yet. Make some transactions first!";
            }
            break;

        case 'DYNAMIC_PREDICTION':
            if (stats && stats.totalExpense > 0) {
                const dailyAvg = stats.totalExpense / 30;
                const monthlyProjection = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(dailyAvg * 30);
                response = `📈 **Spending Prediction:**\n\nBased on your last 30 days:\n• Daily average: ₹${dailyAvg.toFixed(0)}\n• Projected monthly spend: **${monthlyProjection}**\n\n💡 _Check the AI Insights page for detailed predictions and category breakdowns._`;
                suggestions = ['Spending summary', 'Check balance'];
            } else {
                response = "Not enough transaction history to make predictions yet. Keep using NexusBank and I'll provide insights soon!";
            }
            break;

        default:
            response = templateResponse;
    }

    // Default suggestions
    if (suggestions.length === 0) {
        suggestions = ['Check balance', 'Recent transactions', 'Help'];
    }

    return { response, intent, confidence, suggestions };
}

module.exports = { generateResponse, classifyIntent, INTENTS };
