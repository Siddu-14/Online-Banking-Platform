const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getTransactions(req, res) {
    try {
        const account = await prisma.account.findUnique({
            where: { userId: req.user.id },
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const type = req.query.type; // DEPOSIT, WITHDRAW, TRANSFER

        const where = {
            OR: [
                { fromAccountId: account.id },
                { toAccountId: account.id },
            ],
        };

        if (type) {
            where.type = type;
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    fromAccount: { select: { accountNumber: true, user: { select: { fullName: true } } } },
                    toAccount: { select: { accountNumber: true, user: { select: { fullName: true } } } },
                },
            }),
            prisma.transaction.count({ where }),
        ]);

        // Categorize transactions as credit/debit relative to the user
        const categorized = transactions.map((txn) => {
            let category = 'debit';
            if (txn.type === 'DEPOSIT') {
                category = 'credit';
            } else if (txn.type === 'TRANSFER' && txn.toAccountId === account.id) {
                category = 'credit';
            }

            return {
                ...txn,
                category,
            };
        });

        res.json({
            transactions: categorized,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Failed to fetch transactions' });
    }
}

async function getTransactionStats(req, res) {
    try {
        const account = await prisma.account.findUnique({
            where: { userId: req.user.id },
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const transactions = await prisma.transaction.findMany({
            where: {
                OR: [
                    { fromAccountId: account.id },
                    { toAccountId: account.id },
                ],
                createdAt: { gte: thirtyDaysAgo },
            },
            orderBy: { createdAt: 'asc' },
        });

        let totalDeposits = 0;
        let totalWithdrawals = 0;
        let totalTransfersOut = 0;
        let totalTransfersIn = 0;

        const dailyData = {};

        transactions.forEach((txn) => {
            const dateKey = txn.createdAt.toISOString().split('T')[0];
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = { date: dateKey, income: 0, expense: 0 };
            }

            if (txn.type === 'DEPOSIT') {
                totalDeposits += txn.amount;
                dailyData[dateKey].income += txn.amount;
            } else if (txn.type === 'WITHDRAW') {
                totalWithdrawals += txn.amount;
                dailyData[dateKey].expense += txn.amount;
            } else if (txn.type === 'TRANSFER') {
                if (txn.fromAccountId === account.id) {
                    totalTransfersOut += txn.amount;
                    dailyData[dateKey].expense += txn.amount;
                } else {
                    totalTransfersIn += txn.amount;
                    dailyData[dateKey].income += txn.amount;
                }
            }
        });

        res.json({
            stats: {
                totalDeposits,
                totalWithdrawals,
                totalTransfersOut,
                totalTransfersIn,
                totalIncome: totalDeposits + totalTransfersIn,
                totalExpense: totalWithdrawals + totalTransfersOut,
            },
            chartData: Object.values(dailyData),
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Failed to fetch statistics' });
    }
}

module.exports = { getTransactions, getTransactionStats };
