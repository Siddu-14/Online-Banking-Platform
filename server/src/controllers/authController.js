const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');

const prisma = new PrismaClient();

const registerSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const otpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

function generateAccountNumber() {
    const prefix = '1000';
    const random = Math.floor(100000 + Math.random() * 900000);
    return prefix + random.toString();
}

async function register(req, res) {
    try {
        const data = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                passwordHash,
                account: {
                    create: {
                        accountNumber: generateAccountNumber(),
                        balance: 0,
                    },
                },
            },
            include: { account: true },
        });

        res.status(201).json({
            message: 'Registration successful! Please login.',
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                accountNumber: user.account.accountNumber,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Register error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
}

async function login(req, res) {
    try {
        const data = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(data.password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate OTP (simulated - always 123456)
        const otpCode = '123456';
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: { otpCode, otpExpiry },
        });

        console.log(`🔐 OTP for ${user.email}: ${otpCode}`);

        res.json({
            message: 'OTP sent to your registered contact',
            requiresOtp: true,
            email: user.email,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
}

async function verifyOtp(req, res) {
    try {
        const data = otpSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.otpCode || !user.otpExpiry) {
            return res.status(400).json({ message: 'No OTP request found. Please login again.' });
        }

        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please login again.' });
        }

        if (user.otpCode !== data.otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Clear OTP
        const accessToken = generateAccessToken({ userId: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

        await prisma.user.update({
            where: { id: user.id },
            data: { otpCode: null, otpExpiry: null, refreshToken },
        });

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            message: 'Login successful',
            accessToken,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'OTP verification failed' });
    }
}

async function refreshAccessToken(req, res) {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        const decoded = verifyRefreshToken(token);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user || user.refreshToken !== token) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        // Rotate tokens
        const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
        const newRefreshToken = generateRefreshToken({ userId: user.id, role: user.role });

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
}

async function logout(req, res) {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            const decoded = verifyRefreshToken(token).catch(() => null);
            if (decoded) {
                await prisma.user.updateMany({
                    where: { refreshToken: token },
                    data: { refreshToken: null },
                });
            }
        }

        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    }
}

module.exports = { register, login, verifyOtp, refreshAccessToken, logout };
