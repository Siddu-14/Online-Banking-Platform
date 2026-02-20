const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const depositSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    description: z.string().optional(),
});

const withdrawSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    description: z.string().optional(),
});

const transferSchema = z.object({
    recipientAccountNumber: z.string().min(1, 'Recipient account number is required'),
    amount: z.number().positive('Amount must be positive'),
    description: z.string().optional(),
});

async function getAccount(req, res) {
    try {
        const account = await prisma.account.findUnique({
            where: { userId: req.user.id },
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.json({ account });
    } catch (error) {
        console.error('Get account error:', error);
        res.status(500).json({ message: 'Failed to fetch account' });
    }
}

async function deposit(req, res) {
    try {
        const data = depositSchema.parse(req.body);

        const account = await prisma.account.findUnique({
            where: { userId: req.user.id },
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const [updatedAccount, transaction] = await prisma.$transaction([
            prisma.account.update({
                where: { id: account.id },
                data: { balance: { increment: data.amount } },
            }),
            prisma.transaction.create({
                data: {
                    fromAccountId: account.id,
                    type: 'DEPOSIT',
                    amount: data.amount,
                    description: data.description || 'Cash deposit',
                    status: 'COMPLETED',
                },
            }),
        ]);

        res.json({
            message: 'Deposit successful',
            balance: updatedAccount.balance,
            transaction,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Deposit error:', error);
        res.status(500).json({ message: 'Deposit failed' });
    }
}

async function withdraw(req, res) {
    try {
        const data = withdrawSchema.parse(req.body);

        const account = await prisma.account.findUnique({
            where: { userId: req.user.id },
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        if (account.balance < data.amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const [updatedAccount, transaction] = await prisma.$transaction([
            prisma.account.update({
                where: { id: account.id },
                data: { balance: { decrement: data.amount } },
            }),
            prisma.transaction.create({
                data: {
                    fromAccountId: account.id,
                    type: 'WITHDRAW',
                    amount: data.amount,
                    description: data.description || 'Cash withdrawal',
                    status: 'COMPLETED',
                },
            }),
        ]);

        res.json({
            message: 'Withdrawal successful',
            balance: updatedAccount.balance,
            transaction,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Withdraw error:', error);
        res.status(500).json({ message: 'Withdrawal failed' });
    }
}

async function transfer(req, res) {
    try {
        const data = transferSchema.parse(req.body);

        const senderAccount = await prisma.account.findUnique({
            where: { userId: req.user.id },
        });

        if (!senderAccount) {
            return res.status(404).json({ message: 'Sender account not found' });
        }

        if (senderAccount.balance < data.amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const recipientAccount = await prisma.account.findUnique({
            where: { accountNumber: data.recipientAccountNumber },
        });

        if (!recipientAccount) {
            return res.status(404).json({ message: 'Recipient account not found' });
        }

        if (senderAccount.id === recipientAccount.id) {
            return res.status(400).json({ message: 'Cannot transfer to your own account' });
        }

        const [updatedSender, , senderTxn] = await prisma.$transaction([
            prisma.account.update({
                where: { id: senderAccount.id },
                data: { balance: { decrement: data.amount } },
            }),
            prisma.account.update({
                where: { id: recipientAccount.id },
                data: { balance: { increment: data.amount } },
            }),
            prisma.transaction.create({
                data: {
                    fromAccountId: senderAccount.id,
                    toAccountId: recipientAccount.id,
                    type: 'TRANSFER',
                    amount: data.amount,
                    description: data.description || `Transfer to ${data.recipientAccountNumber}`,
                    status: 'COMPLETED',
                },
            }),
        ]);

        res.json({
            message: 'Transfer successful',
            balance: updatedSender.balance,
            transaction: senderTxn,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Transfer error:', error);
        res.status(500).json({ message: 'Transfer failed' });
    }
}

module.exports = { getAccount, deposit, withdraw, transfer };
