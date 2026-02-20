/**
 * AI Transaction Categorizer
 * Uses keyword-based scoring to classify transactions into spending categories.
 * Simulates ML classification with weighted pattern matching.
 */

const CATEGORIES = {
    'Food & Dining': {
        keywords: ['restaurant', 'food', 'pizza', 'burger', 'coffee', 'cafe', 'lunch', 'dinner', 'breakfast', 'groceries', 'swiggy', 'zomato', 'uber eats', 'dining', 'meal', 'snack', 'bakery', 'deli'],
        icon: '🍽️',
        color: '#f97316',
    },
    'Transport': {
        keywords: ['uber', 'ola', 'cab', 'taxi', 'fuel', 'petrol', 'diesel', 'metro', 'bus', 'train', 'flight', 'airline', 'parking', 'toll', 'transport', 'ride', 'travel'],
        icon: '🚗',
        color: '#3b82f6',
    },
    'Shopping': {
        keywords: ['amazon', 'flipkart', 'myntra', 'shop', 'store', 'mall', 'purchase', 'buy', 'order', 'electronics', 'clothing', 'fashion', 'online', 'retail'],
        icon: '🛍️',
        color: '#a855f7',
    },
    'Bills & Utilities': {
        keywords: ['electricity', 'water', 'gas', 'internet', 'wifi', 'broadband', 'phone', 'mobile', 'recharge', 'bill', 'utility', 'rent', 'emi', 'insurance', 'premium', 'subscription'],
        icon: '📄',
        color: '#ef4444',
    },
    'Entertainment': {
        keywords: ['movie', 'netflix', 'spotify', 'disney', 'hotstar', 'youtube', 'game', 'concert', 'event', 'ticket', 'theatre', 'music', 'streaming', 'entertainment'],
        icon: '🎬',
        color: '#ec4899',
    },
    'Health': {
        keywords: ['hospital', 'doctor', 'medicine', 'pharmacy', 'medical', 'clinic', 'health', 'gym', 'fitness', 'yoga', 'dental', 'eye', 'lab', 'test', 'checkup'],
        icon: '🏥',
        color: '#10b981',
    },
    'Education': {
        keywords: ['school', 'college', 'university', 'course', 'tutorial', 'book', 'tuition', 'exam', 'study', 'education', 'training', 'udemy', 'coursera', 'certification'],
        icon: '📚',
        color: '#6366f1',
    },
    'Salary & Income': {
        keywords: ['salary', 'income', 'wage', 'payment received', 'credit', 'bonus', 'dividend', 'interest', 'refund', 'cashback'],
        icon: '💰',
        color: '#22c55e',
    },
};

/**
 * Categorize a single transaction based on its description.
 * Returns { category, confidence, icon, color }
 */
function categorizeTransaction(transaction) {
    const description = (transaction.description || '').toLowerCase();
    const type = transaction.type;

    // Deposits are typically income
    if (type === 'DEPOSIT') {
        return {
            category: 'Salary & Income',
            confidence: 0.85,
            ...CATEGORIES['Salary & Income'],
        };
    }

    let bestCategory = 'Other';
    let bestScore = 0;

    for (const [category, { keywords }] of Object.entries(CATEGORIES)) {
        let score = 0;
        for (const keyword of keywords) {
            if (description.includes(keyword)) {
                // Longer keyword matches are weighted higher
                score += keyword.length * 2;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
        }
    }

    const confidence = bestScore > 0 ? Math.min(0.95, 0.5 + bestScore * 0.05) : 0.3;

    return {
        category: bestCategory,
        confidence: parseFloat(confidence.toFixed(2)),
        icon: CATEGORIES[bestCategory]?.icon || '📦',
        color: CATEGORIES[bestCategory]?.color || '#6b7280',
    };
}

/**
 * Batch categorize an array of transactions.
 * Returns category distribution summary + per-transaction categories.
 */
function categorizeTransactions(transactions) {
    const categorized = transactions.map((txn) => ({
        transactionId: txn.id,
        amount: txn.amount,
        description: txn.description,
        type: txn.type,
        ...categorizeTransaction(txn),
    }));

    // Build distribution summary
    const distribution = {};
    categorized.forEach(({ category, amount, icon, color }) => {
        if (!distribution[category]) {
            distribution[category] = { category, total: 0, count: 0, icon, color };
        }
        distribution[category].total += amount;
        distribution[category].count += 1;
    });

    return {
        transactions: categorized,
        distribution: Object.values(distribution).sort((a, b) => b.total - a.total),
        totalCategorized: categorized.length,
        modelVersion: '1.0.0',
        algorithm: 'Weighted Keyword Scoring',
    };
}

module.exports = { categorizeTransaction, categorizeTransactions, CATEGORIES };
