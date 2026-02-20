const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const updateProfileSchema = z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
});

async function getProfile(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                account: {
                    select: {
                        accountNumber: true,
                        balance: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
}

async function updateProfile(req, res) {
    try {
        const data = updateProfileSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data,
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        });

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
}

module.exports = { getProfile, updateProfile };
