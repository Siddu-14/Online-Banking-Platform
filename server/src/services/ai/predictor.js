/**
 * AI Spending Predictor
 * Uses linear regression and moving averages to forecast future spending.
 */

/**
 * Simple linear regression: y = mx + b
 * Returns { slope, intercept, r2 }
 */
function linearRegression(points) {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    points.forEach(({ x, y }) => {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
    });

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // R² calculation
    const ssRes = points.reduce((sum, { x, y }) => sum + Math.pow(y - (slope * x + intercept), 2), 0);
    const ssTot = points.reduce((sum, { y }) => sum + Math.pow(y - sumY / n, 2), 0);
    const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

    return { slope, intercept, r2: parseFloat(r2.toFixed(4)) };
}

/**
 * Calculate moving average for an array of values.
 */
function movingAverage(values, window) {
    if (values.length < window) return values;
    const result = [];
    for (let i = 0; i <= values.length - window; i++) {
        const sum = values.slice(i, i + window).reduce((a, b) => a + b, 0);
        result.push(parseFloat((sum / window).toFixed(2)));
    }
    return result;
}

/**
 * Generate spending predictions from transaction history.
 * @param {Array} transactions - All user transactions
 * @param {Object} account - User account info
 * @returns Prediction report
 */
function predictSpending(transactions, account) {
    if (transactions.length < 3) {
        return {
            hasEnoughData: false,
            message: 'Need at least 3 transactions for predictions.',
            predictions: null,
        };
    }

    // Group expenses by day
    const dailyExpenses = {};
    const dailyIncome = {};
    const now = new Date();

    transactions.forEach((txn) => {
        const dateKey = new Date(txn.createdAt).toISOString().split('T')[0];
        if (txn.type === 'WITHDRAW' || txn.type === 'TRANSFER') {
            dailyExpenses[dateKey] = (dailyExpenses[dateKey] || 0) + txn.amount;
        }
        if (txn.type === 'DEPOSIT') {
            dailyIncome[dateKey] = (dailyIncome[dateKey] || 0) + txn.amount;
        }
    });

    // Create daily data points for regression
    const sortedDates = Object.keys(dailyExpenses).sort();
    const expensePoints = sortedDates.map((date, idx) => ({
        x: idx,
        y: dailyExpenses[date],
        date,
    }));

    // Linear regression for spending trend
    const regression = linearRegression(expensePoints);

    // Calculate averages
    const expenseValues = Object.values(dailyExpenses);
    const incomeValues = Object.values(dailyIncome);

    const avgDailyExpense = expenseValues.length > 0
        ? expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length : 0;
    const avgDailyIncome = incomeValues.length > 0
        ? incomeValues.reduce((a, b) => a + b, 0) / incomeValues.length : 0;

    // 7-day moving average
    const ma7 = movingAverage(expenseValues, Math.min(7, expenseValues.length));

    // Project next 30 days
    const projectedDays = 30;
    const lastX = expensePoints.length - 1;
    const futureProjection = [];
    for (let i = 1; i <= projectedDays; i++) {
        const futureDate = new Date(now);
        futureDate.setDate(futureDate.getDate() + i);
        const projectedExpense = Math.max(0, regression.slope * (lastX + i) + regression.intercept);
        futureProjection.push({
            date: futureDate.toISOString().split('T')[0],
            projectedExpense: parseFloat(projectedExpense.toFixed(2)),
        });
    }

    const projectedMonthlySpend = futureProjection.reduce((s, d) => s + d.projectedExpense, 0);
    const projectedMonthlySave = (avgDailyIncome * 30) - projectedMonthlySpend;

    // Spending trend
    let trend = 'stable';
    if (regression.slope > 50) trend = 'increasing';
    else if (regression.slope < -50) trend = 'decreasing';

    // Budget recommendations
    const recommendations = [];
    if (trend === 'increasing') {
        recommendations.push({
            type: 'warning',
            icon: '📈',
            message: 'Your spending is trending upward. Consider setting a daily budget.',
        });
    }
    if (projectedMonthlySave < 0) {
        recommendations.push({
            type: 'alert',
            icon: '🚨',
            message: 'Projected expenses exceed income. Review your spending categories.',
        });
    } else if (projectedMonthlySave > 0) {
        recommendations.push({
            type: 'positive',
            icon: '✅',
            message: `You're on track to save approximately ₹${projectedMonthlySave.toFixed(0)} this month.`,
        });
    }
    if (avgDailyExpense > avgDailyIncome && avgDailyIncome > 0) {
        recommendations.push({
            type: 'warning',
            icon: '⚠️',
            message: 'Daily expenses exceed daily income. Consider reducing discretionary spending.',
        });
    }
    if (recommendations.length === 0) {
        recommendations.push({
            type: 'positive',
            icon: '👍',
            message: 'Your spending patterns look healthy. Keep it up!',
        });
    }

    return {
        hasEnoughData: true,
        predictions: {
            projectedMonthlySpend: parseFloat(projectedMonthlySpend.toFixed(2)),
            projectedMonthlySavings: parseFloat(projectedMonthlySave.toFixed(2)),
            avgDailyExpense: parseFloat(avgDailyExpense.toFixed(2)),
            avgDailyIncome: parseFloat(avgDailyIncome.toFixed(2)),
            trend,
            trendConfidence: regression.r2,
            movingAverage7Day: ma7,
            futureProjection,
            recommendations,
        },
        model: {
            type: 'Linear Regression + Moving Average',
            version: '1.0.0',
            dataPoints: expensePoints.length,
            rSquared: regression.r2,
        },
    };
}

module.exports = { predictSpending, linearRegression, movingAverage };
