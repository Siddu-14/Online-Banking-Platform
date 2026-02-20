/**
 * AI Fraud Detector
 * Statistical anomaly detection for suspicious transaction patterns.
 * Assigns a risk score (0–100) with alert reasons.
 */

const RISK_THRESHOLDS = {
    LOW: 25,
    MEDIUM: 50,
    HIGH: 75,
    CRITICAL: 90,
};

/**
 * Analyze a single transaction for fraud indicators.
 * @param {Object} transaction - Current transaction
 * @param {Array} history - User's recent transaction history
 * @param {Object} account - User's account data
 * @returns {{ riskScore, riskLevel, alerts, recommendation }}
 */
function analyzeTransaction(transaction, history, account) {
    const alerts = [];
    let riskScore = 0;

    // 1. High amount relative to user average
    if (history.length > 0) {
        const avgAmount = history.reduce((sum, t) => sum + t.amount, 0) / history.length;
        const stdDev = Math.sqrt(
            history.reduce((sum, t) => sum + Math.pow(t.amount - avgAmount, 2), 0) / history.length
        );

        if (transaction.amount > avgAmount + 3 * (stdDev || avgAmount * 0.5)) {
            riskScore += 35;
            alerts.push({
                type: 'HIGH_AMOUNT',
                severity: 'high',
                message: `Transaction amount ₹${transaction.amount.toLocaleString()} is significantly above your average of ₹${avgAmount.toFixed(0)}`,
                icon: '⚠️',
            });
        } else if (transaction.amount > avgAmount + 2 * (stdDev || avgAmount * 0.5)) {
            riskScore += 15;
            alerts.push({
                type: 'ELEVATED_AMOUNT',
                severity: 'medium',
                message: `Transaction amount is above your typical spending pattern`,
                icon: '📊',
            });
        }
    }

    // 2. Large withdrawal ratio (>50% of balance)
    if (
        (transaction.type === 'WITHDRAW' || transaction.type === 'TRANSFER') &&
        account?.balance > 0
    ) {
        const ratio = transaction.amount / account.balance;
        if (ratio > 0.5) {
            riskScore += 25;
            alerts.push({
                type: 'LARGE_WITHDRAWAL',
                severity: 'high',
                message: `This transaction is ${(ratio * 100).toFixed(0)}% of your total balance`,
                icon: '🏦',
            });
        }
    }

    // 3. Rapid transactions (3+ within 5 minutes)
    if (history.length >= 2) {
        const fiveMinAgo = new Date(new Date(transaction.createdAt).getTime() - 5 * 60 * 1000);
        const recentCount = history.filter(
            (t) => new Date(t.createdAt) >= fiveMinAgo
        ).length;
        if (recentCount >= 3) {
            riskScore += 20;
            alerts.push({
                type: 'RAPID_TRANSACTIONS',
                severity: 'medium',
                message: `${recentCount} transactions detected in the last 5 minutes`,
                icon: '⚡',
            });
        }
    }

    // 4. Unusual hours (1 AM – 5 AM)
    const hour = new Date(transaction.createdAt).getHours();
    if (hour >= 1 && hour <= 5) {
        riskScore += 15;
        alerts.push({
            type: 'UNUSUAL_HOURS',
            severity: 'low',
            message: `Transaction at unusual hour (${hour}:00)`,
            icon: '🌙',
        });
    }

    // 5. Round number suspicion (large round amounts)
    if (transaction.amount >= 10000 && transaction.amount % 1000 === 0) {
        riskScore += 5;
        alerts.push({
            type: 'ROUND_AMOUNT',
            severity: 'info',
            message: `Large round amount detected: ₹${transaction.amount.toLocaleString()}`,
            icon: '🔢',
        });
    }

    // Cap score at 100
    riskScore = Math.min(100, riskScore);

    // Determine risk level
    let riskLevel = 'low';
    if (riskScore >= RISK_THRESHOLDS.CRITICAL) riskLevel = 'critical';
    else if (riskScore >= RISK_THRESHOLDS.HIGH) riskLevel = 'high';
    else if (riskScore >= RISK_THRESHOLDS.MEDIUM) riskLevel = 'medium';

    // Generate recommendation
    let recommendation = 'Transaction appears normal.';
    if (riskLevel === 'critical') recommendation = 'Immediate review recommended. Consider freezing account.';
    else if (riskLevel === 'high') recommendation = 'Manual verification suggested before processing.';
    else if (riskLevel === 'medium') recommendation = 'Monitor account for further unusual activity.';

    return {
        transactionId: transaction.id,
        riskScore,
        riskLevel,
        alerts,
        recommendation,
        analyzedAt: new Date().toISOString(),
    };
}

/**
 * Analyze all recent transactions for an account.
 * Returns fraud analysis summary with overall risk assessment.
 */
function analyzeAccountActivity(transactions, account) {
    if (!transactions.length) {
        return {
            overallRisk: 'low',
            overallScore: 0,
            alerts: [],
            analyzedTransactions: 0,
            summary: 'No recent activity to analyze.',
        };
    }

    const analyses = transactions.map((txn, idx) => {
        const priorHistory = transactions.slice(idx + 1); // older transactions
        return analyzeTransaction(txn, priorHistory, account);
    });

    const flagged = analyses.filter((a) => a.riskScore >= RISK_THRESHOLDS.MEDIUM);
    const overallScore = Math.round(
        analyses.reduce((sum, a) => sum + a.riskScore, 0) / analyses.length
    );

    let overallRisk = 'low';
    if (overallScore >= 60 || flagged.length >= 3) overallRisk = 'high';
    else if (overallScore >= 30 || flagged.length >= 1) overallRisk = 'medium';

    return {
        overallRisk,
        overallScore,
        flaggedTransactions: flagged,
        totalAnalyzed: analyses.length,
        flaggedCount: flagged.length,
        allAnalyses: analyses,
        summary: flagged.length > 0
            ? `${flagged.length} suspicious transaction(s) detected out of ${analyses.length} analyzed.`
            : `All ${analyses.length} transactions appear normal.`,
    };
}

module.exports = { analyzeTransaction, analyzeAccountActivity, RISK_THRESHOLDS };
